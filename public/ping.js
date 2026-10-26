module.exports = async (sock, mek, { args }) => {
    const start = Date.now();
    const txt = `⚡ *PONG!*\nRespon kecepatan bot: *${Date.now() - start}ms*`;
    await sock.sendMessage(mek.key.remoteJid, { text: txt }, { quoted: mek });
};
