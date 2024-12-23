const express = require('express');
const upload = require('../middleware/upload.middleware');
const {
    getDevices,
    rebootDevice,
    restartApp,
    captureScreenshot,
    getScreenshot,
    uploadFile,
} = require('../controllers/device.controller');

const { streamVideo } = require('../controllers/stream.controller');

const router = express.Router();

router.get('/', getDevices);
router.post('/reboot', rebootDevice);
router.post('/restart_app', restartApp);
router.get('/capture_screenshot', captureScreenshot);
router.get('/get_screenshot', getScreenshot);
router.post('/upload', upload.single('file'), uploadFile);
router.get("/video-stream", streamVideo);

module.exports = router;
