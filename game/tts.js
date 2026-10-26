global.tts = global.tts || {};

module.exports = async (sock, mek) => {
    const from = mek.key.remoteJid;

    // Cek jika game TTS lagi jalan di grup ini
    if (global.tts[from]) {
        return sock.sendMessage(from, { 
            text: `⚠️ *GAME SEDANG BERJALAN!*\n\nSelesaikan dulu soal TTS yang ini bro!` 
        }, { quoted: mek });
    }

    // DATABASE LOKAL (Anti 404 / Gak butuh internet internetan lagi bro!)
    const databaseLokal = [
        { soal: "Selesai sholat subuh, biasanya orang akan melihat...", jawaban: "matahari", deskripsi: "Ya bener kan, subuh ke pagi ya lihat matahari terbit!" },
        { soal: "Makan di luar pas hujan, yang basah apanya?", jawaban: "makanan", deskripsi: "Ya makanannya lah, kan makannya di luar gak pake atap wkwk" },
        { soal: "Benda apa yang kalau diikat baru bisa jalan?", jawaban: "sepatu", deskripsi: "Kalau tali sepatu gak diikat, lu bakal kesandung, gak bisa jalan!" },
        { soal: "Gajah apa yang belalainya pendek?", jawaban: "gajah pesek", deskripsi: "Nama juga gajah pesek, pasti pendek belalainya bro." },
        { soal: "Segitiga sama kaki, kalau kakinya satu lagi kemana?", jawaban: "pincang", deskripsi: "Kaki cuma satu mah namanya pincang nyet wkwk" },
        { soal: "Hewan apa yang paling tidak sopan?", jawaban: "kutu", deskripsi: "Sebab dia suka menginjak-injak kepala orang!" },
        { soal: "Kura-kura kalau tabrakan sama bus jadi apa?", jawaban: "rusak", deskripsi: "Mau bus mau kura-kura, kalau tabrakan ya pasti rusak!" },
        { soal: "Ular apa yang jalannya lurus, gak kelok-kelok?", jawaban: "ular mati", deskripsi: "Ular kalau udah mati ya kaku lurus doang bro wkwk" },
        { soal: "Kenapa motor berhenti di lampu merah?", jawaban: "direm", deskripsi: "Kalau gak direm ya tetep nyelonong nabrak orang lah!" },
        { soal: "Beli lampu tidur, pas dinyalain malah...", jawaban: "terang", deskripsi: "Lampu jenis apapun kalau dinyalain ya jadi terang!" }
    ];

    try {
        // Ambil soal acak dari database lokal
        const soal = databaseLokal[Math.floor(Math.random() * databaseLokal.length)];

        // Simpan sesi game ke global variable beserta timernya
        global.tts[from] = {
            jawaban: soal.jawaban.toLowerCase().trim(),
            soalText: soal.soal,
            timeout: setTimeout(async () => {
                if (global.tts[from]) {
                    await sock.sendMessage(from, { 
                        text: `⌛ *WAKTU HABIS!*\n\nGak ada yang bisa jawab TTS-nya. Jawabannya adalah: *${global.tts[from].jawaban.toUpperCase()}*\n💡 *Alasan:* _${soal.deskripsi}_` 
                    });
                    delete global.tts[from];
                }
            }, 60000) // Waktu menjawab 60 detik (1 menit)
        };

        // Kirim soal ke grup
        const teksSoal = `🧩 *GAME TEKA-TEKI SILANG (TTS)* 🧩\n\n` +
                          `📝 *Pertanyaan:* _${soal.soal}_\n` +
                          `🔢 *Jumlah Huruf:* ${soal.jawaban.length} Karakter\n` +
                          `⏰ *Waktu:* 60 Detik!\n\n` +
                          `👉 _Langsung ketik jawabannya di grup/reply pesan ini!_`;

        await sock.sendMessage(from, { text: teksSoal }, { quoted: mek });

    } catch (e) {
        console.error(e);
        await sock.sendMessage(from, { text: '❌ Terjadi gangguan pada sistem TTS internal. Coba lagi bro!' }, { quoted: mek });
    }
};
