module.exports = async (sock, mek, { args, command, isOwner }) => {
    try {
        const from = mek.key.remoteJid;

        // 1. CEK APAKAH INI DI DALAM GRUP
        const isGroup = from.endsWith('@g.us');
        if (!isGroup) {
            return sock.sendMessage(from, { text: `⚠️ Fitur ini cuma bisa digunakan di dalam grup, bro!` }, { quoted: mek });
        }

        // 2. AMBIL DATA METADATA GRUP & MEMBER
        const groupMetadata = await sock.groupMetadata(from);
        const participants = groupMetadata.participants;
        
        // Ambil data sender (siapa yang ngetik perintah)
        const sender = mek.key.participant || mek.key.remoteJid;

        // 3. CEK APAKAH SENDER ADALAH ADMIN GRUP
        const groupAdmins = participants.filter(p => p.admin !== null).map(p => p.id);
        const isAdmin = groupAdmins.includes(sender);

        // PENGAMAN: Cuma Owner Bot ATAU Admin Grup yang boleh pakai
        if (!isOwner && !isAdmin) {
            return sock.sendMessage(from, { text: `⚠️ Fitur ini khusus buat *Admin Grup* atau *Owner Bot* demi menghindari spam, bro!` }, { quoted: mek });
        }

        // 4. AMBIL LIST SEMUA ID MEMBER UNTUK GHOST TAG
        const mems = participants.map(p => p.id);

        // 5. AMBIL TEKS PESAN DARI USER
        let pesanHidetag = args.join(' ');
        if (!pesanHidetag) {
            pesanHidetag = ` *...*`; // Teks default kalau user cuma ketik perintahnya doang
        }

        // 6. KIRIM PESAN GHOST MENTION (HIDETAG BENERAN)
        // Tanpa quoted: mek biar pesannya bener-bener bersih berdiri sendiri di grup
        await sock.sendMessage(from, { 
            text: pesanHidetag, 
            mentions: mems 
        });

        console.log(`[LOG] Public Hidetag sukses dieksekusi oleh ${isOwner ? 'Owner' : 'Admin'} di grup: ${groupMetadata.subject}`);

    } catch (error) {
        console.error("[EROR DI PUBLIC HIDETAG.JS]:", error);
        return sock.sendMessage(from, { text: `❌ Gagal hidetag. Pastikan bot udah jadi admin grup ya bro!` }, { quoted: mek });
    }
};
