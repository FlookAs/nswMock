import React, { useState, useEffect, useRef } from 'react';
import { Webhook, Activity, Server, Wifi, WifiOff, Signal, Eye, RefreshCw, Trash2, Play, Pause, Download } from 'lucide-react';

const FrontendCallbackReceiver = () => {
    const [callbacks, setCallbacks] = useState([]);
    const [selectedCallback, setSelectedCallback] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [serverUrl, setServerUrl] = useState('ws://localhost:3001');
    const [isAutoScroll, setIsAutoScroll] = useState(true);
    const [filter, setFilter] = useState('all');
    const wsRef = useRef(null);
    const callbacksEndRef = useRef(null);

    // Connect to WebSocket
    const connectWebSocket = () => {
        try {
            const wsUrl = serverUrl.replace('http://', 'ws://').replace('https://', 'wss://');
            wsRef.current = new WebSocket(wsUrl);
            
            wsRef.current.onopen = () => {
                console.log('Connected to callback server');
                setConnectionStatus('connected');
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    if (message.type === 'nsw_callback') {
                        const newCallback = {
                            ...message.payload,
                            actualStatus: message.payload.status,
                            statusCode: message.payload.data?.statusCode || 
                                       message.payload.data?.status || 
                                       message.payload.status || 
                                       'N/A',
                            originalData: message.payload
                        };
                        
                        setCallbacks(prev => [newCallback, ...prev].slice(0, 100));
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            wsRef.current.onclose = () => {
                console.log('WebSocket connection closed');
                setConnectionStatus('disconnected');
            };

            wsRef.current.onerror = (error) => {
                console.error('WebSocket error:', error);
                setConnectionStatus('error');
            };
        } catch (error) {
            console.error('Failed to connect WebSocket:', error);
            setConnectionStatus('error');
        }
    };

    // Disconnect WebSocket
    const disconnectWebSocket = () => {
        if (wsRef.current) {
            wsRef.current.close();
            setConnectionStatus('disconnected');
        }
    };

    useEffect(() => {
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    useEffect(() => {
        if (isAutoScroll && callbacksEndRef.current) {
            callbacksEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [callbacks, isAutoScroll]);

    // ฟังก์ชันสำหรับแสดง status badge
    const getStatusBadge = (callback) => {
        const status = (callback.actualStatus || callback.status || '').toString().toLowerCase();
        const statusCode = callback.statusCode || callback.data?.statusCode || 'N/A';
        
        let colorClass = '';
        let statusText = '';
        
        switch (status) {
            case 'success':
                colorClass = 'bg-green-100 text-green-800 border border-green-200';
                statusText = '✅ SUCCESS';
                break;
            case 'error':
            case 'fail':
            case 'failed':
                colorClass = 'bg-red-100 text-red-800 border border-red-200';
                statusText = '❌ ERROR';
                break;
            case 'pending':
            case 'processing':
                colorClass = 'bg-yellow-100 text-yellow-800 border border-yellow-200';
                statusText = '⏳ PENDING';
                break;
            default:
                colorClass = 'bg-gray-100 text-gray-800 border border-gray-200';
                statusText = '❓ UNKNOWN';
        }
        
        return (
            <div className="flex flex-col items-end space-y-1">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
                    {statusText}
                </span>
                <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs font-mono">
                    Code: {statusCode}
                </span>
            </div>
        );
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

    const getTransactionId = (callback) => {
        return callback.transactionId || callback.data?.transactionId || callback.document_id || 'Unknown';
    };

    const filteredCallbacks = callbacks.filter(callback => {
        if (filter === 'all') return true;
        const status = (callback.actualStatus || callback.status || '').toString().toLowerCase();
        return status === filter;
    });

    const exportCallbacks = () => {
        const dataStr = JSON.stringify(callbacks, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `nsw-callbacks-${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Webhook className="w-6 h-6 mr-2 text-indigo-600" />
                        NSW API Callback Monitor
                    </h1>
                    <p className="text-gray-600 text-sm mt-1">
                        Real-time monitoring และแสดง status code ของ NSW API responses
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                {/* Connection Controls */}
                <div className="bg-white rounded-lg shadow-sm border mb-6">
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                                <Server className="w-5 h-5 mr-2" />
                                Server Connection
                            </h2>
                            <div className={`flex items-center px-3 py-1 rounded-full border text-sm font-medium ${getConnectionColor()}`}>
                                {getConnectionIcon()}
                                <span className="ml-2 capitalize">{connectionStatus}</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <input
                                type="text"
                                value={serverUrl}
                                onChange={(e) => setServerUrl(e.target.value)}
                                placeholder="ws://localhost:3001"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <button
                                onClick={connectionStatus === 'connected' ? disconnectWebSocket : connectWebSocket}
                                className={`px-4 py-2 rounded-md font-medium flex items-center space-x-2 ${
                                    connectionStatus === 'connected' 
                                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                }`}
                            >
                                {connectionStatus === 'connected' ? (
                                    <>
                                        <Pause className="w-4 h-4" />
                                        <span>Disconnect</span>
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-4 h-4" />
                                        <span>Connect</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-white rounded-lg shadow-sm border mb-6">
                    <div className="p-4">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center space-x-4">
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="success">Success</option>
                                    <option value="error">Error</option>
                                    <option value="pending">Pending</option>
                                </select>
                                
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={isAutoScroll}
                                        onChange={(e) => setIsAutoScroll(e.target.checked)}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm text-gray-700">Auto Scroll</span>
                                </label>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={exportCallbacks}
                                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center space-x-2"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Export</span>
                                </button>
                                
                                <button
                                    onClick={() => setCallbacks([])}
                                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center space-x-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Clear All</span>
                                </button>
                            </div>
                        </div>
                        
                        <div className="mt-4 text-sm text-gray-600">
                            Total Callbacks: <span className="font-semibold">{callbacks.length}</span> | 
                            Filtered: <span className="font-semibold">{filteredCallbacks.length}</span>
                        </div>
                    </div>
                </div>

                {/* Callbacks List */}
                <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-4 border-b">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                            <Activity className="w-5 h-5 mr-2" />
                            Recent Callbacks
                        </h3>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                        {filteredCallbacks.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <Webhook className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <p>No callbacks received yet</p>
                                <p className="text-sm mt-1">Connect to server to start monitoring</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {filteredCallbacks.map((callback) => (
                                    <div key={callback.id} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-3">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        Transaction: {getTransactionId(callback)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(callback.timestamp).toLocaleString('th-TH')}
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-1 flex items-center space-x-4">
                                                    <span className="text-sm text-gray-600">
                                                        Source: {callback.source || 'Unknown'}
                                                    </span>
                                                    {callback.data?.messageTH && (
                                                        <span className="text-sm text-gray-600 truncate max-w-xs">
                                                            {callback.data.messageTH}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center space-x-3">
                                                {getStatusBadge(callback)}
                                                <button
                                                    onClick={() => {
                                                        setSelectedCallback(callback);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={callbacksEndRef} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {isModalOpen && selectedCallback && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Callback Details
                                </h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="font-medium text-gray-600">Transaction ID:</span>
                                        <p className="text-gray-900">{getTransactionId(selectedCallback)}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Timestamp:</span>
                                        <p className="text-gray-900">{new Date(selectedCallback.timestamp).toLocaleString('th-TH')}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Status:</span>
                                        <p className="text-gray-900">{selectedCallback.actualStatus || 'Unknown'}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Status Code:</span>
                                        <p className="text-gray-900 font-mono">{selectedCallback.statusCode || 'N/A'}</p>
                                    </div>
                                </div>

                                {(selectedCallback.data?.messageTH || selectedCallback.data?.messageEN) && (
                                    <div>
                                        <span className="font-medium text-gray-600 block mb-2">Messages:</span>
                                        <div className="bg-gray-50 p-3 rounded space-y-1">
                                            {selectedCallback.data.messageTH && (
                                                <p className="text-sm"><strong>TH:</strong> {selectedCallback.data.messageTH}</p>
                                            )}
                                            {selectedCallback.data.messageEN && (
                                                <p className="text-sm"><strong>EN:</strong> {selectedCallback.data.messageEN}</p>
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
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FrontendCallbackReceiver;