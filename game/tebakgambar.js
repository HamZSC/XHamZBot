const axios = require('axios');
global.tebakgambar = global.tebakgambar || {};

module.exports = async (sock, mek) => {
    const from = mek.key.remoteJid;

    // Cek jika game tebakgambar lagi jalan di grup ini
    if (global.tebakgambar[from]) {
        return sock.sendMessage(from, { 
            text: `⚠️ *GAME SEDANG BERJALAN!*\n\nSelesaikan dulu tebakan gambar yang ini bro!` 
        }, { quoted: mek });
    }

    try {
        // Mengambil data tebak gambar acak dari API publik
        const res = await axios.get('https://raw.githubusercontent.com/BochilTeam/database/master/games/tebakgambar.json');
        const database = res.data;
        const soal = database[Math.floor(Math.random() * database.length)];

        // Simpan sesi game ke global variable
        global.tebakgambar[from] = {
            jawaban: soal.jawaban.toLowerCase().trim(),
            clue: soal.deskripsi,
            timeout: setTimeout(async () => {
                if (global.tebakgambar[from]) {
                    await sock.sendMessage(from, { 
                        text: `⌛ *WAKTU HABIS!*\n\nGak ada yang bisa nebak. Jawabannya adalah: *${global.tebakgambar[from].jawaban.toUpperCase()}*` 
                    });
                    delete global.tebakgambar[from];
                }
            }, 60000) // Waktu 1 menit
        };

        // KUNCI UTAMA: Teks "GAME TEBAK GAMBAR" wajib ada di caption agar fungsi pengecekan di function.js aktif!
        const teksSoal = `🎮 *GAME TEBAK GAMBAR* 🎮\n\n` +
                          `💡 *Petunjuk:* _${soal.deskripsi}_\n` +
                          `⏰ *Waktu:* 60 Detik!\n\n` +
                          `👉 _Langsung ketik jawabannya di grup/reply pesan ini!_`;

        await sock.sendMessage(from, { 
            image: { url: soal.img }, 
            caption: teksSoal 
        }, { quoted: mek });

    } catch (e) {
        console.error(e);
        await sock.sendMessage(from, { text: '❌ Gagal mengambil soal Gambar dari server. Coba lagi nanti bro!' }, { quoted: mek });
    }
};
