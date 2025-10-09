import React, { useState } from 'react';
import { Menu, X, Search, Webhook, Building, Code, Send, Loader, CheckCircle, AlertCircle, Copy, CheckCheck } from 'lucide-react';
import Navigation from './Navigation';


// API Tester Component
const ApiTesterGet = () => {
    const [selectedEndpoint, setSelectedEndpoint] = useState('');
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [error, setError] = useState('');
    const [copiedJson, setCopiedJson] = useState(false);

    // 7 API Endpoints
    const endpoints = [
        {
            id: 'users',
            name: 'Get Users',
            url: 'https://jsonplaceholder.typicode.com/users',
            description: 'รายการผู้ใช้ทั้งหมด'
        },
        {
            id: 'posts',
            name: 'Get Posts',
            url: 'https://jsonplaceholder.typicode.com/posts',
            description: 'รายการโพสต์ทั้งหมด'
        },
        {
            id: 'comments',
            name: 'Get Comments',
            url: 'https://jsonplaceholder.typicode.com/comments',
            description: 'รายการคอมเมนต์ทั้งหมด'
        },
        {
            id: 'albums',
            name: 'Get Albums',
            url: 'https://jsonplaceholder.typicode.com/albums',
            description: 'รายการอัลบั้มทั้งหมด'
        },
        {
            id: 'photos',
            name: 'Get Photos',
            url: 'https://jsonplaceholder.typicode.com/photos',
            description: 'รายการรูปภาพทั้งหมด (จำกัด 10 รายการ)'
        },
        {
            id: 'todos',
            name: 'Get Todos',
            url: 'https://jsonplaceholder.typicode.com/todos',
            description: 'รายการสิ่งที่ต้องทำทั้งหมด'
        },
        {
            id: 'user-detail',
            name: 'Get User Detail',
            url: 'https://jsonplaceholder.typicode.com/users/1',
            description: 'ข้อมูลผู้ใช้ ID 1'
        }
    ];

    const handleCallApi = async () => {
        if (!selectedEndpoint) {
            setError('กรุณาเลือก Endpoint ก่อนเรียก API');
            return;
        }

        const endpoint = endpoints.find(e => e.id === selectedEndpoint);
        setLoading(true);
        setError('');
        setResponse(null);

        try {
            let url = endpoint.url;
            
            // จำกัดจำนวนรูปภาพเพื่อไม่ให้ response ใหญ่เกินไป
            if (endpoint.id === 'photos') {
                url = 'https://jsonplaceholder.typicode.com/photos?_limit=10';
            }

            const res = await fetch(url);
            
            if (!res.ok) {
                throw new Error(`HTTP Error: ${res.status} ${res.statusText}`);
            }

            const data = await res.json();
            
            setResponse({
                status: res.status,
                statusText: res.statusText,
                headers: Object.fromEntries(res.headers.entries()),
                data: data,
                timestamp: new Date().toISOString()
            });
        } catch (err) {
            setError(err.message || 'เกิดข้อผิดพลาดในการเรียก API');
        } finally {
            setLoading(false);
        }
    };

    const copyJsonToClipboard = () => {
        if (response) {
            navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
            setCopiedJson(true);
            setTimeout(() => setCopiedJson(false), 2000);
        }
    };

    const formatJson = (data) => {
        return JSON.stringify(data, null, 2);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Navigation />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center">
                        <Code className="w-10 h-10 mr-3 text-orange-600" />
                        API Tester
                    </h1>
                    <p className="text-gray-600 text-lg">
                        ทดสอบเรียก API ทั้ง 7 Endpoints และแสดงผล Response
                    </p>
                </div>

                {/* API Selection Card */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">เลือก API Endpoint</h2>
                    
                    <div className="space-y-4">
                        {/* Endpoint Selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Endpoint
                            </label>
                            <select
                                value={selectedEndpoint}
                                onChange={(e) => {
                                    setSelectedEndpoint(e.target.value);
                                    setError('');
                                    setResponse(null);
                                }}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="">-- เลือก Endpoint --</option>
                                {endpoints.map((endpoint) => (
                                    <option key={endpoint.id} value={endpoint.id}>
                                        {endpoint.name} - {endpoint.description}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Selected Endpoint URL */}
                        {selectedEndpoint && (
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    URL
                                </label>
                                <code className="text-sm text-gray-800 break-all">
                                    {endpoints.find(e => e.id === selectedEndpoint)?.url}
                                </code>
                            </div>
                        )}

                        {/* Call API Button */}
                        <button
                            onClick={handleCallApi}
                            disabled={!selectedEndpoint || loading}
                            className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-all duration-200 flex items-center justify-center space-x-2 ${
                                !selectedEndpoint || loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-orange-500 to-yellow-600 hover:from-orange-600 hover:to-yellow-700 shadow-lg hover:shadow-xl'
                            }`}
                        >
                            {loading ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin" />
                                    <span>กำลังเรียก API...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    <span>เรียก API</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
                        <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-red-800 font-semibold">เกิดข้อผิดพลาด</h3>
                            <p className="text-red-600 text-sm mt-1">{error}</p>
                        </div>
                    </div>
                )}

                {/* Response Display */}
                {response && (
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        {/* Response Header */}
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <CheckCircle className="w-6 h-6 text-white" />
                                <div className="text-white">
                                    <h3 className="font-semibold text-lg">Response Success</h3>
                                    <p className="text-sm opacity-90">
                                        Status: {response.status} {response.statusText}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={copyJsonToClipboard}
                                className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-white font-medium transition-all duration-200 flex items-center space-x-2"
                            >
                                {copiedJson ? (
                                    <>
                                        <CheckCheck className="w-4 h-4" />
                                        <span>Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4" />
                                        <span>Copy JSON</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Response Info */}
                        <div className="p-4 bg-gray-50 border-b border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span className="font-semibold text-gray-700">Timestamp:</span>
                                    <p className="text-gray-600 mt-1">
                                        {new Date(response.timestamp).toLocaleString('th-TH')}
                                    </p>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">Content-Type:</span>
                                    <p className="text-gray-600 mt-1 font-mono text-xs">
                                        {response.headers['content-type'] || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">Data Size:</span>
                                    <p className="text-gray-600 mt-1">
                                        {Array.isArray(response.data) 
                                            ? `${response.data.length} items`
                                            : 'Single object'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* JSON Response */}
                        <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Response Data</h3>
                            <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-96">
                                <pre className="text-green-400 text-sm font-mono">
                                    {formatJson(response.data)}
                                </pre>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!response && !error && !loading && (
                    <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                        <Code className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                            เลือก Endpoint และเรียก API
                        </h3>
                        <p className="text-gray-500">
                            เลือก API Endpoint ที่ต้องการทดสอบและกดปุ่ม "เรียก API"
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApiTesterGet;