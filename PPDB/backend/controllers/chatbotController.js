const db = require('../config/db');

exports.respond = async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ response: "Pesan tidak boleh kosong, ya!" });
  }

  try {
    const [rows] = await db.query('SELECT keywords, response FROM chatbot');
    const userText = message.toLowerCase();
    
    let botResponse = null;
    let isBad = false;

    // 1. Kumpulkan semua kemungkinan keyword ke dalam satu array objek
    let allKeywords = [];
    rows.forEach(row => {
      const keywordList = row.keywords.split(',').map(k => k.trim().toLowerCase());
      keywordList.forEach(kw => {
        allKeywords.push({
          keyword: kw,
          response: row.response
        });
      });
    });

    // 2. Sort keyword berdasarkan panjang karakter (paling panjang di atas)
    // Ini agar "bayar offline" lebih diprioritaskan daripada "bayar" saja
    allKeywords.sort((a, b) => b.keyword.length - a.keyword.length);

    // 3. Cari keyword di dalam text user
    for (const item of allKeywords) {
      if (userText.includes(item.keyword)) {
        botResponse = item.response;
        
        // Cek jika ini adalah kata buruk berdasarkan responnya
        if (botResponse.includes("mengetik yang sopan")) {
          isBad = true;
        }
        break; // Berhenti di keyword terpanjang yang ditemukan
      }
    }

    if (!botResponse) {
      botResponse = "aku... belum paham maksudmu. Bisa coba tanya yang lain? contohnya 'cara daftar', atau cara pembayaran :3";
    }

    return res.json({ response: botResponse, isBad: isBad });

  } catch (error) {
    console.error("Database Error:", error);
    return res.status(500).json({ response: "Waduh, server lagi pusing. Coba lagi nanti ya!" });
  }
};