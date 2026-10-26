const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = async (sock, mek, { command }) => {
    const from = mek.key.remoteJid;

    // Deteksi tipe pesan (langsung atau reply)
    const type = mek.message?.imageMessage || mek.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage 
                 ? 'image' 
                 : mek.message?.videoMessage || mek.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage 
                 ? 'video' 
                 : null;

    if (!type) {
        return sock.sendMessage(from, { text: `⚠️ Kirim gambar/video dengan caption *.${command}* atau reply gambarnya bro!` }, { quoted: mek });
    }

    // Ambil struktur pesan download-nya
    const downloadMek = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage 
                        ? mek.message.extendedTextMessage.contextInfo.quotedMessage 
                        : mek.message;

    // Bikin nama file temporary unik
    const getRandom = (ext) => `${Math.floor(Math.random() * 10000)}${ext}`;
    const filename = path.join(__dirname, getRandom(''));
    const mediaInput = `${filename}.${type === 'image' ? 'jpg' : 'mp4'}`;
    const stickerOutput = `${filename}.webp`;

    try {
        await sock.sendMessage(from, { text: `⏳ [ PROCESS ] Sedang mencetak stiker, tunggu bentar...` }, { quoted: mek });

        // Download media jadi buffer
        const stream = await downloadContentFromMessage(
            downloadMek[`${type}Message`],
            type
        );

        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // Tulis buffer media ke file temporary
        fs.writeFileSync(mediaInput, buffer);

        // FORMULA FIX MUTLAK: Foto utuh gak kepotong (decrease ratio) + Sisa kanan kiri dipaksa TRANSPARAN MURNI (0x00000000@0)
        const ffmpegCmd = type === 'image'
            ? `ffmpeg -i ${mediaInput} -vcodec libwebp -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(512-iw)/2:(512-ih)/2:color=0x00000000@0" -y ${stickerOutput}`
            : `ffmpeg -i ${mediaInput} -vcodec libwebp -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(512-iw)/2:(512-ih)/2:color=0x00000000@0,fps=15" -loop 0 -preset default -an -vsync 0 -pix_fmt yuv420p -y ${stickerOutput}`;

        exec(ffmpegCmd, async (err) => {
            // Hapus file input temporary
            if (fs.existsSync(mediaInput)) fs.unlinkSync(mediaInput);

            if (err) {
                console.error('[ERROR FFMPEG CONVERT]:', err);
                if (fs.existsSync(stickerOutput)) fs.unlinkSync(stickerOutput);
                return sock.sendMessage(from, { text: `❌ Gagal memproses stiker bro!` }, { quoted: mek });
            }

            // Baca hasil file webp
            const stickerBuffer = fs.readFileSync(stickerOutput);

            // Kirim hasil stiker ke grup
            await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: mek });

            // Hapus file output temporary setelah dikirim
            if (fs.existsSync(stickerOutput)) fs.unlinkSync(stickerOutput);
        });

    } catch (err) {
        console.error('[ERROR STICKER.JS]:', err);
        if (fs.existsSync(mediaInput)) fs.unlinkSync(mediaInput);
        if (fs.existsSync(stickerOutput)) fs.unlinkSync(stickerOutput);
        return sock.sendMessage(from, { text: `❌ Waduh terjadi error internal!` }, { quoted: mek });
    }
};
