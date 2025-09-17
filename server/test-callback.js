// server/test-callback.js
// สคริปต์สำหรับทดสอบส่ง callback ไปยัง callback server

const axios = require('axios');

const CALLBACK_SERVER_URL = process.env.CALLBACK_SERVER_URL || 'http://localhost:3001';

// ตัวอย่างข้อมูล callback จาก NSW API
const sampleCallbacks = [
    {
        transactionId: 'NSW-SUCCESS-001',
        status: 'SUCCESS',
        data: {
            taxNumber: '0123456789012',
            companyName: 'บริษัท ตัวอย่าง จำกัด',
            nameEnglish: 'Example Company Limited',
            status: 'Active',
            capitalAmount: 5000000,
            incorporationDate: '2020-01-01',
            address: {
                houseNumber: '123/45',
                street: 'สุขุมวิท',
                district: 'คลองเตย',
                province: 'กรุงเทพมหานคร',
                postCode: '10110'
            },
            contact: {
                phone: '02-123-4567',
                email: 'info@example.com'
            },
            director: {
                name: 'นาย ตัวอย่าง ใจดี',
                nameEnglish: 'Mr. Example Jaidee'
            }
        },
        timestamp: new Date().toISOString()
    },
    {
        transactionId: 'NSW-ERROR-002',
        status: 'FAIL',
        error: {
            code: 'COMPANY_NOT_FOUND',
            message: 'ไม่พบข้อมูลบริษัทที่มีรหัสนิติบุคคลนี้',
            messageEn: 'Company with this tax ID not found'
        },
        timestamp: new Date().toISOString()
    },
    {
        transactionId: 'NSW-PENDING-003',
        status: 'PENDING',
        data: {
            taxNumber: '9876543210987',
            message: 'กำลังประมวลผลข้อมูล กรุณารอสักครู่',
            estimatedTime: '2-3 minutes'
        },
        timestamp: new Date().toISOString()
    }
];

// ฟังก์ชันส่ง callback
async function sendCallback(callbackData, delay = 0) {
    if (delay > 0) {
        console.log(`⏳ Waiting ${delay}ms before sending callback...`);
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    try {
        console.log(`📤 Sending callback: ${callbackData.transactionId}`);
        console.log(`📋 Status: ${callbackData.status}`);
        
        const response = await axios.post(
            `${CALLBACK_SERVER_URL}/api/nsw/callback`,
            callbackData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'NSW-API/1.0',
                    'X-NSW-Signature': 'mock-signature-12345',
                    'X-Request-ID': `req-${Date.now()}`
                }
            }
        );
        
        console.log(`✅ Callback sent successfully:`, response.data);
        console.log('---');
        
    } catch (error) {
        console.error(`❌ Failed to send callback:`, error.message);
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Data:`, error.response.data);
        }
        console.log('---');
    }
}

// ฟังก์ชันหลักสำหรับทดสอบ
async function runTests() {
    console.log('🚀 Starting NSW Callback Tests');
    console.log(`📡 Target server: ${CALLBACK_SERVER_URL}`);
    console.log('');
    
    // ตรวจสอบว่า callback server ทำงานอยู่หรือไม่
    try {
        const healthResponse = await axios.get(`${CALLBACK_SERVER_URL}/health`);
        console.log('❤️ Server health check:', healthResponse.data);
        console.log('');
    } catch (error) {
        console.error('❌ Callback server is not running!');
        console.error('   Please start the server first: node callback-server.js');
        console.error('');
        return;
    }
    
    // ส่ง callback ทีละตัว
    for (let i = 0; i < sampleCallbacks.length; i++) {
        await sendCallback(sampleCallbacks[i], i * 2000); // เว้นระยะ 2 วินาที
    }
    
    console.log('🎉 All test callbacks sent!');
    console.log('');
    console.log('📋 Check your frontend to see the received callbacks:');
    console.log('   http://localhost:3000/nsw-callback');
}

// รันการทดสอบ
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { sendCallback, sampleCallbacks };