const axios = require('axios');

module.exports = async (sock, mek, { args, command }) => {
    const from = mek.key.remoteJid;

    // Ambil info context & quoted message
    const contextInfo = mek.message?.extendedTextMessage?.contextInfo;
    const quoted = contextInfo?.quotedMessage;
    
    let text = args.join(' ');
    
    // 1. Ambil Teks Utama
    if (!text && quoted) {
        text = quoted.conversation 
            || quoted.extendedTextMessage?.text 
            || quoted.imageMessage?.caption 
            || quoted.videoMessage?.caption 
            || '';
    }

    if (!text) {
        return sock.sendMessage(from, { 
            text: `⚠️ *Gunakan:* \`.${command} teksnya\`\nAtau reply pesan/gambar orang lain dengan \`.${command}\`` 
        }, { quoted: mek });
    }

    // 2. Tentukan Siapa Target Dikutip
    let targetJid;
    let pushName;

    if (quoted && contextInfo?.participant) {
        targetJid = contextInfo.participant;
        pushName = contextInfo.pushName || 'User';
    } else {
        targetJid = mek.key.participant || mek.key.remoteJid;
        pushName = mek.pushName || 'User';
    }

    try {
        await sock.sendMessage(from, { text: `⏳ [ PROCESS ] Sedang membuat Gambar Quote IQC...` }, { quoted: mek });

        // 3. Ambil Foto Profil Target
        let ppUrl;
        try {
            ppUrl = await sock.profilePictureUrl(targetJid, 'image');
        } catch {
            ppUrl = 'https://i.ibb.co/3Fh9V6p/avatar-contact.png'; 
        }

        // 4. Susun Payload JSON (WA Dark Mode)
        const jsonPayload = {
            "type": "quote",
            "format": "png",
            "backgroundColor": "#1f2c34",
            "width": 512,
            "height": 768,
            "scale": 2,
            "messages": [
                {
                    "entities": [],
                    "avatar": true,
                    "from": {
                        "id": 1,
                        "name": pushName,
                        "photo": {
                            "url": ppUrl
                        }
                    },
                    "text": text,
                    "replyMessage": {}
                }
            ]
        };

        // 5. Daftar Server API Quote (Backup otomatis)
        const apiEndpoints = [
            'https://qc.botcahx.eu.org/generate',
            'https://quote.btch.bz/generate'
        ];

        let imageBuffer = null;

        for (const url of apiEndpoints) {
            try {
                const response = await axios.post(url, jsonPayload, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 10000
                });

                if (response.data?.result?.image) {
                    imageBuffer = Buffer.from(response.data.result.image, 'base64');
                    break; 
                }
            } catch (e) {
                continue;
            }
        }

        if (!imageBuffer) {
            throw new Error('Semua server API IQC tidak merespon.');
        }

        // 6. KIRIM SEBAGAI FOTO / GAMBAR BIASA (BUKAN STIKER)
        await sock.sendMessage(from, { 
            image: imageBuffer, 
            caption: `✨ *IQC Quote Generator*` 
        }, { quoted: mek });

    } catch (err) {
        console.error('[ERROR IQC.JS PREMIUM]:', err?.message || err);
        return sock.sendMessage(from, { 
            text: `❌ Server IQC sedang sibuk/down, coba beberapa saat lagi bro!` 
        }, { quoted: mek });
    }
};
