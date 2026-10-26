module.exports = async (sock, mek) => {
    const from = mek.key.remoteJid;

    // Fitur ini hanya bisa digunakan di dalam grup
    if (!from.endsWith('@g.us')) {
        return sock.sendMessage(from, { text: '❌ Fitur ini cuma bisa dipakai di dalam grup, bro!' }, { quoted: mek });
    }

    // Ambil semua data anggota/member grup
    const groupMetadata = await sock.groupMetadata(from);
    const participants = groupMetadata.participants;

    // Pilih 2 orang member secara acak
    const jodoh1 = participants[Math.floor(Math.random() * participants.length)].id;
    let jodoh2 = participants[Math.floor(Math.random() * participants.length)].id;

    // Cegah bot memilih orang yang sama
    while (jodoh1 === jodoh2 && participants.length > 1) {
        jodoh2 = participants[Math.floor(Math.random() * participants.length)].id;
    }

    // Acak rating kecocokan cinta dalam persen
    const rate = Math.floor(Math.random() * 100) + 1;

    const teksJodoh = `❤️ *PERJODOHAN RANDOM GRUP* ❤️\n\n` +
                      `Ciyee, sistem bot mendeteksi ada percikan cinta di grup ini di antara:\n\n` +
                      `👤 @${jodoh1.split('@')[0]}\n` +
                      `💖 dengan\n` +
                      `👤 @${jodoh2.split('@')[0]}\n\n` +
                      `📈 *Tingkat Kecocokan:* *${rate}%*\n` +
                      `_Yuk buruan gas pelaminan, tunggu apa lagi!_`;

    await sock.sendMessage(from, { 
        text: teksJodoh, 
        mentions: [jodoh1, jodoh2] 
    }, { quoted: mek });
};
