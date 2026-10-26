const fs = require('fs');
const path = require('path');

module.exports = async (sock, mek, { args, isOwner, from }) => {
    if (!isOwner) return sock.sendMessage(from, { text: '⚠️ Fitur ini khusus Owner!' }, { quoted: mek });
    if (!args[0]) return sock.sendMessage(from, { text: '❌ Masukan nomornya bro!\nContoh: .addprem 628123456789' }, { quoted: mek });

    const target = args[0].replace(/[^0-9]/g, '');
    const filePath = path.join(__dirname, '../data/premium/premium.json');
    
    // Pastikan folder data/premium ada
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    let premData = [];
    try {
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            premData = fileContent ? JSON.parse(fileContent) : [];
        }
    } catch (e) {
        premData = [];
    }

    // Cek apakah sudah ada di database (baik format string maupun objek)
    const exists = premData.some(item => {
        if (typeof item === 'string') return item === target;
        if (typeof item === 'object' && item.number) return item.number === target;
        return false;
    });

    if (exists) {
        return sock.sendMessage(from, { text: `⚠️ Nomor @${target} sudah terdaftar sebagai user Premium.` }, { quoted: mek, mentions: [`${target}@s.whatsapp.net`] });
    }

    // Simpan dalam format objek yang seragam (Expired 30 hari ke depan, atau sesuaikan)
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    const newEntry = {
        number: target,
        expiredAt: Date.now() + thirtyDays 
    };

    premData.push(newEntry);
    fs.writeFileSync(filePath, JSON.stringify(premData, null, 2));

    await sock.sendMessage(from, { 
        text: `✅ Sukses menambahkan @${target} ke user Premium selama 30 hari! ✨`, 
        mentions: [`${target}@s.whatsapp.net`] 
    }, { quoted: mek });
};
    
