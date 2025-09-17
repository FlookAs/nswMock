// server/callback-server.js
// Express server สำหรับรับ NSW API callback โดยตรง

const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const PORT = process.env.CALLBACK_PORT || 3001;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'], // Vite และ React dev servers
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected clients
const connectedClients = new Set();

// WebSocket connection handler
wss.on('connection', (ws, req) => {
    console.log('🔌 Frontend client connected to WebSocket');
    connectedClients.add(ws);
    
    // Send welcome message
    ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to NSW Callback Server',
        timestamp: new Date().toISOString()
    }));
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('📨 Message from frontend:', data);
            
            if (data.type === 'ping') {
                ws.send(JSON.stringify({
                    type: 'pong',
                    timestamp: new Date().toISOString()
                }));
            }
        } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error);
        }
    });
    
    ws.on('close', () => {
        console.log('❌ Frontend client disconnected');
        connectedClients.delete(ws);
    });
    
    ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
        connectedClients.delete(ws);
    });
});

// Broadcast to all connected clients
function broadcastToClients(data) {
    const message = JSON.stringify(data);
    console.log(`📡 Broadcasting to ${connectedClients.size} clients:`, data);
    
    connectedClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        connectedClients: connectedClients.size,
        uptime: process.uptime()
    });
});

// NSW API Callback endpoint - รับ callback จาก NSW API โดยตรง
app.post('/api/nsw/callback', (req, res) => {
    const callbackData = req.body;
    const headers = req.headers;
    
    console.log('🎉 NSW API Callback Received!');
    console.log('📋 Headers:', JSON.stringify(headers, null, 2));
    console.log('📦 Body:', JSON.stringify(callbackData, null, 2));
    
    // สร้าง callback object ที่เป็นมาตรฐาน
    const processedCallback = {
        id: `cb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        transactionId: callbackData.transactionId || 
                      callbackData.transaction_id || 
                      callbackData.referenceId || 
                      'Unknown',
        status: determineStatus(callbackData),
        data: callbackData,
        source: 'NSW_API_Direct',
        headers: {
            'user-agent': headers['user-agent'],
            'content-type': headers['content-type'],
            'x-forwarded-for': headers['x-forwarded-for'],
            'authorization': headers['authorization'] ? '[REDACTED]' : undefined
        },
        receivedAt: new Date().toISOString()
    };
    
    // ส่งไปยัง Frontend ผ่าน WebSocket
    broadcastToClients({
        type: 'nsw_callback',
        payload: processedCallback
    });
    
    // บันทึกลงไฟล์ (optional)
    saveCallbackToFile(processedCallback);
    
    // ตอบกลับ NSW API
    res.status(200).json({
        status: 'received',
        message: 'Callback processed successfully',
        callbackId: processedCallback.id,
        timestamp: new Date().toISOString(),
        clientsNotified: connectedClients.size
    });
});

// Alternative webhook endpoint
app.post('/api/nsw/webhook', (req, res) => {
    console.log('🪝 NSW Webhook received, forwarding to callback handler...');
    req.url = '/api/nsw/callback';
    return app._router.handle(req, res);
});

// Determine callback status
function determineStatus(data) {
    // NSW API มักจะส่ง status field มา
    const status = data.status || data.result || data.statusCode || '';
    
    if (status === 'SUCCESS' || status === 'COMPLETED' || data.success === true) {
        return 'success';
    } else if (status === 'FAIL' || status === 'ERROR' || status === 'FAILED' || data.error) {
        return 'error';
    } else if (status === 'PENDING' || status === 'PROCESSING') {
        return 'pending';
    } else {
        // ถ้าไม่มี status field ให้ดูจาก HTTP status หรือมีข้อมูลหรือไม่
        return data.data || data.result ? 'success' : 'pending';
    }
}

// บันทึก callback ลงไฟล์ (สำหรับ debugging)
function saveCallbackToFile(callback) {
    const fs = require('fs');
    const path = require('path');
    
    try {
        const logsDir = path.join(__dirname, 'logs');
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }
        
        const filename = `callback_${new Date().toISOString().split('T')[0]}.json`;
        const filepath = path.join(logsDir, filename);
        
        let logs = [];
        if (fs.existsSync(filepath)) {
            logs = JSON.parse(fs.readFileSync(filepath, 'utf8'));
        }
        
        logs.push(callback);
        fs.writeFileSync(filepath, JSON.stringify(logs, null, 2));
        
        console.log(`💾 Callback saved to ${filepath}`);
    } catch (error) {
        console.error('❌ Error saving callback to file:', error);
    }
}

// Test endpoint สำหรับทดสอบ callback
app.post('/api/test/callback', (req, res) => {
    console.log('🧪 Test callback triggered');
    
    const testCallback = {
        transactionId: `TEST-${Date.now()}`,
        status: 'SUCCESS',
        data: {
            taxNumber: '0123456789012',
            companyName: 'บริษัท ทดสอบ จำกัด',
            result: 'Test callback from manual trigger'
        },
        timestamp: new Date().toISOString(),
        ...req.body
    };
    
    // Forward to callback handler
    req.body = testCallback;
    req.url = '/api/nsw/callback';
    return app._router.handle(req, res);
});

// CORS preflight
app.options('*', cors());

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('❌ Server error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

// Start server
server.listen(PORT, () => {
    console.log('🚀 NSW Frontend Callback Server started!');
    console.log(`📡 Server running on: http://localhost:${PORT}`);
    console.log(`🔗 WebSocket server on: ws://localhost:${PORT}`);
    console.log(`📥 NSW Callback endpoint: http://localhost:${PORT}/api/nsw/callback`);
    console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test/callback`);
    console.log(`❤️  Health check: http://localhost:${PORT}/health`);
    console.log('');
    console.log('🌐 To expose this server to NSW API, use:');
    console.log(`   ngrok http ${PORT}`);
    console.log('   Then use the ngrok URL as your callback_url');
    console.log('');
    console.log('⚡ Ready to receive NSW API callbacks!');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

module.exports = { app, server };