import React, { useState } from 'react';
import { Code, Send, Loader, CheckCircle, AlertCircle, Copy, CheckCheck } from 'lucide-react';
import Navigation from './Navigation';

const ApiTesterGet = () => {
    const [selectedEndpoint, setSelectedEndpoint] = useState('');
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [error, setError] = useState('');
    const [copiedJson, setCopiedJson] = useState(false);
    const [pathParams, setPathParams] = useState({}); // เก็บ path parameters
    const [queryParams, setQueryParams] = useState(''); // เก็บ query parameters

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

    // API Endpoints พร้อม path parameters
    const endpoints = [
        {
            id: 'cargo-movement',
            name: '(NSW-CAR002) - Cargo E-Lock Movement',
            baseUrl: `${apiBaseUrl}/nsw/cargo/elock/{nswRefId}/movement`,
            description: 'ตรวจสอบการเคลื่อนย้าย E-Lock',
            pathParams: ['nswRefId'],
            exampleParams: { nswRefId: 'NSW123456' }
        },
        {
            id: 'entity-by-tax',
            name: '(CUS001) - Get Entity by Tax ID',
            baseUrl: `${apiBaseUrl}/customs/entities/{taxId}`,
            description: 'ข้อมูลนิติบุคคลจากเลขประจำตัวผู้เสียภาษี',
            pathParams: ['taxId'],
            exampleParams: { taxId: '0123456789012' }
        },
        {
            id: 'containers',
            name: '(CUS002) - Get Containers',
            baseUrl: `${apiBaseUrl}/customs/containers`,
            description: 'ค้นหาตู้คอนเทนเนอร์',
            pathParams: [],
            queryParamFields: [
                { name: 'containerNo', label: 'Container Number', example: 'ABCU1234567' },
                { name: 'declarationNo', label: 'Declaration Number', example: 'DEC2024001' }
            ]
        },
        {
            id: 'declaration',
            name: '(CUS003) - Get Declaration',
            baseUrl: `${apiBaseUrl}/customs/declarations/{declarationNo}`,
            description: 'ข้อมูลใบขนสินค้า',
            pathParams: ['declarationNo'],
            exampleParams: { declarationNo: 'DEC2024001' }
        },
        {
            id: 'vehicle',
            name: '(DLT001) - Get Vehicle',
            baseUrl: `${apiBaseUrl}/dlt/vehicles/{licensePlate}`,
            description: 'ข้อมูลยานพาหนะ',
            pathParams: ['licensePlate'],
            exampleParams: { licensePlate: 'กก-1234' }
        },
        {
            id: 'driver-license',
            name: '(DLT002) - Driver License Status',
            baseUrl: `${apiBaseUrl}/dlt/drivers/licenses/{licenseNumber}/status`,
            description: 'สถานะใบขับขี่',
            pathParams: ['licenseNumber'],
            exampleParams: { licenseNumber: '12345678' }
        },
        // {
        //     id: 'entity-by-juristic',
        //     name: '(DBD001) - Get Entity by Juristic ID',
        //     baseUrl: `${apiBaseUrl}/dbd/entities/{organizationJuristicId}`,
        //     description: 'ข้อมูลนิติบุคคลจากเลขทะเบียนนิติบุคคล',
        //     pathParams: ['organizationJuristicId'],
        //     exampleParams: { organizationJuristicId: '0105123456789' }
        // }
    ];

    const handleEndpointChange = (endpointId) => {
        setSelectedEndpoint(endpointId);
        setError('');
        setResponse(null);
        setQueryParams('');

        // Set default example values for path params
        const endpoint = endpoints.find(e => e.id === endpointId);
        if (endpoint && endpoint.exampleParams) {
            setPathParams(endpoint.exampleParams);
        } else {
            setPathParams({});
        }
    };

    const handlePathParamChange = (paramName, value) => {
        setPathParams(prev => ({
            ...prev,
            [paramName]: value
        }));
    };

    const buildUrl = () => {
        const endpoint = endpoints.find(e => e.id === selectedEndpoint);
        if (!endpoint) return '';

        let url = endpoint.baseUrl;

        // Replace path parameters
        endpoint.pathParams?.forEach(param => {
            const value = pathParams[param] || `{${param}}`;
            url = url.replace(`{${param}}`, value);
        });

        // Add query parameters
        if (queryParams.trim()) {
            url += `?${queryParams.trim()}`;
        }

        return url;
    };

    const handleCallApi = async () => {
        if (!selectedEndpoint) {
            setError('กรุณาเลือก Endpoint ก่อนเรียก API');
            return;
        }

        const endpoint = endpoints.find(e => e.id === selectedEndpoint);

        // Validate path parameters
        const missingParams = endpoint.pathParams?.filter(param => !pathParams[param]?.trim());
        if (missingParams && missingParams.length > 0) {
            setError(`กรุณากรอก: ${missingParams.join(', ')}`);
            return;
        }

        setLoading(true);
        setError('');
        setResponse(null);

        try {
            const url = buildUrl();

            // Prepare headers with client credentials
            const headers = {
                'Content-Type': 'application/json'
            };

            // Add client credentials from environment variables
            const clientId = import.meta.env.VITE_CLIENT_ID;
            const clientSecret = import.meta.env.VITE_CLIENT_SECRET;

            if (clientId) {
                headers['client_id'] = clientId;
            }
            if (clientSecret) {
                headers['client_secret'] = clientSecret;
            }

            const res = await fetch(url, {
                method: 'GET',
                headers: headers
            });

            if (!res.ok) {
                throw new Error(`HTTP Error: ${res.status} ${res.statusText}`);
            }

            const data = await res.json();

            setResponse({
                status: res.status,
                statusText: res.statusText,
                headers: Object.fromEntries(res.headers.entries()),
                data: data,
                timestamp: new Date().toISOString(),
                url: url,
                requestHeaders: headers
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

    const currentEndpoint = endpoints.find(e => e.id === selectedEndpoint);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Navigation />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center">
                        <Code className="w-10 h-10 mr-3 text-orange-600" />
                        API Tester (GET)
                    </h1>
                    <p className="text-gray-600 text-lg">
                        ทดสอบเรียก API Method GET พร้อม Path และ Query Parameters
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
                                onChange={(e) => handleEndpointChange(e.target.value)}
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

                        {/* Path Parameters */}
                        {currentEndpoint && currentEndpoint.pathParams && currentEndpoint.pathParams.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs mr-2">
                                        PATH PARAMS
                                    </span>
                                    Required Parameters
                                </h3>
                                {currentEndpoint.pathParams.map((param) => (
                                    <div key={param}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {param} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={pathParams[param] || ''}
                                            onChange={(e) => handlePathParamChange(param, e.target.value)}
                                            placeholder={`กรอก ${param}`}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Query Parameters Fields */}
                        {currentEndpoint && currentEndpoint.queryParamFields && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mr-2">
                                        QUERY PARAMS
                                    </span>
                                    Query Parameters
                                </h3>
                                {currentEndpoint.queryParamFields.map((field) => (
                                    <div key={field.name}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {field.label}
                                        </label>
                                        <input
                                            type="text"
                                            placeholder={field.example}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                            onChange={(e) => {
                                                const params = new URLSearchParams(queryParams);
                                                if (e.target.value) {
                                                    params.set(field.name, e.target.value);
                                                } else {
                                                    params.delete(field.name);
                                                }
                                                setQueryParams(params.toString());
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Additional Query Parameters */}
                        {currentEndpoint && !currentEndpoint.queryParamFields && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mr-2">
                                        QUERY PARAMS
                                    </span>
                                    Additional Query Parameters (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={queryParams}
                                    onChange={(e) => setQueryParams(e.target.value)}
                                    placeholder="เช่น: page=1&limit=10"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    💡 ใส่ query parameters เช่น: page=1&limit=10
                                </p>
                            </div>
                        )}

                        {/* URL Preview */}
                        {currentEndpoint && (
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border-2 border-blue-200">
                                <label className="block text-sm font-semibold text-blue-900 mb-2 flex items-center">
                                    <Code className="w-4 h-4 mr-2" />
                                    Final URL
                                </label>
                                <code className="text-sm text-blue-800 break-all block bg-white p-3 rounded">
                                    {buildUrl()}
                                </code>
                            </div>
                        )}

                        {/* Call API Button */}
                        <button
                            onClick={handleCallApi}
                            disabled={!selectedEndpoint || loading}
                            className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-all duration-200 flex items-center justify-center space-x-2 ${!selectedEndpoint || loading
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-semibold text-gray-700">Request URL:</span>
                                    <p className="text-gray-600 mt-1 font-mono text-xs break-all">
                                        {response.url}
                                    </p>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">Timestamp:</span>
                                    <p className="text-gray-600 mt-1">
                                        {new Date(response.timestamp).toLocaleString('th-TH')}
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
                            เลือก Endpoint และกรอกข้อมูล
                        </h3>
                        <p className="text-gray-500">
                            เลือก API Endpoint และกรอก Parameters ที่ต้องการ แล้วกดปุ่ม "เรียก API"
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApiTesterGet;