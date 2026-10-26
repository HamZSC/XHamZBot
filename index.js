const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');

const pino = require('pino');
const fs = require('fs');
const readline = require('readline');

const logger = pino({ level: 'silent' });
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger,
        printQRInTerminal: true,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        generateHighQualityLinkPreview: true,
        browser: ['X-Bot Multi Device', 'Chrome', '1.0.0']
    });

    if (!sock.authState.creds.registered) {
        console.log('🔄 Mempersiapkan proses tautan perangkat...');
        setTimeout(async () => {
            let phoneNumber = await question('📱 Masukkan Nomor HP Bot (Contoh: 628123456789): ');
            phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
            if (phoneNumber.startsWith('0')) phoneNumber = '62' + phoneNumber.slice(1);

            try {
                let code = await sock.requestPairingCode(phoneNumber);
                code = code?.match(/.{1,4}/g)?.join('-') || code;
                console.log(`\n🔑 KODE PAIRING WHATSAPP KAMU: \x1b[32m${code}\x1b[0m\n`);
            } catch (err) {
                console.error('❌ Gagal meminta kode pairing:', err.message);
            }
        }, 3000);
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            if (statusCode === DisconnectReason.loggedOut) {
                console.log('⚠️ Sesi Logged Out! Menghapus folder session...');
                if (fs.existsSync('./session')) fs.rmSync('./session', { recursive: true, force: true });
                process.exit(1);
            } else {
                setTimeout(() => { startBot(); }, 3000);
            }
        } else if (connection === 'open') {
            console.log('🟢 [KONEKSI BERHASIL] Bot WhatsApp Siap Digunakan!');
        }
    });

    // PENGHUBUNG UTAMA KE MESSAGE.JS
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek || !mek.message) return;
            if (mek.key && mek.key.remoteJid === 'status@broadcast') return;
            
            // Panggil handler dari lib/message.js
            await require('./event/message')(sock, mek);
        } catch (err) {
            console.error('[ERROR MESSAGES.UPSERT]:', err);
        }
    });
}

startBot();
