const db = require("../config/db");
const fs = require("fs");
const path = require("path");

exports.getAllJurusan = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM jurusan");
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data jurusan" });
  }
};

exports.getJurusanById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT * FROM jurusan WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Jurusan tidak ditemukan" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

exports.tambahJurusan = async (req, res) => {
  const { nama, deskripsi } = req.body;

  if (!nama || !deskripsi) {
    return res.status(400).json({ message: "Nama dan deskripsi wajib diisi" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "Gambar jurusan wajib diupload" });
  }

  const gambar = `/jurusan/${req.file.filename}`;

  try {
    await db.query(
      "INSERT INTO jurusan (nama, deskripsi, gambar) VALUES (?, ?, ?)",
      [nama, deskripsi, gambar]
    );

    res.status(201).json({ message: "Jurusan berhasil ditambahkan" });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(
        path.join(__dirname, "..", "public", "jurusan", req.file.filename)
      );
    }

    res.status(500).json({ message: "Gagal menambahkan jurusan" });
  }
};

exports.editJurusan = async (req, res) => {
  const { id } = req.params;
  const { nama, deskripsi } = req.body;

  try {
    const [rows] = await db.query(
      "SELECT gambar FROM jurusan WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Jurusan tidak ditemukan" });
    }

    let gambar = rows[0].gambar;

    if (req.file) {
      const oldPath = path.join(__dirname, "..", "public", gambar);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
      gambar = `/jurusan/${req.file.filename}`;
    }

    await db.query(
      "UPDATE jurusan SET nama = ?, deskripsi = ?, gambar = ? WHERE id = ?",
      [nama, deskripsi, gambar, id]
    );

    res.status(200).json({ message: "Jurusan berhasil diupdate" });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(
        path.join(__dirname, "..", "public", "jurusan", req.file.filename)
      );
    }

    res.status(500).json({ message: "Gagal mengupdate jurusan" });
  }
};

exports.hapusJurusan = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT gambar FROM jurusan WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Jurusan tidak ditemukan" });
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

    await db.query("DELETE FROM jurusan WHERE id = ?", [id]);

    res.status(200).json({ message: "Jurusan berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus jurusan" });
  }
};
