const db = require("../config/db");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

exports.GetAllUsers = async (req, res) => {
    try {
        const query = `
            SELECT 
                u.id, 
                u.username, 
                u.email, 
                u.foto, 
                u.role, 
                d.status,
                j.nama AS jurusan
            FROM users u
            LEFT JOIN daftar d ON u.id = d.users_id
            LEFT JOIN jurusan j ON d.accepted_jurusan_id = j.id
            WHERE u.role = 'user'
            ORDER BY u.id DESC
        `;

        const [rows] = await db.execute(query);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ 
            message: "Gagal mengambil data", 
            error: error.message 
        });
    }
};

exports.DeleteUser = async (req, res) => {
    const { id } = req.params;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [rows] = await connection.query(
            `SELECT u.foto, b.data_diri_id, b.data_keluarga_id 
             FROM users u 
             LEFT JOIN bio b ON u.id = b.users_id 
             WHERE u.id = ?`,
            [id]
        );

        if (rows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        const { foto, data_diri_id, data_keluarga_id } = rows[0];

        await connection.query("DELETE FROM bio WHERE users_id = ?", [id]);

        if (data_diri_id) {
            await connection.query("DELETE FROM data_diri WHERE id = ?", [data_diri_id]);
        }

        if (data_keluarga_id) {
            await connection.query("DELETE FROM data_keluarga WHERE id = ?", [data_keluarga_id]);
        }

        await connection.query("DELETE FROM users WHERE id = ?", [id]);

        if (foto && foto !== 'default-avatar.png') {
            const filePath = path.join(__dirname, "../public/avatars", foto);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await connection.commit();

        res.status(200).json({ message: "User dan seluruh data terkait berhasil dihapus" });

    } catch (error) {
        await connection.rollback();
        console.error("Error Delete User:", error);
        res.status(500).json({ 
            message: "Gagal menghapus user", 
            error: error.message 
        });
    } finally {
        connection.release(); 
    }
};

exports.ResetUserPassword = async (req, res) => {
    const { id } = req.params;
    const defaultPassword = "12345"; 
    
    try {
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(defaultPassword, salt);

        await db.execute("UPDATE users SET password = ? WHERE id = ?", [hashPassword, id]);
        
        res.status(200).json({ message: `Password berhasil direset menjadi: ${defaultPassword}` });
    } catch (error) {
        res.status(500).json({ message: "Gagal reset password", error: error.message });
    }
};

exports.calonSiswa = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        u.id,
        u.username,
        u.foto, 
        j.nama AS jurusan,
        p.total_harga,
        p.total_pembayaran,
        p.create_at
      FROM pembayaran p
      JOIN users u ON u.id = p.users_id
      JOIN daftar d ON d.id = p.daftar_id
      JOIN jurusan j ON j.id = d.accepted_jurusan_id
      WHERE p.status = 'lunas'
      ORDER BY p.create_at DESC
    `);

    res.json({
      success: true,
      total: rows.length,
      data: rows // Frontend akan membaca bagian ini
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data calon siswa"
    });
  }
};