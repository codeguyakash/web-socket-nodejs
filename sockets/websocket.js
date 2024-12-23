const WebSocket = require('ws');

let wss;

const initWebSocket = (server) => {
    wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        console.log('Client connected');
        ws.send('Welcome to the WebSocket server!');

        ws.on('message', (message) => {
            console.log(`Received from client: ${message}`);
            if (message === 'codeguyakash') {
                ws.send('capture_screenshot');
            }
        });

        ws.on('close', () => console.log('Client disconnected'));
        ws.on('error', (error) => console.error('WebSocket error:', error));
    });
};

const broadcast = (message) => {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
};

module.exports = { initWebSocket, broadcast };
