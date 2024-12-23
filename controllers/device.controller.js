require('dotenv').config();
const path = require('path');
const fs = require('fs');


let pool;
const { broadcast } = require('../sockets/websocket');

const URL = process.env.LIVE_URL ?? 'http://localhost:3000';
const initDeviceController = (dbPool) => {
    pool = dbPool;
};

const getDevices = async (_, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM device');
        res.status(200).json({ success: true, data: rows.length });
    } catch (error) {
        console.error('Error executing query:', error.message);
        res.status(500).json({ success: false, message: 'Error executing query', error: error.message });
    }
};

const rebootDevice = (req, res) => {
    broadcast('reboot');
    res.status(200).json({ message: 'Rebooting device' });
};

const restartApp = (req, res) => {
    broadcast('restart_app');
    res.status(200).json({ message: 'Restart App Success' });
};

const captureScreenshot = (req, res) => {
    console.log('Triggering screenshot capture');
    broadcast('capture_screenshot');
    res.status(200).json({ message: 'Screenshot capture triggered' });
};

const getScreenshot = async (req, res) => {
    const files = fs.readdirSync(path.join(__dirname, '../uploads'));
    try {
        const file = files[files.length - 1];
        const filePath = `${URL}/uploads/${file}`;
        res.status(200).json({ message: 'Screenshot requested', fileName: filePath });
    } catch (error) {
        console.error('Error getting screenshot:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};

const uploadFile = (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        res.status(200).json({
            message: 'File uploaded successfully',
            fileName: file.filename,
            filePath: `/uploads/${file.filename}`,
            filePath: `${URL}/uploads/${file.filename}`
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};

module.exports = {
    initDeviceController,
    getDevices,
    rebootDevice,
    restartApp,
    captureScreenshot,
    getScreenshot,
    uploadFile,
};
