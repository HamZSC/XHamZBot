const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const { checkAfk, checkGameAnswers, checkTebakGambar, checkTts, checkTebakKota, checkSiapaAku, checkTebakBendera, checkTebakKataBaku, checkMath, checkCakLontong } = require('./function');

module.exports = async (sock, mek) => {
    const isMe = mek.key.fromMe;
    if (isMe) return; 

    const body = mek.message?.conversation || 
                 mek.message?.extendedTextMessage?.text || 
                 mek.message?.imageMessage?.caption || 
                 mek.message?.videoMessage?.caption || "";
    
    if (!body) return;

    // Ambil data penting di awal
    const from = mek.key.remoteJid;
    const sender = mek.key.participant || mek.key.remoteJid;
    const senderNumber = sender.split('@')[0];
    const senderName = mek.pushName || 'User Bot'; 

    const isOwner = config.ownerNumber.includes(senderNumber) || sender === config.ownerId;
    
    // Pengecekan Premium yang sudah diperbaiki (Mendukung Format String & Objek Expired)
    let isPrem = isOwner;
    try {
        const premPath = path.join(__dirname, '../data/premium/premium.json');
        if (fs.existsSync(premPath)) {
            const premData = JSON.parse(fs.readFileSync(premPath, 'utf-8'));
            const now = Date.now();
            
            if (Array.isArray(premData)) {
                isPrem = isOwner || premData.some(item => {
                    if (typeof item === 'string') return item === senderNumber;
                    if (typeof item === 'object' && item.number) {
                        return item.number === senderNumber && (item.expiredAt ? item.expiredAt > now : true);
                    }
                    return false;
                });
            }
        }
    } catch (e) {
        isPrem = isOwner;
    }

    // ===================================================================
    // DETEKSI SESSION REPLY UTAMA
    // ===================================================================
    const quotedMessage = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const quotedText = quotedMessage?.conversation || quotedMessage?.extendedTextMessage?.text || "";
    
    // Deteksi reply menu tiktok downloader
    if (quotedText.toLowerCase().includes("pilih format download") || quotedText.toLowerCase().includes("tiktok downloader ultra hd")) {
        try {
            console.log(`[LOG] User ${senderName} membalas menu TikTok dengan input: ${body}`);
            return await require('../premium/tt')(sock, mek, { args: body.trim().split(/ +/), isOwner, isPrem, command: 'tt' });
        } catch (err) { 
            console.error('[ERROR DI MESSAGE.JS - TIKTOK REPLY]:', err); 
        }
    }
    // ===================================================================

    // PROSES PEMOTONGAN TEKS UNTUK COMMAND REGULAR
    const args = body.trim().split(/ +/);
    const command = args.shift().toLowerCase();

    const folders = ['public', 'premium', 'game', 'owner'];

    // JALANKAN FUNGSI OTOMATIS GAME
    await checkAfk(sock, mek, { from, senderNumber, senderName });
    await checkGameAnswers(sock, mek, { from, body, senderNumber, senderName });
    await checkTebakGambar(sock, mek, { from, body, senderNumber, senderName });
    await checkTts(sock, mek, { from, body, senderNumber, senderName });
    await checkTebakKota(sock, mek, { from, body, senderNumber, senderName });
    await checkSiapaAku(sock, mek, { from, body, senderNumber, senderName });
    await checkTebakBendera(sock, mek, { from, body, senderNumber, senderName });
    await checkTebakKataBaku(sock, mek, { from, body, senderNumber, senderName });
    await checkMath(sock, mek, { from, body, senderNumber, senderName });
    await checkCakLontong(sock, mek, { from, body, senderNumber, senderName });

    // ===================================================================
    // MENU HANDLER
    // ===================================================================
    if (command === 'menu' || command === 'help') {
        const d = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Jakarta"}));
        const locale = 'id-ID';
        const gmtTime = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }).replace(/:/g, '.');
        const gmtDate = d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'short' });

        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const runtimeText = `${hours}j ${minutes}m`;

        const rankText = isOwner ? '☠️ [ OWNER CENTRAL ]' : isPrem ? '🔮 [ VIP PREMIUM ]' : '👤 [ FREE USER ]';

        let menuText = `╔════════════════════════╗\n`;
        menuText += `║   🔥 *${config.botName.toUpperCase()} SYSTEM V.4* 🔥\n`;
        menuText += `╚════════════════════════╝\n\n`;
        
        menuText += `  ⚡ *OPERATOR* : ${senderName}\n`;
        menuText += `  ⚡ *PRIVILEGE* : ${rankText}\n`;
        menuText += `  ⚡ *RUNTIME* : ${runtimeText}\n`;
        menuText += `  ⚡ *TIME/DATE* : ${gmtTime} | ${gmtDate}\n\n`;
        menuText += `📱 _System database connected successfully._\n`;
        menuText += `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n\n`;

        for (const folder of folders) {
            const dirPath = path.join(__dirname, `../${folder}`);
            if (fs.existsSync(dirPath)) {
                const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.js'));
                if (files.length > 0) {
                    const namaFolderVisual = folder.toUpperCase() === 'PUBLIC' ? 'USER' : folder.toUpperCase();
                    
                    menuText += `┌───⭓ *[ ${namaFolderVisual} COMMANDS ]*\n`;
                    for (const file of files) {
                        menuText += `│ ⬡ ${file.replace('.js', '')}\n`;
                    }
                    menuText += `└────────────────────⭔\n\n`;
                }
            }
        }

        return await sock.sendMessage(from, { text: menuText.trim() }, { quoted: mek });
    }

    // COMMAND EXECUTOR (Auto-Load Folder)
    for (const folder of folders) {
        const filePath = path.join(__dirname, `../${folder}/${command}.js`);
        if (fs.existsSync(filePath)) {
            if (folder === 'owner' && !isOwner) {
                return sock.sendMessage(from, { text: `⚠️ Fitur khusus Owner!` }, { quoted: mek });
            }
            if (folder === 'premium' && !isPrem) {
                return sock.sendMessage(from, { text: `⚠️ Fitur khusus member *Premium/VIP*!` }, { quoted: mek });
            }
            try {
                return await require(filePath)(sock, mek, { args, isOwner, isPrem, command });
            } catch (error) {
                console.error(error);
                return sock.sendMessage(from, { text: `❌ Terjadi error pada fitur \`${command}\`.` }, { quoted: mek });
            }
        }
    }
};
