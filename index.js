const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const deviceRoutes = require('./routes/device.routes');

const app = express();
const port = 3000;

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });


function broadcast(message) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.send('Welcome to the WebSocket server!');
    // console.log(ws);

    ws.on('message', (message) => {
        console.log(`Received from client: ${message}`);
        if (message === '@codeguyakash') {
            console.log('Sending screenshot capture instruction');
            ws.send('capture_screenshot');
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

app.use(deviceRoutes);

app.get('/capture_screenshot', (req, res) => {
    broadcast('capture_screenshot');
    res.status(200).json({ message: 'Screenshot Captured' });
});

server.listen(port, () => {
    console.log(`WebSocket 🔌 and Express ⚙️ Server running at: 👉 http://localhost:${port} 🖥️`);

});
