
const fs = require('fs');
const path = require('path');

// Fungsi konversi durasi yang stabil
function parseDuration(durationStr) {
    if (!durationStr) return 30 * 24 * 60 * 60 * 1000; // Default 30 Hari

    const num = parseInt(durationStr);
    if (isNaN(num)) return 30 * 24 * 60 * 60 * 1000;

    const unit = durationStr.replace(/[0-9]/g, '').toLowerCase().trim();

    switch (unit) {
        case 'm': return num * 60 * 1000;              // Menit
        case 'h': return num * 60 * 60 * 1000;         // Jam
        case 'd': return num * 24 * 60 * 60 * 1000;    // Hari
        case 'bln': return num * 30 * 24 * 60 * 60 * 1000; // Bulan
        default: return num * 24 * 60 * 60 * 1000;     // Default Hari
    }
}

module.exports = async (sock, mek, { args, isOwner, command }) => {
    const from = mek.key.remoteJid;

    if (!isOwner) {
        return sock.sendMessage(from, { text: `⚠️ Perintah *.${command}* khusus untuk Owner!` }, { quoted: mek });
    }

    try {
        let targetNumber = '';
        let durationArg = '';

        // Extract input teks manual
        if (args && args.length > 0) {
            for (let arg of args) {
                let clean = arg.replace(/[^0-9]/g, '');
                if (clean.length >= 10 && clean.length <= 15) {
                    targetNumber = clean;
                } else if (/^\d+[a-zA-Z]+$/.test(arg) || (/^\d+$/.test(arg) && arg.length < 5)) {
                    durationArg = arg;
                }
            }
        }

        // Extract dari Mention / Reply jika nomor belum diisi di args
        const contextInfo = mek.message?.extendedTextMessage?.contextInfo;
        const quoted = contextInfo?.quotedMessage;

        if (!targetNumber) {
            let candidateJid = contextInfo?.mentionedJid?.[0] || contextInfo?.participant;
            if (candidateJid) {
                targetNumber = candidateJid.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
            }
        }

        // Validasi ketat nomor HP & Anti-LID
        if (!targetNumber || targetNumber.length > 14 || targetNumber.length < 10) {
            return sock.sendMessage(from, { 
                text: `⚠️ *Penggunaan Perintah Addprem:*

Format: \`.${command} <nomor> <durasi>\`
Contoh: \`.${command} 081234567890 1d\`

*Pilihan Durasi:*
• \`1m\` = 1 Menit
• \`1h\` = 1 Jam
• \`1d\` = 1 Hari
• \`1bln\` = 1 Bulan` 
            }, { quoted: mek });
        }

        // Normalisasi format ke 628xxx
        if (targetNumber.startsWith('0')) {
            targetNumber = '62' + targetNumber.slice(1);
        } else if (!targetNumber.startsWith('62')) {
            targetNumber = '62' + targetNumber;
        }

        let durationMs = parseDuration(durationArg);
        let expiredAt = Date.now() + durationMs;

        // Penanganan Folder dan Database
        const dirPath = path.join(__dirname, '../data/premium');
        const premPath = path.join(dirPath, 'premium.json');

        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        let premData = [];
        if (fs.existsSync(premPath)) {
            try {
                let fileContent = fs.readFileSync(premPath, 'utf-8');
                premData = JSON.parse(fileContent);
                if (!Array.isArray(premData)) premData = [];
            } catch (e) {
                premData = [];
            }
        }

        // Migrasi & Pembersihan Format Data Lama/Baru + Anti LID
        let normalizedList = [];
        for (let item of premData) {
            if (typeof item === 'string') {
                if (item.length <= 14 && item.startsWith('62')) {
                    normalizedList.push({ number: item, expiredAt: Date.now() + (30 * 24 * 60 * 60 * 1000) });
                }
            } else if (typeof item === 'object' && item !== null && item.number) {
                if (item.number.length <= 14 && item.number.startsWith('62')) {
                    normalizedList.push(item);
                }
            }
        }

        // Update jika nomor sudah ada atau masukkan nomor baru
        let existingIndex = normalizedList.findIndex(item => item.number === targetNumber);
        if (existingIndex !== -1) {
            normalizedList[existingIndex].expiredAt = expiredAt;
        } else {
            normalizedList.push({ number: targetNumber, expiredAt: expiredAt });
        }

        // Simpan ke file
        fs.writeFileSync(premPath, JSON.stringify(normalizedList, null, 2));

        let displayNum = '0' + targetNumber.slice(2);
        let labelDurasi = durationArg || '30 Hari (Default)';

        return sock.sendMessage(from, { 
            text: `✅ *BERHASIL MENAMBAHKAN PREMIUM*\n\n📱 Nomor: *${displayNum}*\n⏳ Durasi: *${labelDurasi}*\n\nStatus VIP aktif!` 
        }, { quoted: mek });

    } catch (err) {
        console.error('[ERROR ADDPREM]:', err);
        return sock.sendMessage(from, { text: `❌ Terjadi kesalahan pada script:\n\`\`\`${err.message}\`\`\`` }, { quoted: mek });
    }
};
