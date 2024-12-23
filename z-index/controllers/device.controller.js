



function index(req, res) {
    res.json({ message: 'Welcome to the device controller' });
}


function uploadHandler(req, res) {
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
}
function captureScreenshot(req, res) {
    console.log('API endpoint hit: Triggering screenshot capture');
    broadcast('capture_screenshot');
    res.status(200).json({ message: 'Screenshot capture instruction sent to clients.' });
}

export { uploadHandler , index,captureScreenshot};