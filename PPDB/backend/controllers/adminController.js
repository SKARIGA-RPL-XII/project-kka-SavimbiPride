const fs = require('fs'); // <--- TAMBAHKAN INI
const path = require('path'); // <--- TAMBAHKAN INI
const bcrypt = require('bcrypt'); // Pastikan ini juga sudah ada
const db = require('../config/db'); // Sesuaikan dengan path koneksi DB kamu

exports.getIdAdmin = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query('SELECT id, username, email, foto, role FROM users WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: "Admin tidak ditemukan" });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.editAdmin = async (req, res) => {
    const { id } = req.params;
    const { username, email, password } = req.body;
    let newFoto = req.file ? req.file.filename : null;

    try {
        // 1. Ambil data admin lama
        const [rows] = await db.query('SELECT foto FROM users WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: "Admin tidak ditemukan" });
        
        const oldFoto = rows[0].foto;

        // 2. Logika Hapus Foto Lama (Hanya jika upload foto baru)
        if (newFoto && oldFoto) {
            // Path diarahkan ke root/public/avatars/namafile
            const oldPath = path.join(__dirname, '../public/avatars', oldFoto);
            
            // Cek apakah file benar-benar ada sebelum dihapus agar tidak crash
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath); 
            }
        }

        // 3. Susun Query Update
        let sql = 'UPDATE users SET username = ?, email = ?';
        let params = [username, email];

        if (newFoto) {
            sql += ', foto = ?';
            params.push(newFoto);
        }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            sql += ', password = ?';
            params.push(hashedPassword);
        }

        sql += ' WHERE id = ?';
        params.push(id);

        await db.query(sql, params);
        
        res.json({ 
            message: "Profil berhasil diperbarui!", 
            foto: newFoto || oldFoto 
        });

    } catch (error) {
        console.error(error); // Tambahkan log untuk debug di console
        
        // Cleanup: Jika DB error tapi file sudah terlanjur terupload, hapus file baru tersebut
        if (req.file) {
            const uploadedPath = path.join(__dirname, '../public/avatars', req.file.filename);
            if (fs.existsSync(uploadedPath)) fs.unlinkSync(uploadedPath);
        }
        res.status(500).json({ message: error.message });
    }
};