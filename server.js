require("dotenv").config();
const http = require('http');
const express = require('express');
const multer = require('multer');
const path = require('path');
const WebSocket = require('ws');
const connectDB = require('./db/database');

const app = express();
const port = 3000;
let databaseInstance;
const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

let pool;

(async () => {
  try {
    pool = await connectDB();
  } catch (error) {
    console.error("Failed to initialize database connection", error.message);
    process.exit(1);
  }
})();

console.log(`WebSocket and Express server running on http://localhost:${port}`);

function broadcast(message) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}
console.log("object");

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

app.get("/", async (_, res)  => {
    try {
        const [rows] = await pool.query("SELECT * FROM device");
        res.status(200).json({ success: true, data: rows });
      } catch (error) {
        console.error("Error executing query:", error.message);
        res.status(500).json({ error: "Database query failed." });
      }
});

app.get('/capture_screenshot', (req, res) => {
    console.log('API endpoint hit: Triggering screenshot capture');
    broadcast('capture_screenshot');
    res.status(200).json({ message: 'Screenshot capture instruction sent to clients.' });
});

app.post('/upload', upload.single('file'), (req, res) => {
    try {
        const file = req.file;

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

server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
