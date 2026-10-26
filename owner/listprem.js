const fs = require('fs');
const path = require('path');

module.exports = async (sock, mek, { isOwner, command }) => {
    const from = mek.key.remoteJid;

    if (!isOwner) {
        return sock.sendMessage(from, { text: `⚠️ Perintah *.${command}* khusus untuk Owner Bot!` }, { quoted: mek });
    }

    try {
        const premPath = path.join(__dirname, '../data/premium/premium.json');
        
        if (!fs.existsSync(premPath)) {
            return sock.sendMessage(from, { text: `ℹ️ Belum ada data user premium.` }, { quoted: mek });
        }

        const content = fs.readFileSync(premPath, 'utf-8');
        let premData = content ? JSON.parse(content) : [];

        if (!Array.isArray(premData) || premData.length === 0) {
            return sock.sendMessage(from, { text: `ℹ️ Belum ada nomor yang terdaftar sebagai Premium.` }, { quoted: mek });
        }

        const now = Date.now();
        let validList = [];

        // Normalisasi & Filter Waktu
        premData.forEach(item => {
            let num = typeof item === 'string' ? item : item.number;
            let exp = typeof item === 'object' && item.expiredAt ? item.expiredAt : (now + 86400000);

            // Pastikan bukan LID dan belum kedaluwarsa
            if (num && num.length <= 14 && exp > now) {
                validList.push({ number: num, expiredAt: exp });
            }
        });

        // Perbarui file database
        fs.writeFileSync(premPath, JSON.stringify(validList, null, 2));

        if (validList.length === 0) {
            return sock.sendMessage(from, { text: `ℹ️ Belum ada nomor premium yang aktif / Masa aktif sudah habis.` }, { quoted: mek });
        }

        let listText = `👑 *[ DAFTAR USER PREMIUM ]*\n\n`;

        validList.forEach((item, index) => {
            let formattedNumber = item.number.startsWith('62') ? '0' + item.number.slice(2) : item.number;
            
            // Perhitungan sisa waktu mendetail
            let diff = item.expiredAt - now;
            let days = Math.floor(diff / (1000 * 60 * 60 * 24));
            let hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            let seconds = Math.floor((diff % (1000 * 60)) / 1000);

            let timeStr = '';
            if (days > 0) timeStr += `${days} hari `;
            if (hours > 0) timeStr += `${hours} jam `;
            if (minutes > 0) timeStr += `${minutes} mnt `;
            if (days === 0 && hours === 0 && minutes === 0) timeStr += `${seconds} detik`;

            listText += `${index + 1}. ${formattedNumber}\n   ⏳ Sisa: *${timeStr.trim()}*\n\n`;
        });

        listText += `Total: *${validList.length} User VIP Aktif*`;

        return sock.sendMessage(from, { text: listText }, { quoted: mek });

    } catch (err) {
        console.error('[ERROR LISTPREM]:', err);
        return sock.sendMessage(from, { text: `❌ Gagal membaca daftar premium!` }, { quoted: mek });
    }
};
