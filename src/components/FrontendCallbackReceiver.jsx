import React, { useState, useEffect, useRef } from 'react';
import {
    CheckCircle,
    AlertCircle,
    Clock,
    Webhook,
    Bell,
    Eye,
    Trash2,
    Activity,
    Signal,
    Database,
    ExternalLink,
    Copy,
    Play,
    Wifi,
    WifiOff,
    Server
} from 'lucide-react';
import Navigation from './Navigation';

const FrontendCallbackReceiver = () => {
    const [callbacks, setCallbacks] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [stats, setStats] = useState({
        total: 0,
        success: 0,
        error: 0,
        pending: 0
    });
    const [selectedCallback, setSelectedCallback] = useState(null);
    const [filter, setFilter] = useState('all');
    const [callbackServerUrl, setCallbackServerUrl] = useState('http://localhost:3001');
    const [ngrokUrl, setNgrokUrl] = useState('');
    const [serverHealth, setServerHealth] = useState(null);
    
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    // เริ่ม WebSocket connection เมื่อ component mount
    useEffect(() => {
        loadStoredCallbacks();
        connectToCallbackServer();
        checkServerHealth();
        
        // Check server health every 30 seconds
        const healthInterval = setInterval(checkServerHealth, 30000);

        return () => {
            cleanup();
            clearInterval(healthInterval);
        };
    }, [callbackServerUrl]);

    // คำนวณ stats เมื่อ callbacks เปลี่ยน
    useEffect(() => {
        const newStats = callbacks.reduce(
            (acc, cb) => {
                acc.total++;
                // ตรวจสอบ status จากหลายระดับ
                const status = (cb.actualStatus || cb.status || cb.data?.status || '').toString().toUpperCase();
                
                switch (status) {
                    case 'SUCCESS':
                        acc.success++;
                        break;
                    case 'ERROR':
                    case 'FAIL':
                    case 'FAILED':
                        acc.error++;
                        break;
                    case 'PENDING':
                    case 'PROCESSING':
                        acc.pending++;
                        break;
                    default:
                        acc.pending++;
                }
                return acc;
            },
            { total: 0, success: 0, error: 0, pending: 0 }
        );
        setStats(newStats);
    }, [callbacks]);

    // Request permission for notifications
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // เชื่อมต่อ WebSocket กับ callback server
    const connectToCallbackServer = () => {
        try {
            const wsUrl = callbackServerUrl.replace('http', 'ws');
            console.log(`🔌 Connecting to callback server: ${wsUrl}`);
            
            wsRef.current = new WebSocket(wsUrl);
            
            wsRef.current.onopen = () => {
                console.log('✅ Connected to callback server');
                setConnectionStatus('connected');
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                    reconnectTimeoutRef.current = null;
                }
            };
            
            wsRef.current.onmessage = (event) => {
                try {
                    const callbackData = JSON.parse(event.data);
                    handleIncomingCallback(callbackData);
                } catch (error) {
                    console.error('❌ Error parsing callback message:', error);
                }
            };
            
            wsRef.current.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                setConnectionStatus('error');
            };
            
            wsRef.current.onclose = () => {
                console.log('🔌 WebSocket connection closed');
                setConnectionStatus('disconnected');
                
                // Auto-reconnect after 5 seconds
                reconnectTimeoutRef.current = setTimeout(() => {
                    console.log('🔄 Attempting to reconnect...');
                    connectToCallbackServer();
                }, 5000);
            };
            
        } catch (error) {
            console.error('❌ Failed to connect to callback server:', error);
            setConnectionStatus('error');
        }
    };

    // Check callback server health
    const checkServerHealth = async () => {
        try {
            const response = await fetch(`${callbackServerUrl}/health`);
            const health = await response.json();
            setServerHealth(health);
            console.log('❤️ Server health:', health);
        } catch (error) {
            console.error('❌ Failed to check server health:', error);
            setServerHealth(null);
        }
    };

    // จัดการ callback ที่เข้ามา
    const handleIncomingCallback = (callbackData) => {
        console.log('🎉 NSW Callback received:', callbackData);
        
        // จัดการ data structure ที่มี type และ payload
        let processedCallback;
        
        if (callbackData.type === 'nsw_callback' && callbackData.payload) {
            // กรณีที่มี wrapper payload
            processedCallback = {
                ...callbackData.payload,
                id: callbackData.payload.id || `callback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                receivedAt: callbackData.payload.receivedAt || new Date().toISOString(),
                timestamp: callbackData.payload.timestamp || new Date().toISOString(),
                source: callbackData.payload.source || 'NSW API',
                // เพิ่มข้อมูลจาก nested data
                actualStatus: callbackData.payload.data?.status || callbackData.payload.status,
                messageTH: callbackData.payload.data?.messageTH,
                messageEN: callbackData.payload.data?.messageEN,
                documentId: callbackData.payload.data?.data?.document_id,
                originalData: callbackData // เก็บข้อมูลต้นฉบับไว้
            };
        } else {
            // กรณี structure เดิม
            processedCallback = {
                ...callbackData,
                id: callbackData.id || `callback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                receivedAt: callbackData.receivedAt || new Date().toISOString(),
                timestamp: callbackData.timestamp || new Date().toISOString(),
                source: callbackData.source || 'NSW API'
            };
        }
        
        // เพิ่มเข้า state
        setCallbacks(prev => [processedCallback, ...prev.slice(0, 99)]);
        
        // บันทึกลง localStorage
        storeCallback(processedCallback);
        
        // แสดง notification
        showNotification(processedCallback);
    };

    // แสดง notification
    const showNotification = (callback) => {
        if (Notification.permission === 'granted') {
            new Notification('NSW API Callback Received', {
                body: `Transaction: ${callback.transactionId}\nStatus: ${callback.status}`,
                icon: '/favicon.ico',
                tag: `nsw-callback-${callback.id}`,
                requireInteraction: false
            });
        }
    };

    // บันทึก callback ลง localStorage
    const storeCallback = (callback) => {
        try {
            const stored = JSON.parse(localStorage.getItem('nswCallbacks') || '[]');
            stored.unshift(callback);
            localStorage.setItem('nswCallbacks', JSON.stringify(stored.slice(0, 50)));
        } catch (error) {
            console.error('❌ Error storing callback:', error);
        }
    };

    // โหลด callbacks ที่เก็บไว้
    const loadStoredCallbacks = () => {
        try {
            const stored = JSON.parse(localStorage.getItem('nswCallbacks') || '[]');
            setCallbacks(stored);
            console.log(`📋 Loaded ${stored} stored callbacks`);
        } catch (error) {
            console.error('❌ Error loading stored callbacks:', error);
        }
    };

    // Cleanup connections
    const cleanup = () => {
        if (wsRef.current) {
            wsRef.current.close();
        }
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
    };

    // ทดสอบส่ง callback
    const sendTestCallback = async () => {
        try {
            const testData = {
                transactionId: `MANUAL-TEST-${Date.now()}`,
                status: 'SUCCESS',
                data: {
                    taxNumber: '0123456789012',
                    companyName: 'บริษัท ทดสอบ Frontend Callback จำกัด',
                    result: 'Manual test callback from frontend'
                },
                timestamp: new Date().toISOString(),
                source: 'Manual Test'
            };

            const response = await fetch(`${callbackServerUrl}/api/test/callback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testData)
            });
            
            if (response.ok) {
                console.log('✅ Test callback sent successfully');
            } else {
                console.error('❌ Failed to send test callback');
            }
        } catch (error) {
            console.error('❌ Error sending test callback:', error);
        }
    };

    // Copy callback URL to clipboard
    const copyCallbackUrl = () => {
        const url = ngrokUrl || `${callbackServerUrl}/api/nsw/callback`;
        navigator.clipboard.writeText(url);
    };

    // กรอง callbacks ตาม filter ที่เลือก
    const filteredCallbacks = callbacks.filter(callback => {
        if (filter === 'all') return true;
        
        const status = (callback.actualStatus || callback.status || callback.data?.status || '').toString().toLowerCase();
        switch (filter) {
            case 'success':
                return status === 'success';
            case 'error':
                return status === 'error' || status === 'fail' || status === 'failed';
            case 'pending':
                return status === 'pending' || status === 'processing';
            default:
                return true;
        }
    });

    // ลบ callback ตัวเดียว
    const deleteCallback = (callbackId) => {
        setCallbacks(prev => prev.filter(cb => cb.id !== callbackId));
        
        // อัปเดต localStorage
        const filtered = callbacks.filter(cb => cb.id !== callbackId);
        localStorage.setItem('nswCallbacks', JSON.stringify(filtered));
    };

    // ลบ callbacks ทั้งหมด
    const clearAllCallbacks = () => {
        setCallbacks([]);
        localStorage.removeItem('nswCallbacks');
        setSelectedCallback(null);
    };

    // Helper function สำหรับแสดงวันที่
    const formatDate = (dateString) => {
        try {
            if (!dateString) return 'ไม่ระบุวันที่';
            
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'วันที่ไม่ถูกต้อง';
            }
            
            return date.toLocaleString('th-TH', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: 'Asia/Bangkok'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'วันที่ไม่ถูกต้อง';
        }
    };

    // Helper functions
    const getStatusIcon = (callback) => {
        const status = (callback.actualStatus || callback.status || callback.data?.status || '').toString().toLowerCase();
        switch (status) {
            case 'success':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'error':
            case 'fail':
            case 'failed':
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            case 'pending':
            case 'processing':
                return <Clock className="w-4 h-4 text-yellow-500" />;
            default:
                return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusColor = (callback) => {
        const status = (callback.actualStatus || callback.status || callback.data?.status || '').toString().toLowerCase();
        switch (status) {
            case 'success':
                return 'border-green-200 bg-green-50 text-green-700';
            case 'error':
            case 'fail':
            case 'failed':
                return 'border-red-200 bg-red-50 text-red-700';
            case 'pending':
            case 'processing':
                return 'border-yellow-200 bg-yellow-50 text-yellow-700';
            default:
                return 'border-gray-200 bg-gray-50 text-gray-600';
        }
    };

    const getDisplayStatus = (callback) => {
        return callback.actualStatus || callback.status || callback.data?.status || 'Unknown';
    };

    const getTransactionId = (callback) => {
        return callback.messageTH || callback.data?.messageTH || callback.document_id || 'Unknown';
    };

    const getConnectionIcon = () => {
        switch (connectionStatus) {
            case 'connected':
                return <Wifi className="w-4 h-4 text-green-500" />;
            case 'error':
                return <WifiOff className="w-4 h-4 text-red-500" />;
            default:
                return <Signal className="w-4 h-4 text-gray-400" />;
        }
    };

    const getConnectionColor = () => {
        switch (connectionStatus) {
            case 'connected':
                return 'border-green-200 bg-green-50 text-green-700';
            case 'error':
                return 'border-red-200 bg-red-50 text-red-700';
            default:
                return 'border-gray-200 bg-gray-50 text-gray-600';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />
            
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                        <Webhook className="w-8 h-8 mr-3 text-indigo-600" />
                        NSW API Callback Handler
                    </h1>
                    <p className="text-gray-600">
                        รับและจัดการ callback responses จาก NSW API แบบ real-time
                    </p>
                </div>

                {/* Server Configuration & Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600">Callback Server</span>
                            <Server className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={callbackServerUrl}
                                onChange={(e) => setCallbackServerUrl(e.target.value)}
                                className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                                placeholder="http://localhost:3001"
                            />
                            <button
                                onClick={connectToCallbackServer}
                                className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                            >
                                Connect
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600">Connection Status</span>
                            {getConnectionIcon()}
                        </div>
                        <div className={`px-2 py-1 rounded text-sm font-medium border ${getConnectionColor()}`}>
                            {connectionStatus === 'connected' && 'Connected'}
                            {connectionStatus === 'disconnected' && 'Disconnected'}
                            {connectionStatus === 'error' && 'Connection Error'}
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600">Server Health</span>
                            <Activity className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="text-sm text-gray-600">
                            {serverHealth ? (
                                <div className="text-green-600 font-medium">
                                    Healthy - Uptime: {Math.round(serverHealth.uptime)}s
                                </div>
                            ) : (
                                <div className="text-red-600">Unavailable</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Responses</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <Database className="w-8 h-8 text-indigo-600" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Success</p>
                                <p className="text-2xl font-bold text-green-600">{stats.success}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Errors</p>
                                <p className="text-2xl font-bold text-red-600">{stats.error}</p>
                            </div>
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                            </div>
                            <Clock className="w-8 h-8 text-yellow-600" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Callbacks List */}
                    <div className="bg-white rounded-lg shadow-lg">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Recent Callbacks 
                                    <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                                        {filteredCallbacks.length}
                                    </span>
                                    {filter !== 'all' && (
                                        <span className="ml-1 text-sm text-gray-500">
                                            of {stats.total} total
                                        </span>
                                    )}
                                </h3>
                                <div className="flex items-center space-x-2">
                                    <select
                                        value={filter}
                                        onChange={(e) => setFilter(e.target.value)}
                                        className="px-3 py-1 border border-gray-300 rounded text-sm"
                                    >
                                        <option value="all">All ({stats.total})</option>
                                        <option value="success">Success ({stats.success})</option>
                                        <option value="error">Error ({stats.error})</option>
                                        <option value="pending">Pending ({stats.pending})</option>
                                    </select>
                                    <button
                                        onClick={clearAllCallbacks}
                                        className="px-3 py-1 text-red-600 hover:bg-red-50 rounded text-sm flex items-center"
                                    >
                                        <Trash2 className="w-4 h-4 mr-1" />
                                        Clear All
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {filteredCallbacks.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">
                                    <Webhook className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p>
                                        {filter === 'all' 
                                            ? 'No callbacks received yet'
                                            : `No ${filter} callbacks found`
                                        }
                                    </p>
                                    <p className="text-sm mt-2">
                                        {connectionStatus === 'connected' 
                                            ? 'Waiting for NSW API callbacks...' 
                                            : 'Connect to callback server first'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2 p-4">
                                    {filteredCallbacks.map((callback) => (
                                        <div
                                            key={callback.id}
                                            onClick={() => setSelectedCallback(callback)}
                                            className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                                                selectedCallback?.id === callback.id ?
                                                    'border-indigo-300 bg-indigo-50' : 'border-gray-200'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center space-x-2">
                                                    {getStatusIcon(callback)}
                                                    <span className="font-medium text-gray-900">
                                                        {getTransactionId(callback)}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(callback)}`}>
                                                        {getDisplayStatus(callback)}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteCallback(callback.id);
                                                    }}
                                                    className="text-gray-400 hover:text-red-500"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                <div>⏰ {formatDate(callback.receivedAt || callback.timestamp)}</div>
                                                <div>📡 Source: {callback.source || 'Unknown'}</div>
                                                {callback.documentId && (
                                                    <div>📄 Doc ID: {callback.documentId}</div>
                                                )}
                                                {callback.messageTH && (
                                                    <div>💬 {callback.messageTH}</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Callback Details */}
                    <div className="bg-white rounded-lg shadow-lg">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <Eye className="w-5 h-5 mr-2" />
                                Callback Details
                            </h3>
                        </div>

                        <div className="p-6">
                            {selectedCallback ? (
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        {getStatusIcon(selectedCallback)}
                                        <h4 className="font-semibold text-lg">{getTransactionId(selectedCallback)}</h4>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedCallback)}`}>
                                            {getDisplayStatus(selectedCallback)}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium text-gray-600">Received:</span>
                                            <p className="text-gray-900">
                                                {formatDate(selectedCallback.receivedAt || selectedCallback.timestamp)}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-600">Source:</span>
                                            <p className="text-gray-900">{selectedCallback.source || 'Unknown'}</p>
                                        </div>
                                        {selectedCallback.documentId && (
                                            <>
                                                <div>
                                                    <span className="font-medium text-gray-600">Document ID:</span>
                                                    <p className="text-gray-900">{selectedCallback.documentId}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-600">Status Code:</span>
                                                    <p className="text-gray-900">{selectedCallback.data?.data?.status || 'N/A'}</p>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {(selectedCallback.messageTH || selectedCallback.messageEN) && (
                                        <div>
                                            <span className="font-medium text-gray-600 block mb-2">Messages:</span>
                                            <div className="bg-gray-50 p-3 rounded space-y-1">
                                                {selectedCallback.messageTH && (
                                                    <p className="text-sm"><strong>TH:</strong> {selectedCallback.messageTH}</p>
                                                )}
                                                {selectedCallback.messageEN && (
                                                    <p className="text-sm"><strong>EN:</strong> {selectedCallback.messageEN}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <span className="font-medium text-gray-600 block mb-2">Raw Data:</span>
                                        <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto max-h-60 overflow-y-auto">
                                            {JSON.stringify(selectedCallback.originalData || selectedCallback, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 py-12">
                                    <Eye className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p>Select a callback to view details</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-wrap gap-4">
                    <button
                        onClick={sendTestCallback}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center"
                    >
                        <Play className="w-4 h-4 mr-2" />
                        Send Test Callback
                    </button>

                    <button
                        onClick={copyCallbackUrl}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center"
                    >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Callback URL
                    </button>

                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-600">ngrok URL:</label>
                        <input
                            type="text"
                            value={ngrokUrl}
                            onChange={(e) => setNgrokUrl(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded text-sm"
                            placeholder="https://xxxxx.ngrok.io"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FrontendCallbackReceiver;