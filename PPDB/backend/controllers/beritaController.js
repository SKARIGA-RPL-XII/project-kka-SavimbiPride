const db = require("../config/db");
const fs = require("fs");
const path = require("path");

exports.getAllBerita = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM berita");
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data berita" });
  }
};

exports.getBeritaById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT * FROM berita WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Berita tidak ditemukan" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

exports.tambahBerita = async (req, res) => {
  const { judul, deskripsi } = req.body;

  if (!judul || !deskripsi) {
    return res.status(400).json({ message: "Judul dan deskripsi wajib diisi" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "Gambar berita wajib diupload" });
  }

  const gambar = `/berita/${req.file.filename}`;

  try {
    await db.query(
      "INSERT INTO berita (judul, deskripsi, gambar) VALUES (?, ?, ?)",
      [judul, deskripsi, gambar]
    );

    res.status(201).json({ message: "Berita berhasil ditambahkan" });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(
        path.join(__dirname, "..", "public", "berita", req.file.filename)
      );
    }

    res.status(500).json({ message: "Gagal menambahkan berita" });
  }
};

exports.editBerita = async (req, res) => {
  const { id } = req.params;
  const { judul, deskripsi } = req.body;

  try {
    const [rows] = await db.query(
      "SELECT gambar FROM berita WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Berita tidak ditemukan" });
    }

    let gambar = rows[0].gambar;

    if (req.file) {
      const oldPath = path.join(__dirname, "..", "public", gambar);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
      gambar = `/berita/${req.file.filename}`;
    }

    await db.query(
      "UPDATE berita SET judul = ?, deskripsi = ?, gambar = ? WHERE id = ?",
      [judul, deskripsi, gambar, id]
    );

    res.status(200).json({ message: "Berita berhasil diupdate" });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(
        path.join(__dirname, "..", "public", "berita", req.file.filename)
      );
    }

    res.status(500).json({ message: "Gagal mengupdate berita" });
  }
};

exports.hapusBerita = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT gambar FROM berita WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Berita tidak ditemukan" });
    }

    const gambarPath = path.join(
      __dirname,
      "..",
      "public",
      rows[0].gambar
    );

    if (fs.existsSync(gambarPath)) {
      fs.unlinkSync(gambarPath);
    }

    await db.query("DELETE FROM berita WHERE id = ?", [id]);

    res.status(200).json({ message: "Berita berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus berita" });
  }
};
