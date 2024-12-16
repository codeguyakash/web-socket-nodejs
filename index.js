const WebSocket = require('ws');
const express = require('express');

const app = express();
const port = 3000;
const wsPort = 8080;

const wss = new WebSocket.Server({ port: wsPort });

console.log(`WebSocket server started on ws://localhost:${wsPort}`);

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


    app.get('/capture_screenshot', (req, res) => {
        console.log('API endpoint hit: Triggering screenshot capture');
        broadcast('capture_screenshot');
        res.status(200).json({ message: 'Screenshot capture instruction sent to clients.' });
    });

});
app.listen(port, () => {
    console.log(`Express server running on http://localhost:${port}`);
})