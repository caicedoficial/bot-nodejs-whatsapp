const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const QRCode = require('qrcode');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

let latestQR = null; // Almacena el último QR generado

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('Nuevo código QR generado');
    latestQR = qr;
});

client.on('ready', () => {
    console.log('Cliente está listo para enviar mensajes.');
});

client.on('auth_failure', (msg) => {
    console.error('Error de autenticación:', msg);
});

client.on('error', (err) => {
    console.error('Error general del cliente:', err);
});

// Ruta para que PHP pueda enviar mensajes
app.post('/send-message', async (req, res) => {
    const number = req.body.number;
    const message = req.body.message;

    const chatId = number + "@c.us";
    try {
        await client.sendMessage(chatId, message);
        res.send({ status: "success", message: "Mensaje enviado correctamente." });
    } catch (err) {
        res.status(500).send({ status: "error", error: err.toString() });
    }
});

// Ruta para ver el QR como imagen en el navegador
app.get('/qr', async (req, res) => {
    if (!latestQR) return res.send('QR no generado todavía.');
    try {
        const qrImage = await QRCode.toDataURL(latestQR);
        res.send(`<img src="${qrImage}" alt="QR Code" />`);
    } catch (error) {
        res.status(500).send('Error generando el QR.');
    }
});

client.initialize();

app.listen(3000, () => {
    console.log('Servidor escuchando...');
});
