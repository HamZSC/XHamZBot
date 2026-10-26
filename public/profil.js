const fs = require('fs');
const path = require('path');

module.exports = async (sock, mek, { isPrem, isOwner }) => {
    const from = mek.key.remoteJid;

    // Deteksi Target (Tag, Reply, atau Diri Sendiri)
    const contextInfo = mek.message?.extendedTextMessage?.contextInfo;
    const quoted = contextInfo?.quotedMessage;
    
    let targetJid = mek.key.participant || mek.key.remoteJid;
    let pushName = mek.pushName || 'User';

    if (contextInfo?.mentionedJid?.length > 0) {
        targetJid = contextInfo.mentionedJid[0];
        pushName = 'User';
    } else if (quoted && contextInfo?.participant) {
        targetJid = contextInfo.participant;
        pushName = contextInfo.pushName || 'User';
    }

    const targetNumber = targetJid.split('@')[0];

    // Read Data Saldo / Economy (Cepat karena baca JSON lokal)
    let userBalance = 0;
    try {
        const economyData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/economy.json'), 'utf-8'));
        userBalance = economyData[targetNumber] || economyData[targetJid] || 0;
    } catch (e) {
        userBalance = 0;
    }

    // Read Data Status Premium Target
    let targetIsPrem = false;
    try {
        const premData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/premium/premium.json'), 'utf-8'));
        targetIsPrem = premData.includes(targetNumber) || isOwner;
    } catch (e) {
        targetIsPrem = isOwner;
    }

    const statusRole = isOwner ? '☠️ OWNER CENTRAL' : targetIsPrem ? '🔮 VIP PREMIUM' : '👤 FREE USER';
    const formattedBalance = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(userBalance);

    // FUNGSI FETCH FOTO PROFIL KILAT (Max timeout 2 detik biar gak lemot)
    let ppUrl = 'https://i.ibb.co/3Fh9V6p/avatar-contact.png'; // Default fallback
    try {
        const fetchPP = sock.profilePictureUrl(targetJid, 'image');
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000));
        ppUrl = await Promise.race([fetchPP, timeoutPromise]);
    } catch (e) {
        ppUrl = 'https://i.ibb.co/3Fh9V6p/avatar-contact.png';
    }

    try {
        let captionText = `┌───⭓ *[ USER PROFILE ]*\n`;
        captionText += `│ 👤 *Nama* : ${pushName}\n`;
        captionText += `│ 📱 *Nomor* : @${targetNumber}\n`;
        captionText += `│ 🎖️ *Status* : ${statusRole}\n`;
        captionText += `│ 💰 *Saldo* : ${formattedBalance}\n`;
        captionText += `└────────────────────⭔\n`;

        return await sock.sendMessage(from, { 
            image: { url: ppUrl }, 
            caption: captionText,
            mentions: [targetJid]
        }, { quoted: mek });

    } catch (err) {
        console.error('[ERROR PROFILE.JS]:', err);
        return sock.sendMessage(from, { 
            text: `👤 *Nama* : ${pushName}\n📱 *Nomor* : @${targetNumber}\n🎖️ *Status* : ${statusRole}\n💰 *Saldo* : ${formattedBalance}`,
            mentions: [targetJid]
        }, { quoted: mek });
    }
};
