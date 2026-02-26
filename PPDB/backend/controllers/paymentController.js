const db = require("../config/db");
const midtransClient = require("midtrans-client");
const crypto = require("crypto");
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

exports.dataPembayaran = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
        u.username,
        u.email,
        j.nama AS jurusan_diterima,
        kh.uang_gedung,
        kh.harga_seragam,
        kh.spp
      FROM users u
      JOIN daftar d ON d.users_id = u.id
      JOIN pilihan p ON p.daftar_id = d.id
      JOIN jurusan j ON j.id = p.jurusan_id
      JOIN konfigurasi_harga kh ON kh.id = 1
      WHERE u.id = ?
      AND d.status = 'diterima'
      LIMIT 1
    `;

    const [rows] = await db.query(query, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Data tidak ditemukan atau belum diterima",
      });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.submitPembayaran = async (req, res) => {
  try {
    const userId = req.user.id;
    const { total } = req.body;

    const orderId = `ORDER-${Date.now()}`;

    // Ambil daftar yang diterima
    const [daftarRows] = await db.query(
      `SELECT id FROM daftar 
       WHERE users_id = ? AND status = 'diterima' 
       LIMIT 1`,
      [userId]
    );

    if (daftarRows.length === 0) {
      return res.status(400).json({
        message: "User belum diterima",
      });
    }

    const daftarId = daftarRows[0].id;

    // Ambil konfigurasi harga
    const [hargaRows] = await db.query(
      `SELECT id FROM konfigurasi_harga LIMIT 1`
    );

    if (hargaRows.length === 0) {
      return res.status(400).json({
        message: "Konfigurasi harga belum tersedia",
      });
    }

    const konfigurasiHargaId = hargaRows[0].id;

    // Midtrans
    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: total,
      },
    };

    const transaction = await snap.createTransaction(parameter);
    const snapToken = transaction.token;

    // Simpan pembayaran
    await db.query(
      `INSERT INTO pembayaran 
      (users_id, daftar_id, konfigurasi_harga_id, kode_harga, total_harga, status, create_at)
      VALUES (?, ?, ?, ?, ?, 'proses', NOW())`,
      [userId, daftarId, konfigurasiHargaId, orderId, total]
    );

    res.json({ token: snapToken });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal membuat pembayaran" });
  }
};

exports.notifyPembayaran = async (req, res) => {
  try {
    const notification = req.body;

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = notification;

    // 🔐 1️⃣ Verifikasi Signature Key
    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    const hash = crypto
      .createHash("sha512")
      .update(order_id + status_code + gross_amount + serverKey)
      .digest("hex");

    if (hash !== signature_key) {
      return res.status(403).json({ message: "Invalid signature" });
    }

    // 2️⃣ Mapping status sesuai enum DB
    let status = "proses";

    if (transaction_status === "settlement") {
      status = "lunas";
    } else if (transaction_status === "capture") {
      if (fraud_status === "accept") {
        status = "lunas";
      }
    } else if (
      transaction_status === "cancel" ||
      transaction_status === "deny" ||
      transaction_status === "expire"
    ) {
      status = "gagal";
    } else if (transaction_status === "pending") {
      status = "proses";
    }

    // 3️⃣ Update pembayaran
    await db.query(
      "UPDATE pembayaran SET status = ?, total_pembayaran = ? WHERE kode_harga = ?",
      [status, gross_amount, order_id]
    );

    res.status(200).json({ message: "Notifikasi berhasil diproses" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error notif" });
  }
};

exports.getDataPembayaranOff = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.query(`
      SELECT 
        u.id AS users_id,
        u.username,
        d.id AS daftar_id,
        d.update_at AS tanggal_diterima, 
        j.nama AS jurusan,
        k.id AS konfigurasi_harga_id,
        k.uang_gedung,
        k.harga_seragam,
        k.spp,
        p.status
      FROM users u
      JOIN daftar d ON d.users_id = u.id
      LEFT JOIN jurusan j ON j.id = d.accepted_jurusan_id
      JOIN konfigurasi_harga k ON k.id = 1
      LEFT JOIN pembayaran p ON p.daftar_id = d.id
      WHERE u.id = ?
      AND d.status = 'diterima'
      LIMIT 1
    `, [userId]);

    if (!rows.length) {
      return res.status(404).json({ 
        message: "Kamu belum diterima atau data tidak ditemukan" 
      });
    }

    const data = rows[0];

    const total =
      Number(data.uang_gedung || 0) +
      Number(data.harga_seragam || 0) +
      Number(data.spp || 0);

    res.json({
      users_id: data.users_id,
      daftar_id: data.daftar_id,
      konfigurasi_harga_id: data.konfigurasi_harga_id,
      username: data.username,
      jurusan: data.jurusan || "-",
      tanggal_diterima: data.tanggal_diterima,
      uang_gedung: data.uang_gedung,
      harga_seragam: data.harga_seragam,
      spp: data.spp,
      total_harga: total,
      status_pembayaran: data.status
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal ambil data pembayaran" });
  }
};

exports.submitPembayaranOff = async (req, res) => {
  const userId = req.user.id;

  try {
    const [cek] = await db.query(
      `SELECT id FROM pembayaran WHERE users_id = ? LIMIT 1`,
      [userId]
    );

    if (cek.length > 0) {
      return res.status(400).json({
        message: "Sudah melakukan pembayaran"
      });
    }

    const [rows] = await db.query(`
      SELECT 
        d.id AS daftar_id,
        d.status,
        k.id AS konfigurasi_harga_id,
        k.uang_gedung,
        k.harga_seragam,
        k.spp
      FROM daftar d
      JOIN konfigurasi_harga k ON k.id = 1
      WHERE d.users_id = ?
      LIMIT 1
    `, [userId]);

    if (!rows.length) {
      return res.status(404).json({
        message: "Data tidak ditemukan"
      });
    }

    const data = rows[0];

    if (data.status !== "diterima") {
      return res.status(400).json({
        message: "Kamu belum diterima, tidak bisa melakukan pembayaran"
      });
    }

    const total =
      Number(data.uang_gedung || 0) +
      Number(data.harga_seragam || 0) +
      Number(data.spp || 0);

    await db.query(`
      INSERT INTO pembayaran 
      (users_id, daftar_id, konfigurasi_harga_id, total_harga, total_pembayaran, status, create_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `, [
      userId,
      data.daftar_id,
      data.konfigurasi_harga_id,
      total,
      0,
      "proses"
    ]);

    res.json({
      message: "Pembayaran offline berhasil dikirim",
      status: "proses"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal submit pembayaran"
    });
  }
};