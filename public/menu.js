const fs = require('fs');
const path = require('path');
const config = require('../config/config');

module.exports = async (sock, mek, { isOwner, isPrem, from }) => {
    try {
        const d = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
        const locale = 'id-ID';
        const gmtTime = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }).replace(/:/g, '.');
        const gmtDate = d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'short' });

        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const runtimeText = `${hours}j ${minutes}m`;

        const rankText = isOwner ? '☠️ [ OWNER CENTRAL ]' : isPrem ? '🔮 [ VIP PREMIUM ]' : '👤 [ FREE USER ]';
        const senderName = mek.pushName || 'User Bot';

        let menuText = `╔════════════════════════╗\n`;
        menuText += `║   🔥 *${(config.botName || 'BOT WHATSAPP').toUpperCase()} SYSTEM* 🔥\n`;
        menuText += `╚════════════════════════╝\n\n`;
        
        menuText += `  ⚡ *OPERATOR* : ${senderName}\n`;
        menuText += `  ⚡ *PRIVILEGE* : ${rankText}\n`;
        menuText += `  ⚡ *RUNTIME* : ${runtimeText}\n`;
        menuText += `  ⚡ *TIME/DATE* : ${gmtTime} | ${gmtDate}\n\n`;
        menuText += `📱 _System database connected successfully._\n`;
        menuText += `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n\n`;

        const folders = ['public', 'premium', 'game', 'owner'];
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

        await sock.sendMessage(from, { text: menuText.trim() }, { quoted: mek });
    } catch (err) {
        console.error('[ERROR MENU.JS]:', err);
        await sock.sendMessage(from, { text: '❌ Terjadi kesalahan saat memuat menu.' }, { quoted: mek });
    }
};
