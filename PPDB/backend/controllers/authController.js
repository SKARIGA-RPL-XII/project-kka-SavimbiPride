const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

exports.register = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "Semua field harus diisi!" });
    }

    try {
        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: "Email sudah digunakan!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const sql = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
        await db.query(sql, [username, email, hashedPassword, 'user']);

        return res.status(201).json({ message: "Registrasi berhasil!" });
    } catch (error) {
        console.error("Register Error:", error);
        return res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email dan password harus diisi!" });
    }

    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ message: "Email atau Password salah!" });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Email atau Password salah!" });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            message: "Login berhasil!",
            token: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                foto: user.foto
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email wajib diisi!" });
    }

    try {
        const [users] = await db.query('SELECT username FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(404).json({ message: "Email tidak ditemukan di database kami." });
        }

        return res.status(200).json({
            message: "Email ditemukan, permintaan reset sedang diproses.",
            username: users[0].username 
        });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        return res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
};