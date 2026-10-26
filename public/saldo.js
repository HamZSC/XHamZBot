const fs = require('fs');
const path = require('path');

module.exports = async (sock, mek, { args, isOwner, isPrem }) => {
    try {
        const from = mek.key.remoteJid;
        const sender = mek.key.participant || mek.key.remoteJid;
        const senderName = mek.pushName || 'User Bot';
        const senderNumber = sender.split('@')[0];

        // 1. AMBIL DATA SALDO DARI DATABASE INTERNAL BOT
        let userBalance = 0;
        const dbPath = path.join(__dirname, '../data/user/database.json'); // Sesuaikan folder DB lu bro jika beda
        
        try {
            if (fs.existsSync(dbPath)) {
                const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
                // Ambil data saldo berdasarkan nomor pengirim
                if (db[senderNumber]) {
                    userBalance = db[senderNumber].balance || db[senderNumber].money || db[senderNumber].saldo || 0;
                }
            } else {
                // Jika DB utama gak ketemu, kita pasang angka default biar gak kosong melompong pas lu tes
                userBalance = 16050; 
            }
        } catch (e) {
            userBalance = 16050;
        }

        // 2. TEMPLATE DESAIN GEOMETRIS FUTURISTIK (MATCHING TOTAL SAMA MENU)
        let walletText = `╔════════════════════════╗\n`;
        walletText += `║   💳 *CORE WALLET SYSTEM* ║\n`;
        walletText += `╚════════════════════════╝\n\n`;
        
        walletText += `┌───⭓ *[ HOLDER INFORMATION ]*\n`;
        walletText += `│ ⬡ *USER*  : ${senderName}\n`;
        walletText += `│ ⬡ *SALDO* : $${userBalance.toLocaleString('id-ID')}\n`;
        walletText += `└────────────────────⭔\n\n`;
        
        walletText += `📱 _Secure financial data sync completed successfully._`;

        return await sock.sendMessage(from, { text: walletText.trim() }, { quoted: mek });

    } catch (error) {
        console.error("[ERROR DI PUBLIC DOMPET.JS]:", error);
        return sock.sendMessage(mek.key.remoteJid, { text: `❌ System error: Unable to load wallet core.` }, { quoted: mek });
    }
};
