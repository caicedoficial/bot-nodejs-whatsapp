const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Cliente está listo para enviar mensajes.');
});

app.post('/send-message', async (req, res) => {
    const groupName = req.body.groupName;
    const message = req.body.message;

    console.log("📩 Petición recibida:", req.body);

    try {
        const chats = await client.getChats();
        console.log("💬 Total de chats:", chats.length);

        const group = chats.find(chat => chat.isGroup && chat.name === groupName);

        if (!group) {
            console.warn("⚠️ Grupo no encontrado:", groupName);
            return res.status(404).send({ status: "error", error: "Grupo no encontrado." });
        }

        console.log("📌 Grupo encontrado:", group.name);
        console.log("🆔 ID del grupo:", group.id);

        await new Promise(resolve => setTimeout(resolve, 1000));

        const groupId = group.id && group.id._serialized ? group.id._serialized : group.id;
        console.log("🆔 groupId usado para enviar:", groupId, typeof groupId);
        await client.sendMessage(groupId, message);

        console.log("✅ Mensaje enviado correctamente.");
        res.send("Mensaje enviado correctamente.");

    } catch (err) {
        console.error("❌ Error al enviar mensaje:", err);
        res.status(500).send("Error al enviar el mensaje -> Notificar al personal encargado.");
    }
});

client.initialize();

app.listen(3000, '0.0.0.0', () => {
    console.log("🚀 Servidor escuchando...");
});
