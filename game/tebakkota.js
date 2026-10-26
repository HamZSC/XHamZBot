global.tebakkota = global.tebakkota || {};

module.exports = async (sock, mek) => {
    const from = mek.key.remoteJid;

    // Cek jika game tebakkota lagi jalan di grup ini
    if (global.tebakkota[from]) {
        return sock.sendMessage(from, { 
            text: `⚠️ *GAME SEDANG BERJALAN!*\n\nSelesaikan dulu tebak kota yang ini bro!` 
        }, { quoted: mek });
    }

    // DATABASE LOKAL KOTA/KABUPATEN INDONESIA (Anti 404 & Super Kilat)
    const databaseKota = [
        { soal: "Kota ini terkenal dengan julukan Kota Kembang dan kuliner seblak.", jawaban: "bandung", provinsi: "Jawa Barat" },
        { soal: "Kota pahlawan yang terkenal dengan jembatan Suramadu dan rujak cingur.", jawaban: "surabaya", provinsi: "Jawa Timur" },
        { soal: "Kota khatulistiwa yang terkenal dengan kuliner pisang goreng selai srikaya.", jawaban: "pontianak", provinsi: "Kalimantan Barat" },
        { soal: "Kota ini terkenal dengan jajanan lumpia dan bangunan bersejarah Lawang Sewu.", jawaban: "semarang", provinsi: "Jawa Tengah" },
        { soal: "Kota terkaya di sumatera yang terkenal dengan Istana Maimun dan bolu meranti.", jawaban: "medan", provinsi: "Sumatera Utara" },
        { soal: "Kota empek-empek yang memiliki jembatan Ampera di atas sungai Musi.", jawaban: "palembang", provinsi: "Sumatera Selatan" },
        { soal: "Kota seribu sungai yang terkenal dengan pasar terapungnya.", jawaban: "banjarmasin", provinsi: "Kalimantan Selatan" },
        { soal: "Kabupaten/Kota yang terkenal dengan gudeg dan kraton kasultanan.", jawaban: "yogyakarta", provinsi: "DI Yogyakarta" },
        { soal: "Kota yang dijuluki Kota Daeng dan terkenal dengan pantai Losari serta coto.", jawaban: "makassar", provinsi: "Sulawesi Selatan" },
        { soal: "Kota yang terkenal dengan rendang terbaik dunia dan jam gadang.", jawaban: "bukittinggi", provinsi: "Sumatera Barat" }
    ];

    try {
        const pilih = databaseKota[Math.floor(Math.random() * databaseKota.length)];

        // Simpan sesi game ke global variable
        global.tebakkota[from] = {
            jawaban: pilih.jawaban.toLowerCase().trim(),
            timeout: setTimeout(async () => {
                if (global.tebakkota[from]) {
                    await sock.sendMessage(from, { 
                        text: `⌛ *WAKTU HABIS!*\n\nGak ada yang peka wilayah. Jawabannya adalah: *${global.tebakkota[from].jawaban.toUpperCase()}*` 
                    });
                    delete global.tebakkota[from];
                }
            }, 60000) // 1 Menit
        };

        // Kirim soal ke grup
        // Teks "GAME TEBAK KOTA" wajib ada agar disaring oleh function.js
        const teksSoal = `🗺️ *GAME TEBAK KOTA INDONESIA* 🗺️\n\n` +
                          `📝 *Clue Karakteristik:* _${pilih.soal}_\n` +
                          `📍 *Provinsi:* ${pilih.provinsi}\n` +
                          `🔢 *Jumlah Huruf:* ${pilih.jawaban.length} Karakter\n` +
                          `⏰ *Waktu:* 60 Detik!\n\n` +
                          `👉 _Langsung ketik nama kotanya di grup/reply pesan ini!_`;

        await sock.sendMessage(from, { text: teksSoal }, { quoted: mek });

    } catch (e) {
        console.error(e);
        await sock.sendMessage(from, { text: '❌ Terjadi gangguan pada sistem Tebak Kota internal.' }, { quoted: mek });
    }
};
