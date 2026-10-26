const fs = require('fs');

module.exports = async (sock, mek, { args }) => {
    const from = mek.key.remoteJid;
    const sender = mek.key.participant || mek.key.remoteJid;
    const senderNumber = sender.split('@')[0];
    const senderName = mek.pushName || 'User';

    const filePath = './data/afk.json';
    
    // Pastikan folder & file database tersedia
    if (!fs.existsSync('./data')) fs.mkdirSync('./data');
    let afkData = {};
    try { afkData = JSON.parse(fs.readFileSync(filePath, 'utf-8')); } catch (e) { afkData = {}; }

    // Ambil alasan AFK (kalau kosong kasih default)
    const alasan = args.join(' ') || 'Tanpa alasan (sibuk)';

    // Simpan status AFK
    afkData[senderNumber] = {
        name: senderName,
        reason: alasan,
        time: Date.now()
    };
    
    fs.writeFileSync(filePath, JSON.stringify(afkData, null, 2));

    await sock.sendMessage(from, { 
        text: `💤 *STATUS AFK AKTIF*\n\n*${senderName}* sekarang sedang AFK!\n📝 *Alasan:* _${alasan}_` 
    }, { quoted: mek });
};
