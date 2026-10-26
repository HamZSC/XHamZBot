const fs = require('fs');
const filePath = './data/economy.json';

// Pastikan folder dan file database economy tersedia
if (!fs.existsSync('./data')) fs.mkdirSync('./data');
if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify({}, null, 2));

// Fungsi mengambil jumlah duit user
function getDuit(senderNumber) {
    let data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return data[senderNumber] || 0;
}

// Fungsi menambah duit user (misal menang game)
function addDuit(senderNumber, amount) {
    let data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (!data[senderNumber]) data[senderNumber] = 0;
    
    data[senderNumber] += amount;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return data[senderNumber];
}

// Fungsi mengurangi duit user (misal buat taruhan atau denda)
function reduceDuit(senderNumber, amount) {
    let data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (!data[senderNumber]) data[senderNumber] = 0;
    
    data[senderNumber] -= amount;
    if (data[senderNumber] < 0) data[senderNumber] = 0; // Biar duit gak minus
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return data[senderNumber];
}

module.exports = { getDuit, addDuit, reduceDuit };
