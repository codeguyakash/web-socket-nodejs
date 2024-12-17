const http = require('http');
const express = require('express');
const multer = require('multer');
const path = require('path');
const WebSocket = require('ws');

const app = express();
const port = 3000;

// Create HTTP server
const server = http.createServer(app);

// Attach WebSocket server to the HTTP server
const wss = new WebSocket.Server({ server });

console.log(`WebSocket and Express server running on http://localhost:${port}`);

// Function to broadcast messages to all connected WebSocket clients
function broadcast(message) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// Multer storage configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '/uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, `screenshot-${uniqueSuffix}${fileExtension}`);
    }
});
const upload = multer({ storage: storage });

// WebSocket connection logic
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
});

// Express API routes
app.get("/", (req, res) => {
    res.json({ message: "Welcome to Express and WebSocket Server!" });
});

app.get('/capture_screenshot', (req, res) => {
    console.log('API endpoint hit: Triggering screenshot capture');
    broadcast('capture_screenshot');
    res.status(200).json({ message: 'Screenshot capture instruction sent to clients.' });
});

app.post('/upload', upload.single('file'), (req, res) => {
    try {
        const file = req.file;

        // console.log(file);

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        console.log(`File uploaded: ${file.filename}`);
        res.status(200).json({
            message: 'File uploaded successfully',
            fileName: file.filename,
            filePath: `/uploads/${file.filename}`,
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

// Start the server with Express and WebSocket on the same port
server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
