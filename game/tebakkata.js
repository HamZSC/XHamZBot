global.tebakkata = global.tebakkata || {};

module.exports = async (sock, mek) => {
    const from = mek.key.remoteJid;

    // Cek jika game tebakkata lagi jalan di grup ini
    if (global.tebakkata[from]) {
        return sock.sendMessage(from, { 
            text: `⚠️ *GAME SEDANG BERJALAN!*\n\nSelesaikan dulu tebak kata baku yang ini bro!` 
        }, { quoted: mek });
    }

    // DATABASE LOKAL TEBAK KATA BAKU KBBI
    const databaseBaku = [
        { opsiA: "Apotek", opsiB: "Apotik", jawaban: "apotek", arti: "Tempat menjual obat yang sah menurut KBBI adalah Apotek (bukan Apotik)." },
        { opsiA: "Analisa", opsiB: "Analisis", jawaban: "analisis", arti: "Kata serapan yang baku adalah Analisis (bukan Analisa)." },
        { opsiA: "Izin", opsiB: "Idzin", jawaban: "izin", arti: "Penulisan yang benar menurut kamus besar adalah Izin menggunakan huruf Z." },
        { opsiA: "Praktek", opsiB: "Praktik", jawaban: "praktik", arti: "Yang baku adalah Praktik, makanya turunannya menjadi Praktikan." },
        { opsiA: "Nasihat", opsiB: "Idzin", jawaban: "nasihat", arti: "Kata baku yang tepat adalah Nasihat menggunakan huruf A (bukan Nasihat)." },
        { opsiA: "Jadwal", opsiB: "Jadual", jawaban: "jadwal", arti: "Penulisan menggunakan huruf W yang benar: Jadwal." },
        { opsiA: "Kwitansi", opsiB: "Kuitansi", jawaban: "kuitansi", arti: "Secara KBBI yang benar adalah Kuitansi menggunakan huruf U." },
        { opsiA: "Antri", opsiB: "Antre", jawaban: "antre", arti: "Budayakan mengantre, kata bakunya adalah Antre menggunakan E." },
        { opsiA: "Zaman", opsiB: "Jaman", jawaban: "zaman", arti: "Zaman menggunakan huruf Z adalah bentuk kata yang baku." },
        { opsiA: "Feminim", opsiB: "Feminin", jawaban: "feminin", arti: "Bentuk baku yang tepat akhiran huruf N: Feminin." }
    ];

    try {
        const pilih = databaseBaku[Math.floor(Math.random() * databaseBaku.length)];

        // Simpan sesi game ke global variable beserta timeout
        global.tebakkata[from] = {
            jawaban: pilih.jawaban.toLowerCase().trim(),
            timeout: setTimeout(async () => {
                if (global.tebakkata[from]) {
                    await sock.sendMessage(from, { 
                        text: `⌛ *WAKTU HABIS!*\n\nGak ada yang bisa jawab. Jawabannya adalah: *${global.tebakkata[from].jawaban.toUpperCase()}*\n💡 *Info:* _${pilih.arti}_` 
                    });
                    delete global.tebakkata[from];
                }
            }, 60000) // 1 Menit
        };

        // Kirim soal ke grup
        const teksSoal = `📚 *GAME TEBAK KATA BAKU (KBBI)* 📚\n\n` +
                          `❓ *Manakah penulisan kata baku yang benar?*\n` +
                          `🅰️ *${pilih.opsiA}*\n` +
                          `🅱️ *${pilih.opsiB}*\n\n` +
                          `⏰ *Waktu:* 60 Detik!\n\n` +
                          `👉 _Langsung ketik jawabannya (tulis katanya langsung) di grup/reply pesan ini!_`;

        await sock.sendMessage(from, { text: teksSoal }, { quoted: mek });

    } catch (e) {
        console.error(e);
        await sock.sendMessage(from, { text: '❌ Terjadi gangguan pada sistem Tebak Kata Baku internal.' }, { quoted: mek });
    }
};
