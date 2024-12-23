const router = require('express').Router();
const { uploadHandler, index } = require('../controllers/device.controller');
const upload = require('../middleware/multer.middleware');

// Route to handle the index endpoint
router.get('/', index);

// Route to handle file uploads
router.post('/upload', upload.single('file'), uploadHandler);

module.exports = router;
