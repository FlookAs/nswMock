
import React, { useState, useEffect } from 'react';
import {
    Search,
    Building,
    AlertCircle,
    CheckCircle,
    Loader,
    Settings,
    Phone,
    Globe,
    MapPin,
    Calendar,
    DollarSign,
    User,
    Copy,
    CheckCheck
} from 'lucide-react';
import { apiService } from '../services/apiService';

const TaxIdLookup = () => {
    const [taxId, setTaxId] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [validationError, setValidationError] = useState('');
    const [copiedField, setCopiedField] = useState('');

    // Environment configuration from .env (Vite style)
    const currentEnv = {
        name: import.meta.env.VITE_APP_ENV === 'production' ? 'Production' : 'Development',
        apiUrl: import.meta.env.VITE_API_BASE_URL,
        color: import.meta.env.VITE_APP_ENV === 'production'
            ? 'bg-green-100 text-green-800 border-green-300'
            : 'bg-yellow-100 text-yellow-800 border-yellow-300',
        debug: import.meta.env.VITE_DEBUG === 'true'
    };

    // แสดงข้อมูล environment เมื่อเริ่มต้น
    useEffect(() => {
        if (currentEnv.debug) {
            console.log('Vite Environment Config:', {
                MODE: import.meta.env.MODE,
                VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
                VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
                VITE_DEBUG: import.meta.env.VITE_DEBUG,
                DEV: import.meta.env.DEV,
                PROD: import.meta.env.PROD
            });
        }
    }, [currentEnv.debug]);

    const handleSubmit = async () => {
        if (!taxId) return;

        const rawTaxId = getRawTaxId();

        setLoading(true);
        setError('');
        setResult(null);
        setValidationError('');

        try {
            const response = await apiService.getCompanyByTaxId(rawTaxId);
            setResult(response);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setTaxId('');
        setResult(null);
        setError('');
        setValidationError('');
        setCopiedField('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    const formatTaxId = (value) => {
        const numbers = value.replace(/\D/g, '');

        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 5) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        if (numbers.length <= 10) return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5)}`;
        if (numbers.length <= 12) return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 10)}-${numbers.slice(10)}`;
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 10)}-${numbers.slice(10, 12)}-${numbers.slice(12, 13)}`;
    };

    const handleTaxIdChange = (e) => {
        const formatted = formatTaxId(e.target.value);
        setTaxId(formatted);
        setValidationError('');
    };

    const getRawTaxId = () => {
        return taxId.replace(/\D/g, '');
    };

    const copyToClipboard = async (text, fieldName) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(fieldName);
            setTimeout(() => setCopiedField(''), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const CopyButton = ({ text, fieldName }) => (
        <button
            onClick={() => copyToClipboard(text, fieldName)}
            className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="คัดลอก"
        >
            {copiedField === fieldName ? (
                <CheckCheck className="w-4 h-4 text-green-500" />
            ) : (
                <Copy className="w-4 h-4" />
            )}
        </button>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <Building className="w-20 h-20 mx-auto text-indigo-600 mb-4" />
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        ระบบค้นหาข้อมูลนิติบุคคลที่ลงทะเบียนบนระบบกรมศุลกากร
                    </h1>
                    <p className="text-gray-600 text-lg">
                        กรอกรหัสนิติบุคคลเพื่อค้นหาข้อมูลบริษัท
                    </p>
                </div>

                {/* Environment Info */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                        <Settings className="w-5 h-5 mr-2" />
                        Environment Configuration
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ml-auto ${currentEnv.color}`}>
                            {currentEnv.name}
                        </span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="font-medium text-gray-700">API Endpoint:</span>
                            <p className="text-gray-600 font-mono text-xs mt-1 break-all">{currentEnv.apiUrl}</p>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">Build Tool:</span>
                            <p className="text-gray-600 mt-1">Vite ({import.meta.env.MODE})</p>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">Environment:</span>
                            <p className="text-gray-600 mt-1">{import.meta.env.VITE_APP_ENV}</p>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">Debug Mode:</span>
                            <p className="text-gray-600 mt-1">{currentEnv.debug ? 'Enabled' : 'Disabled'}</p>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">Timeout:</span>
                            <p className="text-gray-600 mt-1">{import.meta.env.VITE_API_TIMEOUT}ms</p>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">Version:</span>
                            <p className="text-gray-600 mt-1">{import.meta.env.VITE_APP_VERSION}</p>
                        </div>
                    </div>
                </div>

                {/* Search Form */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-2">
                                รหัสนิติบุคคล (Tax ID) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="taxId"
                                    value={taxId}
                                    onChange={handleTaxIdChange}
                                    onKeyPress={handleKeyPress}
                                    placeholder="กรุณากรอกรหัสนิติบุคคล 13 หลัก เช่น 012-34-56789-12-3"
                                    maxLength="17"
                                    className={`w-full px-4 py-3 pl-12 border rounded-lg text-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${validationError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                    required
                                />
                                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
                            </div>

                            {validationError && (
                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-1" />
                                    {validationError}
                                </p>
                            )}

                            <div className="mt-3 text-xs text-gray-500">
                                <p className="mb-2 font-medium">ตัวอย่างข้อมูลทดสอบ:</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                                    {[
                                        { id: '012-34-56789-12-3', desc: '200 OK' },
                                        { id: '999-99-99999-99-9', desc: '400 Error' },
                                        { id: '888-88-88888-88-8', desc: '401 Error' },
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setTaxId(item.id)}
                                            className="text-left p-2 hover:bg-indigo-50 hover:text-indigo-600 transition-colors rounded border border-gray-200"
                                        >
                                            <div className="font-mono text-xs">{item.id}</div>
                                            <div className="text-xs text-gray-500">{item.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleSubmit}
                                disabled={loading || getRawTaxId().length < 13}
                                className="flex-1 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-medium"
                                style={{ backgroundColor: '#FFB600' }}
                            >
                                {loading ? (
                                    <>
                                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                                        กำลังค้นหา...
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-5 h-5 mr-2" />
                                        ค้นหาข้อมูล
                                    </>
                                )}
                            </button>

                            <button
                                onClick={handleReset}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                รีเซ็ต
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                            <span className="text-red-700">{error}</span>
                        </div>
                    </div>
                )}

                {/* API Response Result (Success or Fail) */}
                {result && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        {/* Header สำหรับทั้ง Success และ Fail */}
                        <div className="flex items-center mb-6">
                            {result.status === 'SUCCESS' ? (
                                <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
                            ) : (
                                <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
                            )}
                            <h3 className="text-2xl font-semibold text-gray-900">
                                {result.status === 'SUCCESS' ? 'ข้อมูลบริษัท' : 'ผลการค้นหา'}
                            </h3>
                            {result.isMockData && (
                                <span className="ml-auto px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                                    🧪 Mock Data
                                </span>
                            )}
                            <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${result.status === 'SUCCESS'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                {result.status === 'SUCCESS' ? '✅ สำเร็จ' : '❌ ไม่สำเร็จ'}
                            </span>
                        </div>

                        {/* แสดง Error Details สำหรับ status FAIL */}
                        {result.status === 'FAIL' && result.error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                                <div className="flex items-start">
                                    <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="text-lg font-semibold text-red-800 mb-2">
                                            {result.error.title || 'เกิดข้อผิดพลาด'}
                                        </h4>
                                        
                                        <div className="space-y-3 text-sm">
                                            <div>
                                                <span className="font-medium text-red-700">ข้อความ (ไทย):</span>
                                                <p className="text-red-600 mt-1">{result.messageTH || 'ทำรายการไม่สำเร็จ'}</p>
                                            </div>
                                            
                                            <div>
                                                <span className="font-medium text-red-700">ข้อความ (English):</span>
                                                <p className="text-red-600 mt-1">{result.messageEN || 'Transaction Failed'}</p>
                                            </div>

                                            {result.error.detail && (
                                                <div>
                                                    <span className="font-medium text-red-700">รายละเอียด:</span>
                                                    <p className="text-red-600 mt-1">{result.error.detail}</p>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-red-200">
                                                <div>
                                                    <span className="font-medium text-red-700">HTTP Status:</span>
                                                    <p className="text-red-600">{result.error.status}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-red-700">Error Type:</span>
                                                    <p className="text-red-600 font-mono text-xs">{result.error.type}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-red-700">Service:</span>
                                                    <p className="text-red-600 font-mono text-xs">{result.error.service}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-red-700">Provider:</span>
                                                    <p className="text-red-600">{result.error.providers}</p>
                                                </div>
                                            </div>

                                            {/* Raw Response Details */}
                                            {result.error.rawResponse && (
                                                <details className="mt-4">
                                                    <summary className="cursor-pointer font-medium text-red-700 hover:text-red-800">
                                                        รายละเอียดเทคนิค (คลิกเพื่อดู)
                                                    </summary>
                                                    <div className="mt-2 p-3 bg-red-100 rounded border border-red-200">
                                                        <pre className="text-xs text-red-700 whitespace-pre-wrap overflow-x-auto">
                                                            {JSON.stringify(result.error.rawResponse, null, 2)}
                                                        </pre>
                                                    </div>
                                                </details>
                                            )}
                                        </div>

                                        {/* Suggested Actions */}
                                        <div className="mt-4 p-4 bg-red-100 rounded-lg border border-red-200">
                                            <h5 className="font-medium text-red-800 mb-2">💡 คำแนะนำในการแก้ไข:</h5>
                                            <ul className="text-sm text-red-700 space-y-1">
                                                {result.error.status === 400 && (
                                                    <>
                                                        <li>• ตรวจสอบว่ารหัสนิติบุคคลถูกต้องและมีอยู่จริงในระบบ</li>
                                                        <li>• ลองใช้รหัสนิติบุคคลตัวอย่างที่ให้ไว้</li>
                                                        <li>• ตรวจสอบรูปแบบรหัสนิติบุคคล (ต้องเป็น 13 หลัก)</li>
                                                    </>
                                                )}
                                                {result.error.status === 401 && (
                                                    <>
                                                        <li>• ตรวจสอบ API Key ในไฟล์ .env</li>
                                                        <li>• ติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์การเข้าใช้งาน</li>
                                                        <li>• ตรวจสอบว่า Token ยังไม่หมดอายุ</li>
                                                    </>
                                                )}
                                                <li>• หากปัญหายังคงอยู่ กรุณาติดต่อทีมสนับสนุน</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Transaction Info Footer สำหรับทั้ง Success และ Fail */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-3">ข้อมูลการทำรายการ</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span className="font-medium text-gray-700">Transaction ID:</span>
                                    <div className="flex items-center mt-1">
                                        <code className="text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs">
                                            {result.transactionId || 'N/A'}
                                        </code>
                                        {result.transactionId && <CopyButton text={result.transactionId} fieldName="transactionId" />}
                                    </div>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">เวลาที่ทำรายการ:</span>
                                    <p className="text-gray-600 mt-1">
                                        {new Date(result.timestamp || new Date()).toLocaleString('th-TH', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Environment:</span>
                                    <p className="text-gray-600 mt-1">
                                        {result.environment || import.meta.env.VITE_APP_ENV}
                                        {result.isMockData && <span className="text-orange-600 ml-2">🧪</span>}
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* แสดงข้อมูลบริษัทเฉพาะกรณี SUCCESS */}
                        {result.status === 'SUCCESS' && result.data && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* ข้อมูลหลัก */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 flex items-center">
                                            <Building className="w-4 h-4 mr-1" />
                                            รหัสนิติบุคคล
                                        </label>
                                        <div className="flex items-center mt-1">
                                            <p className="text-lg font-mono text-gray-900">{result.data.taxNumber}</p>
                                            <CopyButton text={result.data.taxNumber} fieldName="taxNumber" />
                                        </div>
                                        {result.data.branch && result.data.branch > 0 && (
                                            <p className="text-sm text-gray-500">สาขาที่ {result.data.branch}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-500">ชื่อบริษัท (ไทย)</label>
                                        <div className="flex items-center mt-1">
                                            <p className="text-lg text-gray-900">
                                                {result.data.title && `${result.data.title} `}{result.data.name}
                                            </p>
                                            <CopyButton text={`${result.data.title || ''} ${result.data.name}`} fieldName="companyName" />
                                        </div>
                                    </div>

                                    {result.data.nameEnglish && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">ชื่อบริษัท (อังกฤษ)</label>
                                            <div className="flex items-center mt-1">
                                                <p className="text-gray-900">{result.data.nameEnglish}</p>
                                                <CopyButton text={result.data.nameEnglish} fieldName="companyNameEn" />
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-sm font-medium text-gray-500 flex items-center">
                                            <Calendar className="w-4 h-4 mr-1" />
                                            วันที่จดทะเบียน
                                        </label>
                                        <p className="text-gray-900 mt-1">
                                            {result.data.incorporationDate
                                                ? new Date(result.data.incorporationDate.toString().replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')).toLocaleDateString('th-TH', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })
                                                : 'ไม่ระบุ'}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-500 flex items-center">
                                            <DollarSign className="w-4 h-4 mr-1" />
                                            ทุนจดทะเบียน
                                        </label>
                                        <p className="text-gray-900 mt-1 text-lg font-semibold">
                                            {result.data.capitalAmount
                                                ? `${parseInt(result.data.capitalAmount).toLocaleString()} บาท`
                                                : 'ไม่ระบุ'}
                                        </p>
                                    </div>

                                    {/* ข้อมูลการติดต่อ */}
                                    <div className="border-t pt-4">
                                        <h4 className="font-medium text-gray-900 mb-3">ข้อมูลการติดต่อ</h4>

                                        {result.data.phone && (
                                            <div className="mb-3">
                                                <label className="text-sm font-medium text-gray-500 flex items-center">
                                                    <Phone className="w-4 h-4 mr-1" />
                                                    หมายเลขโทรศัพท์
                                                </label>
                                                <div className="flex items-center mt-1">
                                                    <a
                                                        href={`tel:${result.data.phone}`}
                                                        className="text-indigo-600 hover:text-indigo-800 transition-colors"
                                                    >
                                                        {result.data.phone}
                                                    </a>
                                                    <CopyButton text={result.data.phone} fieldName="phone" />
                                                </div>
                                            </div>
                                        )}

                                        {result.data.fax && (
                                            <div className="mb-3">
                                                <label className="text-sm font-medium text-gray-500">หมายเลขโทรสาร</label>
                                                <div className="flex items-center mt-1">
                                                    <p className="text-gray-900">{result.data.fax}</p>
                                                    <CopyButton text={result.data.fax} fieldName="fax" />
                                                </div>
                                            </div>
                                        )}

                                        {result.data.email && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-500 flex items-center">
                                                    <Globe className="w-4 h-4 mr-1" />
                                                    อีเมล
                                                </label>
                                                <div className="flex items-center mt-1">
                                                    <a
                                                        href={`mailto:${result.data.email}`}
                                                        className="text-indigo-600 hover:text-indigo-800 transition-colors"
                                                    >
                                                        {result.data.email}
                                                    </a>
                                                    <CopyButton text={result.data.email} fieldName="email" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* ข้อมูลเพิ่มเติม */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">สถานะ</label>
                                        <div className="mt-1">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${result.data.penalty === 'N'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                <div className={`w-2 h-2 rounded-full mr-2 ${result.data.penalty === 'N' ? 'bg-green-500' : 'bg-red-500'
                                                    }`}></div>
                                                {result.data.penalty === 'N' ? 'ปกติ' : 'มีโทษ'}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-500">ประเภทธุรกิจ</label>
                                        <p className="text-gray-900 mt-1">
                                            {result.data.personalType === '1' ? 'นิติบุคคล' : 'บุคคลธรรมดา'}
                                        </p>
                                    </div>

                                    {result.data.countryBase && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">ประเทศที่จดทะเบียน</label>
                                            <p className="text-gray-900 mt-1">
                                                {result.data.countryBase === 'TH' ? 'ประเทศไทย' : result.data.countryBase}
                                            </p>
                                        </div>
                                    )}

                                    {/* ข้อมูลกรรมการ */}
                                    {result.data.customsRegisterDirectorInfo && (
                                        <div className="border-t pt-4">
                                            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                                <User className="w-4 h-4 mr-1" />
                                                ข้อมูลกรรมการ
                                            </h4>
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <div className="flex items-center">
                                                    <p className="text-gray-900 font-medium">
                                                        {result.data.customsRegisterDirectorInfo.preNameDesc} {result.data.customsRegisterDirectorInfo.firstName} {result.data.customsRegisterDirectorInfo.lastName}
                                                    </p>
                                                    <CopyButton
                                                        text={`${result.data.customsRegisterDirectorInfo.preNameDesc} ${result.data.customsRegisterDirectorInfo.firstName} ${result.data.customsRegisterDirectorInfo.lastName}`}
                                                        fieldName="director"
                                                    />
                                                </div>
                                                {result.data.customsRegisterDirectorInfo.firstNameEnglish && (
                                                    <p className="text-gray-600 text-sm mt-1">
                                                        {result.data.customsRegisterDirectorInfo.firstNameEnglish} {result.data.customsRegisterDirectorInfo.lastNameEnglish}
                                                    </p>
                                                )}
                                                {result.data.customsRegisterDirectorInfo.email && (
                                                    <p className="text-gray-600 text-sm">
                                                        📧 {result.data.customsRegisterDirectorInfo.email}
                                                    </p>
                                                )}
                                                {result.data.customsRegisterDirectorInfo.phone && (
                                                    <p className="text-gray-600 text-sm">
                                                        📞 {result.data.customsRegisterDirectorInfo.phone}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* ข้อมูลสถานะการลงทะเบียน */}
                                    <div className="border-t pt-4">
                                        <h4 className="font-medium text-gray-900 mb-3">สถานะการลงทะเบียน</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">วันที่ลงทะเบียน:</span>
                                                <span className="text-gray-900">
                                                    {result.data.registerDate
                                                        ? new Date(result.data.registerDate.toString().replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')).toLocaleDateString('th-TH')
                                                        : 'ไม่ระบุ'}
                                                </span>
                                            </div>
                                            {result.data.dateAmend && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">วันที่แก้ไขล่าสุด:</span>
                                                    <span className="text-gray-900">
                                                        {new Date(result.data.dateAmend.toString().replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')).toLocaleDateString('th-TH')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ที่อยู่ - แสดงเฉพาะกรณี SUCCESS */}
                        {result.status === 'SUCCESS' && result.data && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <label className="text-sm font-medium text-gray-500 flex items-center mb-2">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    ที่อยู่
                                </label>
                                <div className="flex items-start">
                                    <p className="text-gray-900 text-sm leading-relaxed flex-1">
                                        {[
                                            result.data.houseNumber,
                                            result.data.buildingName && `อาคาร${result.data.buildingName}`,
                                            result.data.mooNumber && `หมู่ ${result.data.mooNumber}`,
                                            result.data.soiNumber && `ซอย ${result.data.soiNumber}`,
                                            result.data.streetName && `ถนน ${result.data.streetName}`,
                                            result.data.tumbolName && `ตำบล ${result.data.tumbolName}`,
                                            result.data.amphurName && `อำเภอ ${result.data.amphurName}`,
                                            result.data.provinceName,
                                            result.data.postCode
                                        ].filter(Boolean).join(' ')}
                                    </p>
                                    <CopyButton
                                        text={[
                                            result.data.houseNumber,
                                            result.data.buildingName && `อาคาร${result.data.buildingName}`,
                                            result.data.mooNumber && `หมู่ ${result.data.mooNumber}`,
                                            result.data.soiNumber && `ซอย ${result.data.soiNumber}`,
                                            result.data.streetName && `ถนน ${result.data.streetName}`,
                                            result.data.tumbolName && `ตำบล ${result.data.tumbolName}`,
                                            result.data.amphurName && `อำเภอ ${result.data.amphurName}`,
                                            result.data.provinceName,
                                            result.data.postCode
                                        ].filter(Boolean).join(' ')}
                                        fieldName="address"
                                    />
                                </div>
                            </div>
                        )}

                        {/* ข้อมูลเพิ่มเติม - Tabs - แสดงเฉพาะกรณี SUCCESS */}
                        {result.status === 'SUCCESS' && result.data && (result.data.customsRegisterBrokerInfo || result.data.customsRegisterEmployeeInfo || result.data.customsRegisterBankAccountInfo) && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h4 className="font-medium text-gray-900 mb-4">ข้อมูลเพิ่มเติม</h4>

                                {/* Broker Info */}
                                {result.data.customsRegisterBrokerInfo && (
                                    <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                                        <h5 className="font-medium text-blue-900 mb-2">ข้อมูลนายหน้า</h5>
                                        <div className="text-sm space-y-1">
                                            <p><span className="font-medium">ชื่อ:</span> {result.data.customsRegisterBrokerInfo.title} {result.data.customsRegisterBrokerInfo.brokerName}</p>
                                            <p><span className="font-medium">เลขประจำตัว:</span> {result.data.customsRegisterBrokerInfo.brokerTaxNumber}</p>
                                            {result.data.customsRegisterBrokerInfo.phone && (
                                                <p><span className="font-medium">โทรศัพท์:</span> {result.data.customsRegisterBrokerInfo.phone}</p>
                                            )}
                                            {result.data.customsRegisterBrokerInfo.email && (
                                                <p><span className="font-medium">อีเมล:</span> {result.data.customsRegisterBrokerInfo.email}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Employee Info */}
                                {result.data.customsRegisterEmployeeInfo && (
                                    <div className="mb-4 p-4 bg-green-50 rounded-lg">
                                        <h5 className="font-medium text-green-900 mb-2">ข้อมูลพนักงาน</h5>
                                        <div className="text-sm space-y-1">
                                            <p><span className="font-medium">ชื่อ:</span> {result.data.customsRegisterEmployeeInfo.preNameDesc} {result.data.customsRegisterEmployeeInfo.firstName} {result.data.customsRegisterEmployeeInfo.lastName}</p>
                                            <p><span className="font-medium">ตำแหน่ง:</span> {result.data.customsRegisterEmployeeInfo.employeeType === 'S' ? 'พนักงาน' : 'อื่นๆ'}</p>
                                            {result.data.customsRegisterEmployeeInfo.phone && (
                                                <p><span className="font-medium">โทรศัพท์:</span> {result.data.customsRegisterEmployeeInfo.phone}</p>
                                            )}
                                            {result.data.customsRegisterEmployeeInfo.email && (
                                                <p><span className="font-medium">อีเมล:</span> {result.data.customsRegisterEmployeeInfo.email}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Bank Account Info */}
                                {result.data.customsRegisterBankAccountInfo && (
                                    <div className="p-4 bg-purple-50 rounded-lg">
                                        <h5 className="font-medium text-purple-900 mb-2">ข้อมูลบัญชีธนาคาร</h5>
                                        <div className="text-sm space-y-1">
                                            <p><span className="font-medium">เลขที่บัญชี:</span> {result.data.customsRegisterBankAccountInfo.accountNumber}</p>
                                            <p><span className="font-medium">ชื่อบัญชี:</span> {result.data.customsRegisterBankAccountInfo.accountName}</p>
                                            <p><span className="font-medium">รหัสธนาคาร:</span> {result.data.customsRegisterBankAccountInfo.bankCode}</p>
                                            <p><span className="font-medium">ประเภท:</span> {result.data.customsRegisterBankAccountInfo.creditDebit === 'CR' ? 'เครดิต' : 'เดบิต'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Alternative Actions สำหรับกรณี FAIL */}
                        {result.status === 'FAIL' && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                <h4 className="font-medium text-blue-900 mb-3">💼 ลองใช้ข้อมูลตัวอย่างเหล่านี้:</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {[
                                        { id: '0105551234567', desc: 'บริษัท ตัวอย่าง จำกัด', status: '✅ ปกติ' },
                                        { id: '0105559876543', desc: 'บริษัท ทดสอบ จำกัด (มหาชน)', status: '✅ ปกติ' },
                                        { id: '1111111111111', desc: 'บริษัท ปิดกิจการแล้ว จำกัด', status: '❌ ปิดกิจการ' },
                                        { id: '0105555555555', desc: 'บริษัท สตาร์ทอัพ เทค จำกัด', status: '✅ ปกติ' }
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setTaxId(formatTaxId(item.id))}
                                            className="text-left p-3 hover:bg-blue-100 hover:text-blue-700 transition-colors rounded border border-blue-200 bg-white"
                                        >
                                            <div className="font-mono text-sm font-medium text-blue-600">{formatTaxId(item.id)}</div>
                                            <div className="text-sm text-gray-600 mt-1">{item.desc}</div>
                                            <div className="text-xs text-gray-500 mt-1">{item.status}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaxIdLookup;