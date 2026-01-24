const db = require('../config/db'); // Koneksi database Anda
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mengambil secret key dari .env
const JWT_SECRET = process.env.JWT_SECRET;

exports.register = async (req, res) => {
    const { username, email, password } = req.body;

    // 1. Validasi input sederhana
    if (!username || !email || !password) {
        return res.status(400).json({ message: "Semua field harus diisi!" });
    }

    try {
        // 2. Cek apakah email sudah terdaftar
        const [existingUser] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: "Email sudah digunakan!" });
        }

        // 3. Hash password sebelum disimpan (Keamanan data)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Insert ke database
        // Kolom 'foto' dan 'role' otomatis terisi sesuai skema database
        const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        await db.promise().query(sql, [username, email, hashedPassword]);

        return res.status(201).json({ message: "Registrasi berhasil!" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    // 1. Validasi input sederhana
    if (!email || !password) {
        return res.status(400).json({ message: "Email dan password harus diisi!" });
    }

    try {
        // 2. Cari user berdasarkan email
        const [users] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ message: "Email atau Password salah!" });
        }

        const user = users[0];

        // 3. Bandingkan password input dengan hash di database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Email atau Password salah!" });
        }

        // 4. Generate JWT Token
        const token = jwt.sign(
            { id: user.id, role: user.role, username: user.username },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        // 5. Kirim respon sukses beserta token
        return res.status(200).json({
            message: "Login berhasil!",
            token: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role, // Membedakan akses Admin/User
                foto: user.foto
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
};