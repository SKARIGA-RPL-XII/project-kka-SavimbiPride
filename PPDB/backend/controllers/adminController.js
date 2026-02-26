const fs = require('fs');
const path = require('path'); 
const bcrypt = require('bcrypt'); 
const db = require('../config/db');

exports.dataSummary = async (req, res) => {
    try {
        // 1. Hitung Total Jurusan
        const [jurusan] = await db.execute("SELECT COUNT(*) as total FROM jurusan");
        
        // 2. Hitung Total User (Calon Siswa Terdaftar)
        const [users] = await db.execute("SELECT COUNT(*) as total FROM users WHERE role = 'user'");

        // 3. Hitung Calon Siswa dengan Status Pembayaran Lunas
        const [lunas] = await db.execute("SELECT COUNT(*) as total FROM pembayaran WHERE status = 'lunas'");

        // 4. Ambil Data Penghasilan per Bulan (6 bulan terakhir) untuk Chart
        const [penghasilan] = await db.execute(`
            SELECT 
                DATE_FORMAT(create_at, '%M') as bulan, 
                SUM(total_pembayaran) as total 
            FROM pembayaran 
            WHERE status = 'lunas' 
            GROUP BY bulan 
            ORDER BY create_at ASC 
            LIMIT 6
        `);

        res.status(200).json({
            totalJurusan: jurusan[0].total,
            totalUser: users[0].total,
            totalLunas: lunas[0].total,
            chartData: penghasilan
        });
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil ringkasan data", error: error.message });
    }
};

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

exports.getDataBayar = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                p.id, 
                u.username, 
                u.foto, 
                p.status, 
                p.total_harga 
            FROM pembayaran p
            JOIN daftar d ON p.daftar_id = d.id
            JOIN users u ON d.users_id = u.id
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getConfigHarga = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM konfigurasi_harga");

    if (rows.length === 0) {
      return res.json({ uang_gedung: 0, harga_seragam: 0, spp: 0 });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.saveConfigHarga = async (req, res) => {
  const { uang_gedung, harga_seragam, spp } = req.body;

  try {
    if (uang_gedung < 0 || harga_seragam < 0 || spp < 0) {
      return res.status(400).json({ message: "Harga tidak boleh negatif!" });
    }

    const [rows] = await db.query(
      "SELECT id FROM konfigurasi_harga WHERE id = 1"
    );

    if (rows.length === 0) {
      await db.query(
        "INSERT INTO konfigurasi_harga (id, uang_gedung, harga_seragam, spp) VALUES (1, ?, ?, ?)",
        [uang_gedung, harga_seragam, spp]
      );
    } else {
      await db.query(
        "UPDATE konfigurasi_harga SET uang_gedung=?, harga_seragam=?, spp=? WHERE id=1",
        [uang_gedung, harga_seragam, spp]
      );
    }

    res.json({ message: "Konfigurasi harga berhasil disimpan!" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.lunas = async (req, res) => {
    const { id } = req.params;
    const { total_pembayaran } = req.body; 

    try {
        const [result] = await db.query(
            'UPDATE pembayaran SET total_pembayaran = ?, status = "lunas" WHERE id = ?', 
            [total_pembayaran, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Data pembayaran tidak ditemukan" });
        }

        res.json({ message: "Pembayaran berhasil diverifikasi (LUNAS)" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};