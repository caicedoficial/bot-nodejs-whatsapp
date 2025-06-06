const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Cliente está listo para enviar mensajes.');
});

app.post('/send-message', async (req, res) => {
    const groupName = req.body.groupName;
    const message = req.body.message;

    try {
        const chats = await client.getChats();
        const group = chats.find(chat => chat.isGroup && chat.name === groupName);

        if (!group) {
            return res.status(404).send({ status: "error", error: "Grupo no encontrado." });
        }

        await client.sendMessage(group.id._serialized, message);
        res.send("Mensaje enviado correctamente.");

    } catch (err) {
        res.status(500).send("Error al enviar el mensaje -> Notificar al personal encargado." );
    }
});

client.initialize();

app.listen(3000, '0.0.0.0', () => {
  console.log("Servidor escuchando...");
});