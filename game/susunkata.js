global.susunkata = global.susunkata || {};

module.exports = async (sock, mek, { args, command }) => {
    const from = mek.key.remoteJid;

    // Database Soal
    const databaseSoal = [
        { acak: "A N I T N K A S I D", jawaban: "tindakan", clue: "Perbuatan atau aksi" },
        { acak: "K A N A M A N", jawaban: "makanan", clue: "Sesuatu yang bisa dimakan" },
        { acak: "K A P A N I N G O L", jawaban: "pengalokan", clue: "Proses penjatahan tempat/dana" },
        { acak: "A M R A N T U I S K A", jawaban: "kamusrtani", clue: "Istilah pertanian" },
        { acak: "K O P E L M O K", jawaban: "kelompok", clue: "Kumpulan orang atau benda" },
        { acak: "G N I N T U G", jawaban: "gunting", clue: "Alat untuk memotong kertas" },
        { acak: "R A K I T A S U N A", jawaban: "nusantara", clue: "Nama lain kepulauan Indonesia" },
        { acak: "M A L A K I N A T", jawaban: "malikatan", clue: "Sesuatu yang berhubungan dengan kerajaan" }
    ];

    if (global.susunkata[from]) {
        return sock.sendMessage(from, { 
            text: `⚠️ *GAME SEDANG BERJALAN!*\n\nAda soal yang belum terjawab nih bro. Ayo tebak dulu kata ini:\n🔤 *${global.susunkata[from].soal.acak}*\n💡 *Clue:* _${global.susunkata[from].soal.clue}_` 
        }, { quoted: mek });
    }

    const soalTerpilih = databaseSoal[Math.floor(Math.random() * databaseSoal.length)];

    global.susunkata[from] = {
        soal: soalTerpilih,
        timeout: setTimeout(async () => {
            if (global.susunkata[from]) {
                await sock.sendMessage(from, { 
                    text: `⌛ *WAKTU HABIS!*\n\nGak ada yang berhasil menebak. Jawaban yang benar adalah: *${global.susunkata[from].soal.jawaban.toUpperCase()}*` 
                });
                delete global.susunkata[from];
            }
        }, 60000) // Batas waktu 1 menit
    };

    const teksSoal = `🎮 *GAME SUSUN KATA* 🎮\n\n` +
                      `Susunlah huruf-huruf di bawah ini menjadi kata yang benar:\n` +
                      `🔤 Teks Acak: *${soalTerpilih.acak}*\n` +
                      `💡 Petunjuk: _${soalTerpilih.clue}_\n\n` +
                      `⏰ Waktu lu cuma *60 detik* bro!`;

    await sock.sendMessage(from, { text: teksSoal }, { quoted: mek });
};
