const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const db = require("../config/db");

exports.getProfile = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      `
      SELECT 
        u.id, u.username, u.email, u.foto, u.role,
        dd.jenis_kelamin, dd.tempat_lahir, dd.tanggal_lahir, dd.alamat, dd.no_telp, 
        dd.agama, dd.kewarganegaraan, dd.nama_sekolah, dd.alamat_sekolah, dd.tahun_lulus,
        dk.nama_ayah, dk.nama_ibu, dk.pekerjaan_ayah, dk.pekerjaan_ibu, 
        dk.penhir_ayah, dk.penhir_ibu, dk.no_telp_ayah, dk.no_telp_ibu,
        dk.penhas_ayah, dk.penhas_ibu
      FROM users u
      LEFT JOIN bio b ON b.users_id = u.id
      LEFT JOIN data_diri dd ON dd.id = b.data_diri_id
      LEFT JOIN data_keluarga dk ON dk.id = b.data_keluarga_id
      WHERE u.id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error Get Profile:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

exports.updateProfile = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const connection = await db.getConnection();
  const newFoto = req.file ? req.file.filename : null;

  try {
    await connection.beginTransaction();

    const [bioRows] = await connection.query(
      "SELECT data_diri_id, data_keluarga_id FROM bio WHERE users_id = ?",
      [id]
    );

    let dataDiriId, dataKeluargaId;

    if (bioRows.length === 0) {
      const [dd] = await connection.query("INSERT INTO data_diri (id) VALUES (NULL)");
      const [dk] = await connection.query("INSERT INTO data_keluarga (id) VALUES (NULL)");
      dataDiriId = dd.insertId;
      dataKeluargaId = dk.insertId;
      await connection.query(
        "INSERT INTO bio (users_id, data_diri_id, data_keluarga_id) VALUES (?, ?, ?)",
        [id, dataDiriId, dataKeluargaId]
      );
    } else {
      dataDiriId = bioRows[0].data_diri_id;
      dataKeluargaId = bioRows[0].data_keluarga_id;
    }

    const [userRows] = await connection.query("SELECT foto FROM users WHERE id = ?", [id]);
    if (userRows.length === 0) throw new Error("User tidak ditemukan");
    
    const oldFoto = userRows[0].foto;

    if (newFoto && oldFoto && oldFoto !== "default-avatar.png") {
      const oldPath = path.join(__dirname, "../public/avatars", oldFoto);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    let userSql = "UPDATE users SET username = ?, email = ?";
    let userParams = [data.username, data.email];

    if (newFoto) {
      userSql += ", foto = ?";
      userParams.push(newFoto);
    }

    if (data.password && data.password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      userParams.push(await bcrypt.hash(data.password, salt));
      userSql += ", password = ?";
    }

    userSql += " WHERE id = ?";
    userParams.push(id);
    await connection.query(userSql, userParams);

    await connection.query(
      `UPDATE data_diri SET 
        jenis_kelamin=?, tempat_lahir=?, tanggal_lahir=?, alamat=?, 
        no_telp=?, agama=?, kewarganegaraan=?, nama_sekolah=?, 
        alamat_sekolah=?, tahun_lulus=? 
       WHERE id=?`,
      [
        data.jenis_kelamin || null, data.tempat_lahir || null, data.tanggal_lahir || null,
        data.alamat || null, data.no_telp || null, data.agama || null,
        data.kewarganegaraan || null, data.nama_sekolah || null, 
        data.alamat_sekolah || null, data.tahun_lulus || null, dataDiriId
      ]
    );

    await connection.query(
      `UPDATE data_keluarga SET 
        nama_ayah=?, nama_ibu=?, pekerjaan_ayah=?, pekerjaan_ibu=?, 
        penhir_ayah=?, penhir_ibu=?, no_telp_ayah=?, no_telp_ibu=?,
        penhas_ayah=?, penhas_ibu=?
       WHERE id=?`,
      [
        data.nama_ayah || null, data.nama_ibu || null, 
        data.pekerjaan_ayah || null, data.pekerjaan_ibu || null,
        data.penhir_ayah || null, data.penhir_ibu || null,
        data.no_telp_ayah || null, data.no_telp_ibu || null,
        data.penhas_ayah || null, data.penhas_ibu || null,
        dataKeluargaId
      ]
    );

    await connection.commit();
    res.json({ message: "Profil berhasil diperbarui!", foto: newFoto || oldFoto });

  } catch (error) {
    await connection.rollback();
    if (req.file) { 
      const failPath = path.join(__dirname, "../public/avatars", req.file.filename);
      if (fs.existsSync(failPath)) fs.unlinkSync(failPath);
    }
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
};

exports.getPendaftaranData = async (req, res) => {
  const userid = req.user.id;

  try {
    const [rows] = await db.query(`
      SELECT 
        u.username,
        u.email,
        u.foto,

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
        dk.penhir_ayah,
        dk.penhir_ibu,
        dk.no_telp_ayah,
        dk.no_telp_ibu,
        dk.penhas_ayah,
        dk.penhas_ibu,

        d.status AS registrationStatus,
        d.foto_ijazah,
        d.accepted_jurusan_id,

        jacc.nama AS accepted_jurusan_nama,

        pb.status AS paymentStatus,

        p1.jurusan_id AS jurusan1,
        p2.jurusan_id AS jurusan2

      FROM users u

      LEFT JOIN bio b ON b.users_id = u.id
      LEFT JOIN data_diri dd ON dd.id = b.data_diri_id
      LEFT JOIN data_keluarga dk ON dk.id = b.data_keluarga_id

      LEFT JOIN daftar d 
        ON d.users_id = u.id

      -- ambil pembayaran TERAKHIR saja
      LEFT JOIN pembayaran pb 
        ON pb.daftar_id = d.id
        AND pb.id = (
          SELECT MAX(id) 
          FROM pembayaran 
          WHERE daftar_id = d.id
        )

      LEFT JOIN jurusan jacc 
        ON jacc.id = d.accepted_jurusan_id

      LEFT JOIN pilihan p1 
        ON d.id = p1.daftar_id AND p1.urutan = '1'

      LEFT JOIN pilihan p2 
        ON d.id = p2.daftar_id AND p2.urutan = '2'

      WHERE u.id = ?
      ORDER BY d.id DESC
      LIMIT 1
    `, [userid]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error("Error Get Pendaftaran Data:", error);
    res.status(500).json({ message: "Gagal mengambil data" });
  }
};

exports.getJurusan = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, nama FROM jurusan");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data jurusan" });
  }
};

exports.pendaftaran = async (req, res) => {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const userId = req.params.id;
    const { jurusan1, jurusan2 } = req.body;

    if (!jurusan1 || !jurusan2) {
      return res.status(400).json({ message: "Jurusan wajib diisi" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "File ijazah wajib diupload" });
    }

    const fotoIjazah = req.file.filename;

    // 🔹 Ambil bio_id dari tabel bio
    const [bioRows] = await conn.query(
      "SELECT id FROM bio WHERE users_id = ?",
      [userId]
    );

    if (bioRows.length === 0) {
      return res.status(400).json({ message: "Bio belum diisi" });
    }

    const bioId = bioRows[0].id;

    // 🔹 Insert ke tabel daftar
    const [daftarResult] = await conn.query(
      "INSERT INTO daftar (users_id, bio_id, foto_ijazah, status) VALUES (?, ?, ?, 'proses')",
      [userId, bioId, fotoIjazah]
    );

    const daftarId = daftarResult.insertId;

    // 🔹 Insert pilihan 1
    await conn.query(
      "INSERT INTO pilihan (jurusan_id, urutan, daftar_id) VALUES (?, '1', ?)",
      [jurusan1, daftarId]
    );

    // 🔹 Insert pilihan 2
    await conn.query(
      "INSERT INTO pilihan (jurusan_id, urutan, daftar_id) VALUES (?, '2', ?)",
      [jurusan2, daftarId]
    );

    await conn.commit();

    res.json({ message: "Pendaftaran berhasil" });

  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  } finally {
    conn.release();
  }
};