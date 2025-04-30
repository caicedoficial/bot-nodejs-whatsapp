const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('Escanea este QR con WhatsApp:');
    qrcode.generate(qr, { small: true });
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

client.initialize();

app.listen(3000, () => {
    console.log('Servidor escuchando...');
});
