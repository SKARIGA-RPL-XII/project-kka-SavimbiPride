const fs = require("fs");
const path = require("path");
const db = require("../config/db");

exports.GetAllDataUsers = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        d.id,
        d.users_id,
        d.foto_ijazah,
        d.status,
        d.update_at,

        u.username,
        u.email,
        u.foto

      FROM daftar d
      JOIN users u ON u.id = d.users_id
      WHERE d.status = 'proses'
      ORDER BY d.update_at DESC
    `);

    res.json(rows);

  } catch (error) {
    console.error("Error GetAllDataUsers:", error);
    res.status(500).json({ message: "Gagal mengambil data" });
  }
};

exports.GetDataUserById = async (req, res) => {
  const { id } = req.params; 

  try {
    const [rows] = await db.query(`
    SELECT 
      u.id AS user_id, 
      u.username, 
      u.email, 
      u.foto,

      d.id AS daftar_id, 
      d.foto_ijazah, 
      d.status,

      dd.jenis_kelamin, 
      dd.tempat_lahir, 
      dd.tanggal_lahir, 
      dd.alamat, 
      dd.no_telp, 
      dd.agama, 
      dd.kewarganegaraan, 
      dd.nama_sekolah, 
      dd.alamat_sekolah, 
      dd.tahun_lulus,

      dk.nama_ayah, 
      dk.nama_ibu, 
      dk.pekerjaan_ayah, 
      dk.pekerjaan_ibu, 
      dk.penhir_ayah, 
      dk.penhir_ibu, 
      dk.no_telp_ayah, 
      dk.no_telp_ibu, 
      dk.penhas_ayah, 
      dk.penhas_ibu,

      -- TAMBAHKAN DI SINI 🔥
      p1.jurusan_id AS jurusan1_id,
      j1.nama AS jurusan1_nama,

      p2.jurusan_id AS jurusan2_id,
      j2.nama AS jurusan2_nama

    FROM daftar d

    INNER JOIN bio b ON d.bio_id = b.id
    INNER JOIN users u ON b.users_id = u.id

    LEFT JOIN data_diri dd ON dd.id = b.data_diri_id
    LEFT JOIN data_keluarga dk ON dk.id = b.data_keluarga_id

    LEFT JOIN pilihan p1 
      ON p1.daftar_id = d.id AND p1.urutan = '1'

    LEFT JOIN jurusan j1 
      ON j1.id = p1.jurusan_id

    LEFT JOIN pilihan p2 
      ON p2.daftar_id = d.id AND p2.urutan = '2'

    LEFT JOIN jurusan j2 
      ON j2.id = p2.jurusan_id

    WHERE d.id = ? 
    AND d.status = 'proses'

    LIMIT 1
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Data pendaftaran tidak ditemukan atau status bukan 'proses'" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error Detail User:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

exports.changeStatus = async (req, res) => {
  const { id } = req.params;
  const { status, jurusan_id } = req.body;

  if (!["diterima", "tidak_diterima"].includes(status)) {
    return res.status(400).json({ message: "Status tidak valid" });
  }

  try {

    if (status === "diterima") {

      if (!jurusan_id) {
        return res.status(400).json({
          message: "Jurusan harus dipilih"
        });
      }

      await db.query(
        `UPDATE daftar
         SET status = 'diterima',
             accepted_jurusan_id = ?
         WHERE id = ?`,
        [jurusan_id, id]
      );

    } else {

      await db.query(
        `UPDATE daftar
         SET status = 'tidak_diterima',
             accepted_jurusan_id = NULL
         WHERE id = ?`,
        [id]
      );
    }

    res.json({ message: "Status berhasil diupdate" });

  } catch (error) {
    console.error("Error changeStatus:", error);
    res.status(500).json({ message: "Gagal mengubah status" });
  }
};
