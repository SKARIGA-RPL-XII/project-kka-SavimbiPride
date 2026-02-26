const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");
const db = require("../config/db");

exports.downloadBukti = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.query(`
      SELECT u.id AS user_id, u.username, j.nama AS jurusan
      FROM users u
      JOIN daftar d ON d.users_id = u.id
      LEFT JOIN jurusan j ON j.id = d.accepted_jurusan_id
      WHERE u.id = ?
      LIMIT 1
    `, [userId]);

    if (!rows.length) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    const data = rows[0];

    const doc = new PDFDocument({
      size: "A4",
      layout: "portrait"
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Bukti_Daftar.pdf"
    );

    doc.pipe(res);

    const templatePath = path.join(__dirname, "../public/tempelate.png");
    doc.image(templatePath, 0, 0, { width: 595 });

    doc.font("Helvetica-Bold").fillColor("#000000");
    doc.fontSize(22);

    doc.text(data.username, 190, 180);
    doc.text(data.jurusan || "-", 230, 200 + 70);
    doc.text(
         new Date().toLocaleDateString("id-ID"),
         360,
         230 + 70 * 2
        );

    doc.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal generate PDF" });
  }
};

exports.downloadBuktiPembayaran = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.query(`
      SELECT 
        u.username,
        j.nama AS jurusan,
        p.total_harga,
        p.status,
        d.update_at AS tanggal_diterima, 
        k.uang_gedung,
        k.harga_seragam,
        k.spp
      FROM pembayaran p
      JOIN users u ON u.id = p.users_id
      JOIN daftar d ON d.id = p.daftar_id
      LEFT JOIN jurusan j ON j.id = d.accepted_jurusan_id
      JOIN konfigurasi_harga k ON k.id = p.konfigurasi_harga_id
      WHERE p.users_id = ?
      LIMIT 1
    `, [userId]);

    if (!rows.length) {
      return res.status(404).json({ message: "Data pembayaran tidak ditemukan" });
    }

    const data = rows[0];
    const doc = new PDFDocument({ size: "A4", margin: 0 }); 

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=Bukti_Bayar_${userId}.pdf`);

    doc.pipe(res);

    const templatePath = path.join(__dirname, "../public/bayar.png");
    if (fs.existsSync(templatePath)) {
      doc.image(templatePath, 0, 0, { width: 595, height: 842 }); 
    }

    doc.font("Helvetica-Bold").fillColor("#000000");

    doc.fontSize(22).text(data.username || "-", 220, 190);
    doc.fontSize(22).text(data.jurusan || "-", 240, 270);

    const formatIDR = (val) => Number(val).toLocaleString("id-ID");
    
    doc.fontSize(22);
    doc.text(`Rp ${formatIDR(data.uang_gedung)}`, 290, 400);
    doc.text(`Rp ${formatIDR(data.harga_seragam)}`, 330, 490);
    doc.text(`Rp ${formatIDR(data.spp)}`, 160, 550);

    doc.fontSize(22).text(`Rp ${formatIDR(data.total_harga)}`, 180, 650);

    const tgl = data.tanggal_diterima 
      ? new Date(data.tanggal_diterima).toLocaleDateString("id-ID", {
          day: "numeric", month: "long", year: "numeric"
        })
      : "-";
    
    doc.fontSize(22).text(tgl, 300, 755);

    doc.end();

  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Gagal generate PDF custom" });
    }
  }
};