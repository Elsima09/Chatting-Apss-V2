const mysql = require('mysql2');

const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'chat_app'
});

db.connect((err) => {
    if (err) {
        console.log('DB Error:', err);
    } else {
        console.log('MySQL Connected');
    }
});

module.exports = db;