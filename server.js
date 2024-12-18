require("dotenv").config();
const http = require('http');
const express = require('express');
const multer = require('multer');
const path = require('path');
const WebSocket = require('ws');
const connectDB = require('./db/database');
const fs = require("fs");

const app = express();
const port = 3000;
const server = http.createServer(app);
let isUploadedImage = false;

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

wss.on('connection', (ws, req) => {
    console.log('Client connected');
    ws.send('Welcome to the WebSocket server!');


    // console.log(req);

    ws.on('message', (message) => {
        console.log(`Received from client: ${message}`);
        if (message === '@codeguyakash') {
            console.log('Sending screenshot capture instruction');
            ws.send('capture_screenshot');
        }
    });
    ws.on("screenshot_uploaded", (message) => {
        console.log('Screenshot Captured Acknowledged', message);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

app.get("/", async (_, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM device");
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Error executing query:", error.message);
        res.status(500).json({ error: "Database query failed." });
    }
});

app.post("/reboot", async (req, res) => {

    broadcast(`reboot`);
    res.status(200).json({ message: `Rebooting device` });
});


app.get('/capture_screenshot', async (req, res) => {
    console.log('Triggering screenshot capture');
    broadcast('capture_screenshot');
    res.status(200).json({ message: 'Screenshot capture triggered' });
});
app.get('/get_screenshot', async (req, res) => {
    console.log('Requesting screenshot');

    try {
        const file = await getFileAfterUpload();
        const path = `http://localhost:${port}/uploads/${file}`;
        res.status(200).json({ message: 'Screenshot requested', fileName: path });
    } catch (error) {
        console.error('Error getting screenshot:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }

});
app.get("/uploads/:file", (req, res) => {
    const file = req.params.file;
    const filePath = path.join(__dirname, '/uploads', file);
    res.sendFile(filePath);
});


getFileAfterUpload = async () => {
    const files = fs.readdirSync(path.join(__dirname, '/uploads'));
    const file = files[files.length - 1];
    return file;
}

app.post('/upload', upload.single('file'), (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        console.log(`File uploaded: ${file.filename}`);
        isUploadedImage = true;
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
