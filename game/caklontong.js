global.caklontong = global.caklontong || {};

module.exports = async (sock, mek) => {
    const from = mek.key.remoteJid;

    // Cek jika game caklontong lagi jalan di grup ini
    if (global.caklontong[from]) {
        return sock.sendMessage(from, { 
            text: `⚠️ *GAME SEDANG BERJALAN!*\n\nSelesaikan dulu tebakan Cak Lontong yang ini bro!` 
        }, { quoted: mek });
    }

    // DATABASE LOKAL TEBAK-TEBAKAN CAK LONTONG
    const databaseLontong = [
        { soal: "Bisa nonton TV jika lampu...", jawaban: "dinyalain", alasan: "Ya kalau lampunya dimatiin kan gelap, gak kelihatan TV-nya, makanya harus dinyalain dulu wkwk." },
        { soal: "Orang berjalan di atas air menggunakan...", jawaban: "sepatu", alasan: "Ya kalau gak pakai sepatu atau alas kaki, nanti kakinya kotor atau kena beling bro." },
        { soal: "Burung terbang menggunakan...", jawaban: "semangat", alasan: "Kalau punya sayap tapi gak punya semangat buat terbang, ya tetep diem aja di sangkar." },
        { soal: "Seseorang yang memimpin sebuah seksi disebut...", jawaban: "pusing", alasan: "Coba aja lu jadi ketua seksi di kepanitiaan, pasti pusing ngurusin anggotanya." },
        { soal: "Supaya bersih, kita mandi dengan...", jawaban: "yakin", alasan: "Kalau mandi gak yakin udah bersih, nanti lu bolak-balik sabunan terus gak kelar-kelar." },
        { soal: "Kambing jika dikalikan dua menjadi...", jawaban: "banyak", alasan: "Satu kambing aja udah lumayan, kalau dikali dua ya jadi banyak dong kambingnya." },
        { soal: "Sebelum mengoperasikan mesin, pastikan tombol dalam keadaan...", jawaban: "ada", alasan: "Gimana mau nekan tombolnya kalau tombolnya aja gak ada? Makanya dipastikan harus ada dulu tombolnya." },
        { soal: "Matahari tenggelam di sebelah...", jawaban: "gawat", alasan: "Kalau matahari tenggelam di sebelah rumah lu, itu namanya gawat darurat kebakaran wkwk." },
        { soal: "Motor yang tabrakan dengan mobil di jalan biasanya...", jawaban: "ramai", alasan: "Pasti langsung ramai ditonton warga sekitar yang mau melihat kejadiannya." },
        { soal: "Menjelang hari raya, biasanya ibu-ibu membuat...", jawaban: "repot", alasan: "Ibu-ibu kalau udah bikin kue menjelang lebaran pasti seisi rumah jadi repot semua." }
    ];

    try {
        const pilih = databaseLontong[Math.floor(Math.random() * databaseLontong.length)];

        // Simpan sesi game ke global variable beserta timeout
        global.caklontong[from] = {
            jawaban: pilih.jawaban.toLowerCase().trim(),
            timeout: setTimeout(async () => {
                if (global.caklontong[from]) {
                    await sock.sendMessage(from, { 
                        text: `⌛ *WAKTU HABIS!*\n\nOtak lu pada gak nyampe kan? Wkwkwk.\n👑 Jawabannya: *${global.caklontong[from].jawaban.toUpperCase()}*\n💡 *Alasan:* _${pilih.alasan}_` 
                    });
                    delete global.caklontong[from];
                }
            }, 60000) // Waktu 1 Menit
        };

        // Kirim soal ke grup
        const teksSoal = `🤪 *GAME TEBAK CAK LONTONG (LOGIKA ABSURD)* 🤪\n\n` +
                          `📝 *Soal:* _"${pilih.soal}"_\n` +
                          `🔢 *Jumlah Huruf:* ${pilih.jawaban.length} Karakter\n` +
                          `⏰ *Waktu:* 60 Detik!\n\n` +
                          `👉 _Gunakan logika absurd lu, langsung ketik jawabannya di grup/reply pesan ini!_`;

        await sock.sendMessage(from, { text: teksSoal }, { quoted: mek });

    } catch (e) {
        console.error(e);
        await sock.sendMessage(from, { text: '❌ Terjadi gangguan pada sistem Cak Lontong internal.' }, { quoted: mek });
    }
};
