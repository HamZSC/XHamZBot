global.siapaaku = global.siapaaku || {};

module.exports = async (sock, mek) => {
    const from = mek.key.remoteJid;

    // Cek jika game siapaaku lagi jalan di grup ini
    if (global.siapaaku[from]) {
        return sock.sendMessage(from, { 
            text: `⚠️ *GAME SEDANG BERJALAN!*\n\nSelesaikan dulu tebakan yang ini bro!` 
        }, { quoted: mek });
    }

    // DATABASE LOKAL SIAPA AKU
    const databaseSiapa = [
        { soal: "Aku punya sayap tapi bukan burung, aku bisa terbang tinggi, dan perutku diisi banyak orang.", jawaban: "pesawat", kategori: "Transportasi" },
        { soal: "Aku selalu berada di atas kepala presiden, menteri, bahkan guru, tapi aku tidak punya rambut.", jawaban: "peci", kategori: "Pakaian" },
        { soal: "Sering dipotong tapi tetap tumbuh, kalau dibiarkan panjang bisa jadi sarang kuman di ujung jari.", jawaban: "kuku", kategori: "Anggota Tubuh" },
        { soal: "Aku sebuah benda, kalau dibeli warnanya hitam, kalau dipakai warnanya merah, kalau dibuang warnanya abu-abu.", jawaban: "arang", kategori: "Benda" },
        { soal: "Aku punya mata banyak tapi tidak bisa melihat, badanku penuh duri tapi aku buah yang manis.", jawaban: "nanas", kategori: "Buah" },
        { soal: "Punya kaki empat tapi tidak bisa berjalan, sering dipakai buat menaruh makanan atau buat belajar.", jawaban: "meja", kategori: "Furnitur" },
        { soal: "Aku punya leher tapi tidak punya kepala, tugasku menjaga air tetap dingin atau panas di dalam diriku.", jawaban: "termos", kategori: "Benda Rumah Tangga" },
        { soal: "Aku bekerja di malam hari, memakai seragam, menjaga keamanan lingkungan rumah saat orang-orang tidur.", jawaban: "satpam", kategori: "Profesi" },
        { soal: "Aku sejenis hewan, kalau siang aku tidur menggantung terbalik, kalau malam aku keluar cari makan buah.", jawaban: "kelelawar", kategori: "Hewan" },
        { soal: "Aku kalau kering tidak berguna, tapi kalau basah kuyup barulah aku bisa membersihkan badanmu saat mandi.", jawaban: "handuk", kategori: "Benda" }
    ];

    try {
        const pilih = databaseSiapa[Math.floor(Math.random() * databaseSiapa.length)];

        // Simpan sesi game ke global variable
        global.siapaaku[from] = {
            jawaban: pilih.jawaban.toLowerCase().trim(),
            timeout: setTimeout(async () => {
                if (global.siapaaku[from]) {
                    await sock.sendMessage(from, { 
                        text: `⌛ *WAKTU HABIS!*\n\nGak ada yang bisa nebak. Jawabannya adalah: *${global.siapaaku[from].jawaban.toUpperCase()}*` 
                    });
                    delete global.siapaaku[from];
                }
            }, 60000) // 1 Menit
        };

        // Kirim soal ke grup
        const teksSoal = `🕵️‍♂️ *GAME SIAPA AKU?* 🕵️‍♂️\n\n` +
                          `📝 *Petunjuk:* _${pilih.soal}_\n` +
                          `🏷️ *Kategori:* ${pilih.kategori}\n` +
                          `🔢 *Jumlah Huruf:* ${pilih.jawaban.length} Karakter\n` +
                          `⏰ *Waktu:* 60 Detik!\n\n` +
                          `👉 _Langsung ketik jawabannya di grup/reply pesan ini!_`;

        await sock.sendMessage(from, { text: teksSoal }, { quoted: mek });

    } catch (e) {
        console.error(e);
        await sock.sendMessage(from, { text: '❌ Terjadi gangguan pada sistem Siapa Aku internal.' }, { quoted: mek });
    }
};
