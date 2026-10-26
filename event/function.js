const fs = require('fs');
const { addDuit } = require('./economy');

async function checkAfk(sock, mek, { from, senderNumber, senderName }) {
    if (!fs.existsSync('./data/afk.json')) return;
    let afkData = JSON.parse(fs.readFileSync('./data/afk.json', 'utf-8'));
    if (afkData[senderNumber]) {
        delete afkData[senderNumber];
        fs.writeFileSync('./data/afk.json', JSON.stringify(afkData, null, 2));
        await sock.sendMessage(from, { text: `👋 *WELCOME BACK!*\n\nStatus AFK *${senderName}* telah dicabut.` }, { quoted: mek });
    }
    const mentioned = mek.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    for (let jid of mentioned) {
        let num = jid.split('@')[0];
        if (afkData[num]) {
            await sock.sendMessage(from, { text: `💤 *JANGAN DIGANGGU!*\n\nOrang yang kamu tag (*${afkData[num].name}*) sedang AFK.\n📝 *Alasan:* _${afkData[num].reason}_` }, { quoted: mek });
        }
    }
}

const listIgnore = ['menu', 'help', 'ping', 'afk', 'jadian', 'addprem', 'delprem', 'broadcast', 'susunkata', 'dompet', 'duit', 'tebakgambar', 'tts', 'tebakkota', 'siapaaku', 'tebakbendera', 'tebakkata', 'math', 'caklontong'];

function validateGame(mek, keyword) {
    const quotedText = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation || mek.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text || mek.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage?.caption || "";
    return !mek.message?.extendedTextMessage?.contextInfo?.stanzaId || quotedText.includes(keyword);
}

async function handleAnswer(sock, mek, session, from, body, sn, name, kw, globalKey, prize, customClue) {
    const ansUser = body.trim().toLowerCase();
    const ansRight = session.jawaban.toLowerCase();
    if (!validateGame(mek, kw)) return;

    if (ansUser === ansRight) {
        clearTimeout(session.timeout);
        delete global[globalKey][from];
        addDuit(sn, prize);
        return await sock.sendMessage(from, { text: `🎉 *JAWABAN LU BENER!* 🎉\n\n*${name}* sukses menebak!\n👑 Jawaban: *${ansRight.toUpperCase()}*\n💰 Hadiah: *+$${prize}* masuk dompet!` }, { quoted: mek });
    }
    if (ansRight.includes(ansUser) && ansUser.length >= 3) {
        return await sock.sendMessage(from, { text: customClue || `🤔 *DIKIT LAGI NYEREPET!* Jawaban lu (*${body.trim()}*) udah hampir benar, ayo koreksi lagi bro!` }, { quoted: mek });
    }
    if (ansUser.length > 1 && !listIgnore.includes(ansUser)) {
        return await sock.sendMessage(from, { text: `❌ *SALAH TOTAL!* bukan *"${body.trim()}"*.\n🤖 Ayo fokus dan coba lagi bro!` }, { quoted: mek });
    }
}

async function checkGameAnswers(sock, mek, { from, body, senderNumber, senderName }) {
    if (global.susunkata && global.susunkata[from]) {
        await handleAnswer(sock, mek, { jawaban: global.susunkata[from].soal.jawaban, timeout: global.susunkata[from].timeout }, from, body, senderNumber, senderName, "GAME SUSUN KATA", "susunkata", 500);
    }
}

async function checkTebakGambar(sock, mek, { from, body, senderNumber, senderName }) {
    if (global.tebakgambar && global.tebakgambar[from]) {
        await handleAnswer(sock, mek, global.tebakgambar[from], from, body, senderNumber, senderName, "GAME TEBAK GAMBAR", "tebakgambar", 600);
    }
}

async function checkTts(sock, mek, { from, body, senderNumber, senderName }) {
    if (global.tts && global.tts[from]) {
        await handleAnswer(sock, mek, global.tts[from], from, body, senderNumber, senderName, "GAME TEKA-TEKI SILANG", "tts", 450);
    }
}

async function checkTebakKota(sock, mek, { from, body, senderNumber, senderName }) {
    if (global.tebakkota && global.tebakkota[from]) {
        await handleAnswer(sock, mek, global.tebakkota[from], from, body, senderNumber, senderName, "GAME TEBAK KOTA INDONESIA", "tebakkota", 550);
    }
}

async function checkSiapaAku(sock, mek, { from, body, senderNumber, senderName }) {
    if (global.siapaaku && global.siapaaku[from]) {
        await handleAnswer(sock, mek, global.siapaaku[from], from, body, senderNumber, senderName, "GAME SIAPA AKU", "siapaaku", 500);
    }
}

async function checkTebakBendera(sock, mek, { from, body, senderNumber, senderName }) {
    if (global.tebakbendera && global.tebakbendera[from]) {
        await handleAnswer(sock, mek, global.tebakbendera[from], from, body, senderNumber, senderName, "GAME TEBAK BENDERA NEGARA", "tebakbendera", 500);
    }
}

async function checkTebakKataBaku(sock, mek, { from, body, senderNumber, senderName }) {
    if (global.tebakkata && global.tebakkata[from]) {
        if (!validateGame(mek, "GAME TEBAK KATA BAKU")) return;
        if (body.trim().toLowerCase() === global.tebakkata[from].jawaban.toLowerCase()) {
            clearTimeout(global.tebakkata[from].timeout);
            delete global.tebakkata[from];
            addDuit(senderNumber, 400);
            return await sock.sendMessage(from, { text: `🎉 *JAWABAN BENER!* 🎉\n\n*${senderName}* paham bahasa baku!\n👑 Jawaban: *${body.trim().toUpperCase()}*\n💰 Hadiah: *+$400*` }, { quoted: mek });
        }
        if (body.trim().length > 1 && !listIgnore.includes(body.trim().toLowerCase())) {
            return await sock.sendMessage(from, { text: `❌ *SALAH NYET!* Coba opsi yang satunya lagi bro!` }, { quoted: mek });
        }
    }
}

async function checkMath(sock, mek, { from, body, senderNumber, senderName }) {
    if (global.math && global.math[from]) {
        if (!validateGame(mek, "GAME ADU BERHITUNG")) return;
        if (body.trim() === global.math[from].jawaban) {
            clearTimeout(global.math[from].timeout);
            delete global.math[from];
            addDuit(senderNumber, 500);
            return await sock.sendMessage(from, { text: `🎉 *GENIUS! JAWABAN LU BENER!* 🎉\n\n*${senderName}* ngitung paling cepet!\n👑 Jawaban: *${body.trim()}*\n💰 Hadiah: *+$500*` }, { quoted: mek });
        }
        if (/^-?\d+$/.test(body.trim())) {
            return await sock.sendMessage(from, { text: `❌ *SALAH HITUNG!* Hasilnya bukan *${body.trim()}* bro. Cari kalkulator gih!` }, { quoted: mek });
        }
    }
}

async function checkCakLontong(sock, mek, { from, body, senderNumber, senderName }) {
    if (global.caklontong && global.caklontong[from]) {
        await handleAnswer(sock, mek, global.caklontong[from], from, body, senderNumber, senderName, "GAME TEBAK CAK LONTONG", "caklontong", 600, `🤔 *DIKIT LAGI PAS!* Jawabannya udah deket keyword plesetannya. Tweak dikit lagi!`);
    }
}

module.exports = { checkAfk, checkGameAnswers, checkTebakGambar, checkTts, checkTebakKota, checkSiapaAku, checkTebakBendera, checkTebakKataBaku, checkMath, checkCakLontong };
