global.tebakbendera = global.tebakbendera || {};

module.exports = async (sock, mek) => {
    const from = mek.key.remoteJid;

    // Cek jika game tebakbendera lagi jalan di grup ini
    if (global.tebakbendera[from]) {
        return sock.sendMessage(from, { 
            text: `⚠️ *GAME SEDANG BERJALAN!*\n\nSelesaikan dulu tebak bendera yang ini bro!` 
        }, { quoted: mek });
    }

    // DATABASE LOKAL EMOJI BENDERA NEGARA
    const databaseBendera = [
        { bendera: "🇯🇵", jawaban: "jepang", benua: "Asia" },
        { bendera: "🇧🇷", jawaban: "brazil", benua: "Amerika Selatan" },
        { bendera: "🇩🇪", jawaban: "jerman", benua: "Eropa" },
        { bendera: "🇪🇬", jawaban: "mesir", benua: "Afrika" },
        { bendera: "🇸🇦", jawaban: "arab saudi", benua: "Asia / Timur Tengah" },
        { bendera: "🇫🇷", jawaban: "perancis", benua: "Eropa" },
        { bendera: "🇨🇦", jawaban: "kanada", benua: "Amerika Utara" },
        { bendera: "🇦🇺", jawaban: "australia", benua: "Australia / Oseania" },
        { bendera: "🇰🇷", jawaban: "korea selatan", benua: "Asia" },
        { bendera: "🇮🇹", jawaban: "italia", benua: "Eropa" },
        { bendera: "🇲🇦", jawaban: "maroko", benua: "Afrika" },
        { bendera: "🇲🇽", jawaban: "meksiko", benua: "Amerika Utara" },
        { bendera: "🇮🇳", jawaban: "india", benua: "Asia" },
        { bendera: "🇬🇧", jawaban: "inggris", benua: "Eropa" },
        { bendera: "🇹🇷", jawaban: "turki", benua: "Asia / Eropa" }
    ];

    try {
        const pilih = databaseBendera[Math.floor(Math.random() * databaseBendera.length)];

        // Simpan sesi game ke global variable
        global.tebakbendera[from] = {
            jawaban: pilih.jawaban.toLowerCase().trim(),
            timeout: setTimeout(async () => {
                if (global.tebakbendera[from]) {
                    await sock.sendMessage(from, { 
                        text: `⌛ *WAKTU HABIS!*\n\nGak ada yang tahu bendera ini wkwk. Jawabannya adalah: *${global.tebakbendera[from].jawaban.toUpperCase()}*` 
                    });
                    delete global.tebakbendera[from];
                }
            }, 60000) // 1 Menit
        };

        // Kirim soal ke grup
        const teksSoal = `🎌 *GAME TEBAK BENDERA NEGARA* 🎌\n\n` +
                          `❓ *Bendera Negara:* [ ${pilih.bendera} ]\n` +
                          `📍 *Benua:* ${pilih.benua}\n` +
                          `🔢 *Jumlah Huruf:* ${pilih.jawaban.length} Karakter\n` +
                          `⏰ *Waktu:* 60 Detik!\n\n` +
                          `👉 _Langsung ketik nama negaranya di grup/reply pesan ini!_`;

        await sock.sendMessage(from, { text: teksSoal }, { quoted: mek });

    } catch (e) {
        console.error(e);
        await sock.sendMessage(from, { text: '❌ Terjadi gangguan pada sistem Tebak Bendera internal.' }, { quoted: mek });
    }
};
