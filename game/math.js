global.math = global.math || {};

module.exports = async (sock, mek) => {
    const from = mek.key.remoteJid;

    // Cek jika game math lagi jalan di grup ini
    if (global.math[from]) {
        return sock.sendMessage(from, { 
            text: `⚠️ *GAME SEDANG BERJALAN!*\n\nSelesaikan dulu soal matematika yang ini bro!` 
        }, { quoted: mek });
    }

    // Mengacak tingkat kesulitan game
    const modes = ['easy', 'medium', 'hard'];
    const mode = modes[Math.floor(Math.random() * modes.length)];

    let num1, num2, operator, jawaban;
    const operators = ['+', '-', '*'];
    operator = operators[Math.floor(Math.random() * operators.length)];

    // Atur jangkauan angka berdasarkan kesulitan
    if (mode === 'easy') {
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
    } else if (mode === 'medium') {
        num1 = Math.floor(Math.random() * 50) + 10;
        num2 = Math.floor(Math.random() * 50) + 10;
    } else { // Hard mode
        num1 = Math.floor(Math.random() * 100) + 20;
        num2 = Math.floor(Math.random() * 30) + 5; // Perkalian biar ga pusing banget kalau hard
    }

    // Hitung jawaban benar di server internal
    if (operator === '+') jawaban = num1 + num2;
    if (operator === '-') jawaban = num1 - num2;
    if (operator === '*') jawaban = num1 * num2;

    // Ubah tampilan visual operator perkalian biar user paham
    const tOperator = operator === '*' ? '×' : operator;

    try {
        // Simpan sesi game ke global variable
        global.math[from] = {
            jawaban: String(jawaban),
            timeout: setTimeout(async () => {
                if (global.math[from]) {
                    await sock.sendMessage(from, { 
                        text: `⌛ *WAKTU HABIS!*\n\nOtak anak grup langsung ngebul wkwk. Jawabannya adalah: *${global.math[from].jawaban}*` 
                    });
                    delete global.math[from];
                }
            }, 45000) // Waktu 45 Detik biar lebih menantang!
        };

        // Kirim soal ke grup
        const teksSoal = `🧮 *GAME ADU BERHITUNG (MATH)* 🧮\n\n` +
                          `❓ *Soal:* ${num1} ${tOperator} ${num2} = ...\n` +
                          `📈 *Mode Kesulitan:* ${mode.toUpperCase()}\n` +
                          `⏰ *Waktu:* 45 Detik!\n\n` +
                          `👉 _Langsung ketik angka jawabannya di grup/reply pesan ini!_`;

        await sock.sendMessage(from, { text: teksSoal }, { quoted: mek });

    } catch (e) {
        console.error(e);
        await sock.sendMessage(from, { text: '❌ Terjadi gangguan pada sistem kalkulator Math internal.' }, { quoted: mek });
    }
};
