# Aplikasi Chat Realtime 💬

Aplikasi chat realtime berbasis web yang terinspirasi dari WhatsApp.  
Website ini dibangun menggunakan **Node.js**, **Express.js**, **Socket.IO**, **MySQL**, serta **HTML, CSS, dan JavaScript**.

Aplikasi ini memungkinkan pengguna untuk berkomunikasi secara langsung (real-time) melalui pesan teks, berbagi gambar, voice note, reaction emoji, serta simulasi voice call.

---

## 📌 Fitur Utama

### 1. Autentikasi Pengguna
- Register akun baru
- Login akun
- Penyimpanan sesi menggunakan `localStorage`

### 2. Chat Realtime
- Mengirim pesan secara langsung tanpa refresh
- Menerima pesan secara realtime menggunakan Socket.IO
- Chat terbaru otomatis naik ke urutan paling atas

### 3. Fitur Pesan
- Indikator sedang mengetik (Typing...)
- Status pesan:
  - Terkirim
  - Delivered
  - Read
- Hapus pesan
- Reply pesan
- Reaction emoji pada chat
- Menu titik tiga pada setiap chat

### 4. Kirim Media
- Upload gambar
- Kirim voice note / audio
- Preview gambar dalam chat
- Pemutaran audio langsung di chat

### 5. Status Pengguna
- Online / Offline
- Last seen
- Deteksi chat yang sedang aktif

### 6. Kontak
- Pencarian kontak
- Menampilkan daftar kontak
- Preview pesan terakhir
- Badge jumlah pesan belum dibaca

### 7. Voice Call
- Popup panggilan masuk
- Tombol terima panggilan
- Tombol akhiri panggilan
- Timer durasi panggilan

> Catatan: Fitur voice call saat ini masih berupa simulasi tampilan (UI), belum mendukung komunikasi suara asli menggunakan mikrofon.

---

## 🛠️ Teknologi yang Digunakan

### Backend
- Node.js
- Express.js
- Socket.IO
- MySQL
- Multer

### Frontend
- HTML
- CSS
- JavaScript

### Database
- MySQL

---

## 📂 Struktur Folder

```bash
chat-app/
│
├── config/
│   └── db.js
│
├── public/
│   ├── uploads/
│   ├── style.css
│   └── script.js
│
├── views/
│   ├── login.html
│   ├── register.html
│   └── chat.html
│
├── server.js
├── package.json
└── README.md
```

---

## ⚙️ Cara Instalasi

### 1. Clone repository

```bash
git clone https://github.com/USERNAME/chat-app.git
```

### 2. Masuk ke folder project

```bash
cd chat-app
```

### 3. Install dependency

```bash
npm install
```

### 4. Buat database MySQL

Buat database:

```sql
CREATE DATABASE chat_app;
```

Import tabel yang dibutuhkan:
- users
- messages

Konfigurasi database pada file:

```javascript
config/db.js
```

Contoh konfigurasi:

```js
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'chat_app'
});

module.exports = db;
```

---

## ▶️ Menjalankan Aplikasi

Jalankan server:

```bash
node server.js
```

Aplikasi dapat diakses melalui:

```bash
http://localhost:3000
```

---

## 🗄️ Struktur Database

### Tabel users

| Field | Tipe |
|---|---|
| id | int |
| username | varchar |
| password | varchar |
| status | varchar |
| last_seen | datetime |

---

### Tabel messages

| Field | Tipe |
|---|---|
| id | int |
| sender | varchar |
| receiver | varchar |
| message | text |
| status | varchar |
| created_at | timestamp |

---

## 📷 Tampilan Aplikasi

Halaman yang tersedia:
- Halaman Login
- Halaman Register
- Halaman Chat
- Popup Voice Call

Fitur tampilan:
- Sidebar kontak
- Status online
- Realtime messaging
- Emoji reaction
- Upload media

---

## 🚀 Pengembangan Selanjutnya

Fitur yang dapat ditambahkan di masa depan:
- Voice call asli menggunakan WebRTC
- Video call
- Group chat
- Dark mode
- Enkripsi pesan
- Responsive mobile
- Push notification

---

## 👩‍💻 Developer

Dibuat oleh **Elsimawati Berutu**
