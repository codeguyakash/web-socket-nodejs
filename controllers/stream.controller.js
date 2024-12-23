const fs = require('fs');
const path = require('path');

const streamVideo = async (req, res) => {
    const range = req.headers.range;
    const filePath = path.join(__dirname, '../uploads/nature.mp4');

    if (!fs.existsSync(filePath)) {
        console.log("File not found:", filePath);
        res.status(404).send("File not found");
        return;
    }

    if (!range) {
        const videoSize = fs.statSync(filePath).size;
        const headers = {
            "Content-Length": videoSize,
            "Content-Type": "video/mp4",
        };
        res.writeHead(200, headers);
        fs.createReadStream(filePath).pipe(res);
        return;
    }

    const videoSize = fs.statSync(filePath).size;
    const chunkSize = 2 * 1024 * 1024; // 2 MB chunk size
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + chunkSize, videoSize - 1);

    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    };

    res.writeHead(206, headers);
    const videoStream = fs.createReadStream(filePath, { start, end });
    videoStream.pipe(res);
};

module.exports = { streamVideo };
