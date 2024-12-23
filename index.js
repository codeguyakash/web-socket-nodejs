require('dotenv').config();
const http = require('http');
const express = require('express');
const path = require('path');
const connectDB = require('./db/database');
const deviceRoutes = require('./routes/device.routes');
const { initWebSocket } = require('./sockets/websocket');
const { initDeviceController } = require('./controllers/device.controller');
// const errorHandler = require('./middleware/error.handler');


const app = express();
const PORT = process.env.PORT || 4200;
const server = http.createServer(app);

// Middleware
app.use(express.json());
app.use('/api/device', deviceRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use(errorHandler);

app.get('/', (_, res) => {
    res.send('Server Running...🎉');
});

(async () => {
    try {
        const pool = await connectDB();
        initDeviceController(pool);
        initWebSocket(server);

        server.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
})();
