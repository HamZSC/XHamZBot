const fs = require('fs');
const path = require('path');

module.exports = async (sock, mek, { args, isOwner, command }) => {
    const from = mek.key.remoteJid;

    if (!isOwner) {
        return sock.sendMessage(from, { text: `⚠️ Perintah *.${command}* khusus untuk Owner!` }, { quoted: mek });
    }

    try {
        const contextInfo = mek.message?.extendedTextMessage?.contextInfo;
        const quoted = contextInfo?.quotedMessage;
        
        let targetNumber = '';

        if (args && args[0]) {
            targetNumber = args[0].replace(/[^0-9]/g, '');
        }

        if (!targetNumber && contextInfo?.mentionedJid && contextInfo.mentionedJid.length > 0) {
            let tagJid = contextInfo.mentionedJid[0];
            targetNumber = tagJid.split('@')[0].replace(/[^0-9]/g, '');
        }

        if (!targetNumber && quoted && contextInfo?.participant) {
            let replyJid = contextInfo.participant;
            targetNumber = replyJid.split('@')[0].replace(/[^0-9]/g, '');
        }

        if (!targetNumber || targetNumber.length < 10) {
            return sock.sendMessage(from, { 
                text: `⚠️ *Format Salah!*\nGunakan: \`.${command} 081234567890\` atau tag/reply orangnya.` 
            }, { quoted: mek });
        }

        let cleanNumber = targetNumber;
        if (cleanNumber.startsWith('0')) {
            cleanNumber = '62' + cleanNumber.slice(1);
        } else if (!cleanNumber.startsWith('62')) {
            cleanNumber = '62' + cleanNumber;
        }

        const premPath = path.join(__dirname, '../data/premium/premium.json');
        
        if (!fs.existsSync(premPath)) {
            return sock.sendMessage(from, { text: `❌ Database premium masih kosong!` }, { quoted: mek });
        }

        let premData = JSON.parse(fs.readFileSync(premPath, 'utf-8'));
        
        // Normalisasi format lama/baru
        premData = premData.map(item => typeof item === 'string' ? { number: item, expiredAt: Date.now() + 86400000 } : item);

        let filteredData = premData.filter(item => item.number !== cleanNumber);

        if (filteredData.length === premData.length) {
            let displayNum = '0' + cleanNumber.slice(2);
            return sock.sendMessage(from, { text: `ℹ️ Nomor *${displayNum}* tidak ditemukan di database premium.` }, { quoted: mek });
        }

        fs.writeFileSync(premPath, JSON.stringify(filteredData, null, 2));

        let displayNum = '0' + cleanNumber.slice(2);
        return sock.sendMessage(from, { text: `✅ Berhasil menghapus *${displayNum}* dari daftar User Premium.` }, { quoted: mek });

    } catch (err) {
        console.error('[ERROR DELPREM.JS]:', err);
        return sock.sendMessage(from, { text: `❌ Terjadi kesalahan saat menghapus premium!` }, { quoted: mek });
    }
};
