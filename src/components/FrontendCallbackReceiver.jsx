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
                switch (cb.status) {
                    case 'success':
                    case 'SUCCESS':
                        acc.success++;
                        break;
                    case 'error':
                    case 'ERROR':
                    case 'FAIL':
                        acc.error++;
                        break;
                    default:
                        acc.pending++;
                        break;
                }
                return acc;
            },
            { total: 0, success: 0, error: 0, pending: 0 }
        );
        setStats(newStats);
    }, [callbacks]);

    // Connect to callback server via WebSocket
    const connectToCallbackServer = () => {
        try {
            const wsUrl = callbackServerUrl.replace('http', 'ws');
            console.log('🔄 Connecting to callback server:', wsUrl);
            
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;
            
            ws.onopen = () => {
                console.log('✅ Connected to callback server');
                setConnectionStatus('connected');
                
                // Send ping to test connection
                ws.send(JSON.stringify({
                    type: 'ping',
                    timestamp: new Date().toISOString()
                }));
            };
            
            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    console.log('📨 Message from callback server:', message);
                    
                    if (message.type === 'nsw_callback') {
                        handleIncomingCallback(message.payload);
                    } else if (message.type === 'connection') {
                        console.log('🔗 Connection established:', message.message);
                    } else if (message.type === 'pong') {
                        console.log('🏓 Pong received');
                    }
                } catch (error) {
                    console.error('❌ Error parsing WebSocket message:', error);
                }
            };
            
            ws.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                setConnectionStatus('error');
            };
            
            ws.onclose = (event) => {
                console.log('❌ WebSocket connection closed:', event.code, event.reason);
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
        
        // เพิ่มเข้า state
        setCallbacks(prev => [callbackData, ...prev.slice(0, 99)]);
        
        // บันทึกลง localStorage
        storeCallback(callbackData);
        
        // แสดง notification
        showNotification(callbackData);
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
            console.log(`📋 Loaded ${stored.length} stored callbacks`);
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
            const response = await fetch(`${callbackServerUrl}/api/test/callback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    transactionId: `MANUAL-TEST-${Date.now()}`,
                    status: 'SUCCESS',
                    data: {
                        taxNumber: '0123456789012',
                        companyName: 'บริษัท ทดสอบ Frontend Callback จำกัด',
                        result: 'Manual test callback from frontend'
                    }
                })
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

    // กรอง callbacks
    const filteredCallbacks = callbacks.filter(callback => {
        if (filter === 'all') return true;
        return callback.status === filter;
    });

    // ลบ callback
    const deleteCallback = (id) => {
        setCallbacks(prev => prev.filter(cb => cb.id !== id));
        if (selectedCallback?.id === id) {
            setSelectedCallback(null);
        }
    };

    // ล้างทั้งหมด
    const clearAllCallbacks = () => {
        setCallbacks([]);
        setSelectedCallback(null);
        localStorage.removeItem('nswCallbacks');
    };

    // Request notification permission
    useEffect(() => {
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'success':
            case 'SUCCESS':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'error':
            case 'ERROR':
            case 'FAIL':
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            case 'pending':
            case 'PENDING':
                return <Clock className="w-5 h-5 text-yellow-500" />;
            default:
                return <Activity className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'success':
            case 'SUCCESS':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'error':
            case 'ERROR':
            case 'FAIL':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'pending':
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getConnectionStatusColor = () => {
        switch (connectionStatus) {
            case 'connected':
                return 'bg-green-100 text-green-800';
            case 'disconnected':
                return 'bg-red-100 text-red-800';
            case 'connecting':
                return 'bg-yellow-100 text-yellow-800';
            case 'error':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Navigation />
            
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                        <Webhook className="w-8 h-8 mr-3 text-indigo-600" />
                        Frontend NSW Callback Receiver
                    </h1>
                    <p className="text-gray-600">
                        รับ NSW API callback โดยตรงที่ Frontend ผ่าน Local Server + ngrok
                    </p>
                </div>

                {/* Server Configuration */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <Server className="w-5 h-5 mr-2" />
                        Callback Server Configuration
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Server Status */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Server Status</h3>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                    <span className="text-sm text-gray-600">Local Server:</span>
                                    <div className="flex items-center space-x-2">
                                        {connectionStatus === 'connected' ? (
                                            <Wifi className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <WifiOff className="w-4 h-4 text-red-500" />
                                        )}
                                        <span className={`text-xs px-2 py-1 rounded ${getConnectionStatusColor()}`}>
                                            {connectionStatus}
                                        </span>
                                    </div>
                                </div>
                                
                                {serverHealth && (
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                        <span className="text-sm text-gray-600">Connected Clients:</span>
                                        <span className="text-sm font-medium">{serverHealth.connectedClients}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Callback URLs */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Callback URLs</h3>
                            <div className="space-y-2">
                                <div className="p-3 bg-gray-50 rounded">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-gray-500">Local URL:</span>
                                        <button
                                            onClick={copyCallbackUrl}
                                            className="text-xs text-indigo-600 hover:text-indigo-800"
                                        >
                                            <Copy className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <code className="text-xs text-gray-700 break-all">
                                        {callbackServerUrl}/api/nsw/callback
                                    </code>
                                </div>
                                
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        placeholder="https://your-id.ngrok.io"
                                        value={ngrokUrl}
                                        onChange={(e) => setNgrokUrl(e.target.value)}
                                        className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded"
                                    />
                                    <button
                                        onClick={() => window.open('https://ngrok.com/', '_blank')}
                                        className="px-3 py-2 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center"
                                    >
                                        <ExternalLink className="w-3 h-3 mr-1" />
                                        ngrok
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3 mt-4 pt-4 border-t border-gray-200">
                        <button
                            onClick={sendTestCallback}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center text-sm"
                        >
                            <Play className="w-4 h-4 mr-2" />
                            Send Test Callback
                        </button>
                        
                        <button
                            onClick={connectToCallbackServer}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center text-sm"
                        >
                            <Signal className="w-4 h-4 mr-2" />
                            Reconnect
                        </button>
                        
                        <button
                            onClick={checkServerHealth}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center text-sm"
                        >
                            <Activity className="w-4 h-4 mr-2" />
                            Check Health
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                            <div className="text-sm text-gray-600">Total Received</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">{stats.success}</div>
                            <div className="text-sm text-gray-600">Success</div>
                        </div>
                        <div className="bg-red-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-red-600">{stats.error}</div>
                            <div className="text-sm text-gray-600">Errors</div>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                            <div className="text-sm text-gray-600">Pending</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Callbacks List */}
                    <div className="bg-white rounded-lg shadow-lg">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Recent Callbacks ({filteredCallbacks.length})
                                </h3>
                                <div className="flex items-center space-x-2">
                                    <select
                                        value={filter}
                                        onChange={(e) => setFilter(e.target.value)}
                                        className="px-3 py-1 border border-gray-300 rounded text-sm"
                                    >
                                        <option value="all">All</option>
                                        <option value="success">Success</option>
                                        <option value="error">Error</option>
                                        <option value="pending">Pending</option>
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
                                    <p>No callbacks received yet</p>
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
                                                selectedCallback?.id === callback.id ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center space-x-2">
                                                    {getStatusIcon(callback.status)}
                                                    <span className="font-medium text-gray-900">
                                                        {callback.transactionId}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(callback.status)}`}>
                                                        {callback.status}
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
                                                <div>⏰ {new Date(callback.receivedAt || callback.timestamp).toLocaleString('th-TH')}</div>
                                                <div>📡 Source: {callback.source}</div>
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
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
                                            <p className="text-gray-900 font-mono text-sm bg-gray-50 p-2 rounded">
                                                {selectedCallback.transactionId}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                            <div className="flex items-center space-x-2">
                                                {getStatusIcon(selectedCallback.status)}
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedCallback.status)}`}>
                                                    {selectedCallback.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Received Time</label>
                                            <p className="text-gray-900 text-sm">
                                                {new Date(selectedCallback.receivedAt || selectedCallback.timestamp).toLocaleString('th-TH')}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                                            <p className="text-gray-900 text-sm flex items-center">
                                                <Database className="w-4 h-4 mr-1" />
                                                {selectedCallback.source}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Headers Info */}
                                    {selectedCallback.headers && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Request Headers</label>
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <div className="grid grid-cols-1 gap-2 text-xs">
                                                    {Object.entries(selectedCallback.headers).map(([key, value]) => (
                                                        value && (
                                                            <div key={key} className="flex justify-between">
                                                                <span className="font-medium text-gray-600">{key}:</span>
                                                                <span className="text-gray-900 truncate ml-2">{value}</span>
                                                            </div>
                                                        )
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-gray-700">Callback Data</label>
                                            <button
                                                onClick={() => navigator.clipboard.writeText(JSON.stringify(selectedCallback.data, null, 2))}
                                                className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
                                            >
                                                <Copy className="w-4 h-4 mr-1" />
                                                Copy JSON
                                            </button>
                                        </div>
                                        <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto max-h-64 border">
                                            {JSON.stringify(selectedCallback.data, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 py-12">
                                    <Eye className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p>Select a callback to view details</p>
                                    <p className="text-sm mt-2">Callbacks will appear here when received</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Setup Instructions */}
                {connectionStatus !== 'connected' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
                        <h3 className="text-lg font-semibold text-yellow-900 mb-4">🚀 Setup Instructions</h3>
                        <div className="space-y-4 text-sm text-yellow-800">
                            <div>
                                <h4 className="font-medium mb-2">1. Start Callback Server:</h4>
                                <div className="bg-yellow-100 p-3 rounded font-mono text-xs">
                                    cd server<br/>
                                    npm install express cors ws<br/>
                                    node callback-server.js
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="font-medium mb-2">2. Expose to Internet (ngrok):</h4>
                                <div className="bg-yellow-100 p-3 rounded font-mono text-xs">
                                    ngrok http 3001<br/>
                                    # Copy the https URL to use as callback_url
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="font-medium mb-2">3. Use in NSW API Request:</h4>
                                <div className="bg-yellow-100 p-3 rounded font-mono text-xs">
                                    callback_url: "https://your-id.ngrok.io/api/nsw/callback"
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success State */}
                {connectionStatus === 'connected' && callbacks.length === 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6 text-center">
                        <Webhook className="w-16 h-16 mx-auto mb-4 text-green-400 animate-pulse" />
                        <h3 className="text-lg font-semibold text-green-900 mb-2">Ready to Receive NSW Callbacks!</h3>
                        <p className="text-green-700 mb-4">
                            Frontend callback server is running and connected.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="bg-white p-4 rounded border">
                                <h4 className="font-medium text-green-900 mb-2">Local Callback URL:</h4>
                                <code className="text-xs text-gray-600 break-all">
                                    {callbackServerUrl}/api/nsw/callback
                                </code>
                            </div>
                            
                            <div className="bg-white p-4 rounded border">
                                <h4 className="font-medium text-green-900 mb-2">Public URL (ngrok):</h4>
                                <code className="text-xs text-gray-600 break-all">
                                    {ngrokUrl || 'Set ngrok URL above'}/api/nsw/callback
                                </code>
                            </div>
                        </div>
                        
                        <button
                            onClick={sendTestCallback}
                            className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center mx-auto"
                        >
                            <Play className="w-4 h-4 mr-2" />
                            Send Test Callback
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FrontendCallbackReceiver;