const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const multer = require('multer');
const db = require('./config/db');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    if (file.fieldname === 'audio') {
        cb(null, 'audio_' + Date.now() + ext);
    } else {
        cb(null, 'image_' + Date.now() + ext);
    }
}
});

const upload = multer({ storage });

// Routing halaman
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/login.html'));
});

app.get('/users', (req, res) => {
    db.query(
        'SELECT id, username, status FROM users',
        (err, result) => {
            if (err) {
                return res.json([]);
            }
            res.json(result);
        }
    );
});

app.get('/last-seen/:username', (req, res) => {
    db.query(
        'SELECT last_seen FROM users WHERE username=?',
        [req.params.username],
        (err, result) => {
            if (err || result.length === 0) {
                return res.json({ last_seen: null });
            }

            res.json({
                last_seen: result[0].last_seen
            });
        }
    );
});

app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/chat.html'));
});
app.get('/register', (req,res)=>{
    res.sendFile(path.join(__dirname,'views/register.html'));
});
app.get('/messages/:user1/:user2', (req, res) => {
    const { user1, user2 } = req.params;

    db.query(
        `SELECT * FROM messages
         WHERE (sender=? AND receiver=?)
         OR (sender=? AND receiver=?)
         ORDER BY created_at ASC`,
        [user1, user2, user2, user1],
        (err, result) => {
            if (err) {
                return res.json([]);
            }
            res.json(result);
        }
    );
});

app.get('/last-messages/:me', (req, res) => {
    const me = req.params.me;

    db.query(`
        SELECT m1.*
        FROM messages m1
        INNER JOIN (
            SELECT
                CASE
                    WHEN sender = ? THEN receiver
                    ELSE sender
                END as chat_user,
                MAX(id) as latest_id
            FROM messages
            WHERE sender = ? OR receiver = ?
            GROUP BY chat_user
        ) m2
        ON (
            (
                (m1.sender = ? AND m1.receiver = m2.chat_user)
                OR
                (m1.receiver = ? AND m1.sender = m2.chat_user)
            )
            AND m1.id = m2.latest_id
        )
    `, [me, me, me, me, me], (err, result) => {
        if (err) {
            console.log(err);
            return res.json([]);
        }
        res.json(result);
    });
});

app.get('/unread/:me', (req, res) => {
    const me = req.params.me;

    db.query(`
        SELECT sender, COUNT(*) as total
        FROM messages
        WHERE receiver = ?
        AND (status IS NULL OR status != 'read')
        GROUP BY sender
    `, [me], (err, result) => {
        if (err) {
            console.log(err);
            return res.json([]);
        }

        res.json(result);
    });
});

app.post('/register', (req,res)=>{
    const {username,password}=req.body;

    db.query(
        'INSERT INTO users(username,password) VALUES(?,?)',
        [username,password],
        (err,result)=>{
            if(err){
                return res.json({
                    success:false,
                    message:'Username sudah dipakai'
                });
            }

            res.json({
                success:true,
                message:'Register berhasil'
            });
        }
    );
});

app.post('/login',(req,res)=>{
    const {username,password}=req.body;

    db.query(
        'SELECT * FROM users WHERE username=? AND password=?',
        [username,password],
        (err,result)=>{
            if(result.length>0){
                res.json({
                    success:true,
                    user:result[0]
                });
            }else{
                res.json({
                    success:false,
                    message:'Username / Password salah'
                });
            }
        }
    );
});

const onlineUsers = {};
const activeChats = {};

app.post('/upload-image', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.json({ success: false });
    }

    res.json({
        success: true,
        imageUrl: '/uploads/' + req.file.filename
    });
});

app.post('/upload-audio', upload.single('audio'), (req, res) => {
    if (!req.file) {
        return res.json({ success: false });
    }

    res.json({
        success: true,
        audioUrl: '/uploads/' + req.file.filename
    });
});
app.delete('/delete-message/:id', (req, res) => {
    db.query(
        'DELETE FROM messages WHERE id=?',
        [req.params.id],
        (err) => {
            if (err) {
                return res.json({ success:false });
            }

            io.emit('message_deleted', {
                id: req.params.id
            });

            res.json({ success:true });
        }
    );
});
io.on('connection', (socket) => {
    console.log('User Connected');

    socket.on('register_socket', (username) => {
        onlineUsers[username] = socket.id;
        console.log(username + " connected");
        io.emit('online_users', Object.keys(onlineUsers));
    });

    socket.on('open_chat', (data) => {
        console.log("OPEN CHAT:", data.username, "with", data.chattingWith);
    activeChats[data.username] = data.chattingWith;

    db.query(
        `UPDATE messages
         SET status='read'
         WHERE sender=? AND receiver=? 
         AND status!='read'`,
        [data.chattingWith, data.username],
        (err) => {
    if (err) {
        console.log(err);
        return;
    }

    const senderSocket = onlineUsers[data.chattingWith];

            if (senderSocket) {
                io.to(senderSocket).emit('messages_read', {
                    reader: data.username
                });
            }
        }
    );
});
socket.on('typing', (data) => {
    const receiverSocket = onlineUsers[data.receiver];

    if (receiverSocket) {
        io.to(receiverSocket).emit('show_typing', data);
    }
});
    socket.on('send_message', (data) => {

    db.query(
    'INSERT INTO messages(sender, receiver, message) VALUES (?, ?, ?)',
    [data.sender, data.receiver, data.message],
    (err, result) => {
            if (err) {
                console.log("DB insert error:", err);
                return;
            }
            data.id = result.insertId;

            const receiverSocket = onlineUsers[data.receiver];
            const senderSocket = onlineUsers[data.sender];

            if (receiverSocket) {

    if (activeChats[data.receiver] === data.sender) {
        data.status = 'read';

        db.query(
            `UPDATE messages 
             SET status='read'
             WHERE sender=? AND receiver=? AND message=?
             ORDER BY id DESC LIMIT 1`,
            [data.sender, data.receiver, data.message]
        );
    } else {
        data.status = 'delivered';

        db.query(
            `UPDATE messages 
             SET status='delivered'
             WHERE sender=? AND receiver=? AND message=?
             ORDER BY id DESC LIMIT 1`,
            [data.sender, data.receiver, data.message]
        );
    }

    io.to(receiverSocket).emit('receive_message', data);
}

            if (senderSocket) {
                io.to(senderSocket).emit('receive_message', data);
            }
        }
    );
});

    socket.on('disconnect', () => {
    for (let username in onlineUsers) {
        if (onlineUsers[username] === socket.id) {
            db.query(
    "UPDATE users SET last_seen = NOW() WHERE username=?",
    [username]
);
            delete onlineUsers[username];
            break;
        }
    }

    io.emit('online_users', Object.keys(onlineUsers));
    console.log('User disconnected');
});

});

server.listen(3000, '0.0.0.0', () => {
    console.log('Server running on port 3000');
});