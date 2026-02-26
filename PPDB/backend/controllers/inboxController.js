const fs = require("fs");
const path = require("path");
const db = require("../config/db");

exports.GetInboxByUserId = async (req, res) => {
  try {
    const userId = req.user.id; 

    const [rows] = await db.query(
      `SELECT 
        id,
        tentang,
        pesan,
        is_read, -- ⬅️ Tambahkan ini
        create_at
       FROM inbox
       WHERE users_id = ?
       ORDER BY create_at DESC`,
      [userId]
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error GetInboxByUserId:", error);
    res.status(500).json({ message: "Gagal mengambil inbox" });
  }
};

exports.inbox = async (req, res) => {
  const { users_id, tentang, pesan } = req.body;

  if (!users_id || !tentang || !pesan) {
    return res.status(400).json({
      message: "Semua field harus diisi!"
    });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO inbox (users_id, tentang, pesan)
       VALUES (?, ?, ?)`,
      [users_id, tentang, pesan]
    );

    res.status(201).json({
      message: "Pesan berhasil dikirim",
      inbox_id: result.insertId
    });

  } catch (error) {
    console.error("Error kirim inbox:", error);
    res.status(500).json({ message: "Gagal mengirim pesan" });
  }
};

exports.markAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(
      "UPDATE inbox SET is_read = 1 WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Pesan tidak ditemukan" });
    }

    res.status(200).json({ message: "Pesan sudah dibaca" });
  } catch (error) {
    console.error("Error markAsRead:", error);
    res.status(500).json({ message: "Gagal mengupdate status pesan" });
  }
};

exports.status = async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT 
        d.status AS registrationStatus,
        pb.status AS payment_status
      FROM daftar d
      LEFT JOIN pembayaran pb 
        ON pb.daftar_id = d.id
        AND pb.id = (
          SELECT MAX(id)
          FROM pembayaran
          WHERE daftar_id = d.id
        )
      WHERE d.users_id = ?
      ORDER BY d.id DESC
      LIMIT 1
    `, [userId]);

    if (rows.length === 0) {
      return res.json({
        registrationStatus: null,
        payment_status: null
      });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error("Error getStatusPendaftaran:", error);
    res.status(500).json({
      message: "Gagal mengambil status pendaftaran"
    });
  }
};