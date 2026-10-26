const fs = require('fs');
const path = require('path');
const config = require('../config/config');

module.exports = async (sock, mek, { args, command, isPrem, isOwner }) => {
    const from = mek.key.remoteJid;
    
    // Ekstraksi Pengirim: Hanya ambil JID WhatsApp biasa, abaikan LID
    let senderJid = mek.key.participant || mek.key.remoteJid || '';
    let rawSender = senderJid.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');

    // Jika pengirim terbaca sebagai LID (> 13 digit), bersihkan
    if (rawSender.length > 13) {
        rawSender = '';
    }

    if (rawSender.startsWith('0')) {
        rawSender = '62' + rawSender.slice(1);
    }

    // Validasi Premium
    let checkPrem = isPrem || isOwner;
    try {
        const premPath = path.join(__dirname, '../data/premium/premium.json');
        if (fs.existsSync(premPath)) {
            const premData = JSON.parse(fs.readFileSync(premPath, 'utf-8'));
            if (rawSender) {
                checkPrem = premData.includes(rawSender) || isOwner;
            }
        }
    } catch (e) {
        checkPrem = isOwner;
    }

    if (!checkPrem) {
        return sock.sendMessage(from, { text: `⚠️ Fitur *.${command}* khusus untuk User Premium/VIP!` }, { quoted: mek });
    }

    const fullInput = args.join(' ');

    if (!fullInput) {
        return sock.sendMessage(from, { 
            text: `📢 *[ BROADCAST MENU ]*\n\n*Format:* \`.broadcast no nama custom # pesan\`\n*Contoh:* \`.broadcast 08123456789 mantan # sayang\`` 
        }, { quoted: mek });
    }

    // FORMAT SENSOR FIX: Awalan 08 + 2-3 digit + xxx (Contoh: 0812xxx)
    let maskedSender = '0812xxx';
    if (rawSender && rawSender.startsWith('62')) {
        let localNum = '0' + rawSender.slice(2);
        if (localNum.length >= 4) {
            maskedSender = `${localNum.slice(0, 4)}xxx`;
        }
    }

    // ===================================================================
    // MODE 1: BROADCAST PESAN RAHASIA (MENGGUNAKAN SIMBOL #)
    // ===================================================================
    if (fullInput.includes('#')) {
        const parts = fullInput.split('#');
        const firstPart = parts[0].trim(); 
        const secretMessage = parts.slice(1).join('#').trim(); 

        const spaceIndex = firstPart.indexOf(' ');
        if (spaceIndex === -1 || !secretMessage) {
            return sock.sendMessage(from, { 
                text: `⚠️ Format salah!\n*Contoh:* \`.${command} 08123456789 mantan # sayang\`` 
            }, { quoted: mek });
        }

        let targetNum = firstPart.substring(0, spaceIndex).replace(/[^0-9]/g, '');
        const customName = firstPart.substring(spaceIndex + 1).trim();

        if (targetNum.startsWith('0')) {
            targetNum = '62' + targetNum.slice(1);
        }
        const targetJid = targetNum + '@s.whatsapp.net';

        try {
            let secretMsgText = `Hai ada pesan buat kamu dari *${config.botName || 'X-Bot Multi Device'}*\n\n`;
            secretMsgText += `Nama: *${customName}*\n`;
            secretMsgText += `No pengirim: *${maskedSender}*\n\n`;
            secretMsgText += `Pesan:\n"${secretMessage}"`;

            await sock.sendMessage(targetJid, { text: secretMsgText });
            return sock.sendMessage(from, { text: `✅ *Pesan Rahasia Berhasil Terkirim!*` }, { quoted: mek });

        } catch (err) {
            console.error('[ERROR BC SECRET]:', err);
            return sock.sendMessage(from, { text: `❌ Gagal mengirim pesan rahasia! Pastikan nomor tujuan aktif.` }, { quoted: mek });
        }
    }

    // ===================================================================
    // MODE 2: BROADCAST KE SEMUA GRUP (TANPA SIMBOL #)
    // ===================================================================
    try {
        await sock.sendMessage(from, { text: `⏳ [ PROCESS ] Memproses Broadcast ke grup...` }, { quoted: mek });

        const chats = await sock.groupFetchAllParticipating();
        const groups = Object.keys(chats);

        if (groups.length === 0) {
            return sock.sendMessage(from, { text: `❌ Bot belum bergabung di grup manapun!` }, { quoted: mek });
        }

        let successCount = 0;
        let failedCount = 0;
        const broadcastMessage = `📢 *[ PREMIUM BROADCAST ]*\n\n${fullInput}\n\n_Pesan ini dikirim oleh User Premium_`;

        for (const groupId of groups) {
            try {
                await sock.sendMessage(groupId, { text: broadcastMessage });
                successCount++;
                await new Promise(resolve => setTimeout(resolve, 1500));
            } catch (err) {
                failedCount++;
            }
        }

        return sock.sendMessage(from, { 
            text: `✅ *BROADCAST GRUP SELESAI*\n🎯 Berhasil: ${successCount} Grup | ❌ Gagal: ${failedCount} Grup` 
        }, { quoted: mek });

    } catch (err) {
        console.error('[ERROR BROADCAST.JS]:', err);
        return sock.sendMessage(from, { text: `❌ Terjadi kesalahan saat menjalankan Broadcast!` }, { quoted: mek });
    }
};
