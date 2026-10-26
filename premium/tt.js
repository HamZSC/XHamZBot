const axios = require('axios');

// Tempat nyimpen sesi pilihan download secara global
global.ttSession = global.ttSession || {};

module.exports = async (sock, mek, { args, command }) => {
    const from = mek.key.remoteJid;
    const sender = mek.key.participant || mek.key.remoteJid;
    const body = mek.message?.conversation || mek.message?.extendedTextMessage?.text || "";

    // =================================================================
    // 1. JALUR EVALUASI JAWABAN (REPLY ANGKA 1, 2, ATAU 3)
    // =================================================================
    const quotedMessage = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const quotedText = quotedMessage?.conversation || quotedMessage?.extendedTextMessage?.text || "";

    if (quotedText.toLowerCase().includes("pilih format download") || quotedText.toLowerCase().includes("tiktok downloader ultra hd")) {
        const sesi = global.ttSession[sender];
        
        if (!sesi) {
            return sock.sendMessage(from, { text: `❌ Sesi memilih sudah kedaluwarsa (lebih dari 2 menit) atau bot sempat restart. Silakan kirim link TikTok-nya lagi bro!` }, { quoted: mek });
        }

        const pilihan = body.trim();

        if (pilihan !== '1' && pilihan !== '2' && pilihan !== '3') {
            return sock.sendMessage(from, { text: `❌ Pilihan salah bro! Cuma ada angka *1* (Biasa), *2* (Dokumen), atau *3* (Audio/MP3).\n\nSilakan *reply ulang* pesan menu di atas dengan angka yang benar!` }, { quoted: mek });
        }

        await sock.sendMessage(from, { text: `⏳ _Sedang menyambungkan ke server TikTok, mohon tunggu sebentar..._` }, { quoted: mek });

        try {
            const response = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(sesi.url)}`);
            const res = response.data;

            if (res.code !== 0 || !res.data) {
                delete global.ttSession[sender];
                return sock.sendMessage(from, { text: `❌ Gagal mengambil data. Link mungkin bermasalah atau video diprivat.` }, { quoted: mek });
            }

            const videoUrl = res.data.hdplay || res.data.play; 
            const audioUrl = res.data.music; // URL Audio MP3 Asli TikTok
            const title = res.data.title || "No Title";
            const cleanTitle = title.slice(0, 20).replace(/[/\\?%*:|"<>\s]/g, '_');

            if (pilihan === '1') {
                await sock.sendMessage(from, { text: `🚀 _Video berhasil didapat! Sedang mengirim sebagai Video Biasa..._` }, { quoted: mek });
                await sock.sendMessage(from, { 
                    video: { url: videoUrl }, 
                    caption: `✅ *TIKTOK DOWNLOADER PREMIUM*\n\n📝 *Judul:* ${title}\n⚙️ *Format:* Kirim Biasa (MP4)` 
                }, { quoted: mek });

            } else if (pilihan === '2') {
                await sock.sendMessage(from, { text: `📦 _Video berhasil didapat! Sedang mentransfer sebagai file Dokumen (Pure 1080p)..._` }, { quoted: mek });
                await sock.sendMessage(from, { 
                    document: { url: videoUrl }, 
                    mimetype: 'video/mp4', 
                    fileName: `${cleanTitle}_1080p.mp4`,
                    caption: `✅ *TIKTOK DOWNLOADER PREMIUM*\n\n📝 *Judul:* ${title}\n⚙️ *Format:* Dokumen (Anti-Kompres)` 
                }, { quoted: mek });

            } else if (pilihan === '3') {
                await sock.sendMessage(from, { text: `🎵 _Audio berhasil didapat! Sedang mengonversi dan mengirim file MP3..._` }, { quoted: mek });
                await sock.sendMessage(from, { 
                    audio: { url: audioUrl }, 
                    mimetype: 'audio/mp4', // Biar lumer kebaca audio player di WhatsApp
                    ptt: false // Set true kalau mau dikirim dalam bentuk VN (Voice Note)
                }, { quoted: mek });
            }

            // Hapus sesi setelah sukses
            delete global.ttSession[sender];

        } catch (err) {
            console.error(err);
            delete global.ttSession[sender];
            await sock.sendMessage(from, { text: `❌ Terjadi gangguan jaringan saat memproses permintaan.` }, { quoted: mek });
        }
        return;
    }

    // =================================================================
    // 2. JALUR UTAMA (USER BARU PERTAMA KALI KIRIM LINK)
    // =================================================================
    const url = args[0] || body.trim();
    
    if (!url || !url.includes('tiktok.com')) {
        return sock.sendMessage(from, { 
            text: `⚠️ *FORMAT SALAH*\n\n👉 Contoh: *.${command} https://vt.tiktok.com/xxxxxx/*` 
        }, { quoted: mek });
    }

    // Simpan link ke session global user
    global.ttSession[sender] = {
        url: url,
        timeout: setTimeout(() => {
            if (global.ttSession[sender]) delete global.ttSession[sender];
        }, 120000)
    };

    const menuPilihan = `🎬 *TIKTOK DOWNLOADER ULTRA HD* 🎬\n\n` +
                        `Link berhasil dideteksi! Silakan *REPLY/BALAS* pesan ini dengan mengetik angka pilihannya:\n\n` +
                        `*1* ➔ Kirim Biasa (Bisa langsung diputar)\n` +
                        `*2* ➔ Document (Kualitas murni file asli/1080p)\n` +
                        `*3* ➔ Audio (Format Lagu/MP3 Musik Asli)\n\n` +
                        `⏳ _Sesi memilih aktif selama 2 menit._`;

    await sock.sendMessage(from, { text: menuPilihan }, { quoted: mek });
};
