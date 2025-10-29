import React, { useState } from 'react';
import { Code, Send, Loader, CheckCircle, AlertCircle, Copy, CheckCheck, FileJson } from 'lucide-react';
import Navigation from './Navigation';

const ApiTesterDelete = () => {
    const [selectedEndpoint, setSelectedEndpoint] = useState('');
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [error, setError] = useState('');
    const [copiedJson, setCopiedJson] = useState(false);
    const [pathParams, setPathParams] = useState({});
    const [requestBody, setRequestBody] = useState('');
    const [jsonError, setJsonError] = useState('');

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

    // API Endpoints สำหรับ DELETE method
    const endpoints = [
        {
            id: 'dft002',
            name: '(DFT002) - cancelEformToDFT',
            baseUrl: `${apiBaseUrl}/dft/request/{document_id}`,
            description: 'ยกเลิกคำขอใบอนุญาต',
            pathParams: ['document_id'],
            requestBodyExample: {
                message_header: {
                    message_info: {
                        message_id: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
                        ref_to_message_id: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
                        timestamp: "2025-09-05T10:00:00Z"
                    },
                    party_info: {
                        from: {
                            party_id: "1234567890",
                            role: "BusinessOriginator"
                        },
                        to: {
                            party_id: "0987654321",
                            role: "Recipient"
                        }
                    },
                    collaboration_info: {
                        conversation_id: "e6f70b0e-5a86-4f7e-9238-2e2b6b5c0a11",
                        service: "DFT.R04",
                        action: "CancelRequest"
                    },
                    business_info: {
                        single_form_reference: "SINGLE-REF-001",
                        request_reference: "REQ-2025-000123",
                        document_type: "DFT-R04-CAN"
                    }
                },
                payload: {
                    content_type: "application/json",
                    data: {
                        document_id: "ABCD000000123",
                        company_tax_id: "12345678901234567",
                        broker_tax_id: "22222222222222222",
                        personal_id_card_number: "1234567890123",
                        cancel_reference_number: "COC-2025-000045",
                        cancel_document_type: "R04-CERT",
                        issue_date: "2025-08-25",
                        reason: {
                            code: "DUPLICATE",
                            text: "ยื่นรายการซ้ำ ขอให้ยกเลิกฉบับก่อนหน้า"
                        },
                        attachments: [
                            {
                                item_number: 1,
                                attachment_type: "REFERENCE",
                                document_number: "CERT-8899",
                                issue_authority_tax_id: "30303030303030303",
                                issue_date: "2025-08-26",
                                document_type_code: "COC",
                                document_type_name: "Certificate of Cancellation",
                                file_name: "cancel_cert.pdf",
                                reference_details: {
                                    file_type: "PDF",
                                    file_id: "FILE-REF-0001",
                                    file_uri: "https://files.example.com/FILE-REF-0001"
                                },
                                remark: "แนบสำเนาเอกสารอ้างอิง"
                            },
                            {
                                item_number: 2,
                                attachment_type: "EMBEDDED",
                                document_type_name: "Cancellation Letter",
                                file_name: "cancel_letter.pdf",
                                embedded_details: {
                                    content_type: "application/pdf",
                                    data: "JVBERi0xLjQKJcTl8uXrp..."
                                }
                            }
                        ]
                    }
                },
                payload_security_info: {
                    integrity: {
                        alg: "SHA256",
                        hash_value: "Wm9uZWhhc2hCYXNlNjQ="
                    },
                    signature: {
                        alg: "RS256",
                        signature_value: "S0ZlQmFzZTY0VVJMU2lnbg",
                        key_info: {
                            key_id: "SENDER-CERT-001"
                        }
                    },
                    encryption: {
                        alg: "RSA-OAEP",
                        enc: "A256GCM",
                        key_info: {
                            key_id: "RECEIVER-CERT-999"
                        },
                        original_content_type: "application/json"
                    }
                },
                callback_url: "https://webhook.site/efe10a8b-ec08-4cef-9cf2-3f9493601efb"
            }
        },
    ];

    const handleEndpointChange = (endpointId) => {
        setSelectedEndpoint(endpointId);
        setPathParams({});
        setError('');
        setResponse(null);
        setJsonError('');

        // Set example request body
        const endpoint = endpoints.find(e => e.id === endpointId);
        if (endpoint && endpoint.requestBodyExample) {
            setRequestBody(JSON.stringify(endpoint.requestBodyExample, null, 2));
        } else {
            setRequestBody('');
        }
    };

    const handlePathParamChange = (paramName, value) => {
        setPathParams(prev => ({
            ...prev,
            [paramName]: value
        }));
    };

    const handleRequestBodyChange = (value) => {
        setRequestBody(value);
        setJsonError('');

        // Validate JSON in real-time
        if (value.trim()) {
            try {
                JSON.parse(value);
            } catch (err) {
                setJsonError(`Invalid JSON: ${err.message}`);
            }
        }
    };

    const buildUrl = () => {
        if (!selectedEndpoint) return '';

        const endpoint = endpoints.find(e => e.id === selectedEndpoint);
        if (!endpoint) return '';

        let url = endpoint.baseUrl;

        // Replace path parameters
        endpoint.pathParams?.forEach(param => {
            const value = pathParams[param] || `{${param}}`;
            url = url.replace(`{${param}}`, value);
        });

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
            setError(`กรุณากรอก Path Parameters: ${missingParams.join(', ')}`);
            return;
        }

        // Validate request body
        if (!requestBody.trim()) {
            setError('กรุณากรอก Request Body');
            return;
        }

        let parsedBody;
        try {
            parsedBody = JSON.parse(requestBody);
        } catch (err) {
            setError(`Request Body ไม่ใช่ JSON ที่ถูกต้อง: ${err.message}`);
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
                method: 'DELETE',
                headers: headers,
                body: JSON.stringify(parsedBody)
            });

            const responseText = await res.text();
            let data;

            try {
                data = JSON.parse(responseText);
            } catch {
                data = { rawResponse: responseText };
            }

            if (!res.ok) {
                throw new Error(`HTTP Error: ${res.status} ${res.statusText} - ${JSON.stringify(data)}`);
            }

            setResponse({
                status: res.status,
                statusText: res.statusText,
                headers: Object.fromEntries(res.headers.entries()),
                data: data,
                timestamp: new Date().toISOString(),
                url: url,
                requestHeaders: headers,
                requestBody: parsedBody
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

    const loadExampleBody = () => {
        const endpoint = endpoints.find(e => e.id === selectedEndpoint);
        if (endpoint && endpoint.requestBodyExample) {
            setRequestBody(JSON.stringify(endpoint.requestBodyExample, null, 2));
            setJsonError('');
        }
    };

    const currentEndpoint = endpoints.find(e => e.id === selectedEndpoint);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
            <Navigation />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center">
                        <Code className="w-10 h-10 mr-3 text-green-600" />
                        API Tester (DELETE)
                    </h1>
                    <p className="text-gray-600 text-lg">
                        ทดสอบเรียก API Method DELETE พร้อม Request Body แบบ JSON
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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

                        {/* Request Body */}
                        {currentEndpoint && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs mr-2">
                                            REQUEST BODY
                                        </span>
                                        JSON Payload <span className="text-red-500 ml-1">*</span>
                                    </h3>
                                    <button
                                        onClick={loadExampleBody}
                                        className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors flex items-center space-x-1"
                                    >
                                        <FileJson className="w-4 h-4" />
                                        <span>Load Example</span>
                                    </button>
                                </div>

                                <textarea
                                    value={requestBody}
                                    onChange={(e) => handleRequestBodyChange(e.target.value)}
                                    placeholder="กรอก JSON request body..."
                                    rows={15}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent font-mono text-sm ${jsonError
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-green-500'
                                        }`}
                                />

                                {jsonError && (
                                    <div className="flex items-start space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <span>{jsonError}</span>
                                    </div>
                                )}

                                <p className="text-xs text-gray-500">
                                    💡 กรอก JSON ที่ถูกต้อง หรือคลิก "Load Example" เพื่อดูตัวอย่าง
                                </p>
                            </div>
                        )}

                        {/* URL Preview */}
                        {currentEndpoint && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200">
                                <label className="block text-sm font-semibold text-green-900 mb-2 flex items-center">
                                    <Code className="w-4 h-4 mr-2" />
                                    Final URL
                                </label>
                                <code className="text-sm text-green-800 break-all block bg-white p-3 rounded">
                                    DELETE {buildUrl()}
                                </code>
                            </div>
                        )}

                        {/* Call API Button */}
                        <button
                            onClick={handleCallApi}
                            disabled={!selectedEndpoint || loading || !!jsonError}
                            className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-all duration-200 flex items-center justify-center space-x-2 ${!selectedEndpoint || loading || jsonError
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl'
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
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg shadow-md">
                        <div className="flex items-start">
                            <AlertCircle className="w-6 h-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-red-800 font-semibold mb-1">เกิดข้อผิดพลาด</h3>
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Response Display */}
                {response && (
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        {/* Response Header */}
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <CheckCircle className="w-6 h-6" />
                                    <div>
                                        <h3 className="text-lg font-semibold">Response</h3>
                                        <p className="text-sm opacity-90">
                                            Status: {response.status} {response.statusText}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={copyJsonToClipboard}
                                    className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200 flex items-center space-x-2"
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
                        </div>

                        {/* Response Info */}
                        <div className="p-4 bg-gray-50 border-b border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-semibold text-gray-700">Request URL:</span>
                                    <p className="text-gray-600 mt-1 font-mono text-xs break-all">
                                        DELETE {response.url}
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

                        {/* Request Body Sent */}
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Request Body Sent</h3>
                            <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-64">
                                <pre className="text-yellow-400 text-sm font-mono">
                                    {formatJson(response.requestBody)}
                                </pre>
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
                            เลือก Endpoint และกรอก Request Body
                        </h3>
                        <p className="text-gray-500">
                            เลือก API Endpoint กรอก Request Body เป็น JSON แล้วกดปุ่ม "เรียก API"
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApiTesterDelete;