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
    
    // ตรวจสอบความถูกต้องของรหัสนิติบุคคล
    // const validation = apiService.validateTaxId(rawTaxId);
    // if (!validation.valid) {
    //   setValidationError(validation.message);
    //   return;
    // }
    
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
    setValidationError(''); // ลบ validation error เมื่อพิมพ์ใหม่
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
            ระบบค้นหาข้อมูลนิติบุคคล
          </h1>
          <p className="text-gray-600 text-lg">
            กรอกรหัสนิติบุคคลเพื่อค้นหาข้อมูลบริษัท
          </p>
          <p className="text-sm text-indigo-600 mt-2">
            ⚡ Powered by Vite - เร็วกว่าที่เคย
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
                  className={`w-full px-4 py-3 pl-12 border rounded-lg text-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                    validationError ? 'border-red-300 bg-red-50' : 'border-gray-300'
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
                    { id: '012-34-56789-12-3', desc: 'บริษัททั่วไป' },
                    { id: '987-65-43210-98-7', desc: 'บริษัทมหาชน' },
                    { id: '111-11-11111-11-1', desc: 'ปิดกิจการ' },
                    { id: '555-55-55555-55-5', desc: 'สตาร์ทอัพ' }
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
                className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-medium"
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

        {/* Success Result */}
        {result && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-6">
              <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
              <h3 className="text-2xl font-semibold text-gray-900">ข้อมูลบริษัท</h3>
              {result.isMockData && (
                <span className="ml-auto px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                  🧪 Mock Data
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* ข้อมูลหลัก */}
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center">
                    <Building className="w-4 h-4 mr-1" />
                    รหัสนิติบุคคล
                  </label>
                  <div className="flex items-center mt-1">
                    <p className="text-lg font-mono text-gray-900">{result.data.taxId}</p>
                    <CopyButton text={result.data.taxId} fieldName="taxId" />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">ชื่อบริษัท (ไทย)</label>
                  <div className="flex items-center mt-1">
                    <p className="text-lg text-gray-900">{result.data.companyName}</p>
                    <CopyButton text={result.data.companyName} fieldName="companyName" />
                  </div>
                </div>

                {result.data.companyNameEn && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">ชื่อบริษัท (อังกฤษ)</label>
                    <div className="flex items-center mt-1">
                      <p className="text-gray-900">{result.data.companyNameEn}</p>
                      <CopyButton text={result.data.companyNameEn} fieldName="companyNameEn" />
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    วันที่จดทะเบียน
                  </label>
                  <p className="text-gray-900 mt-1">{new Date(result.data.registrationDate).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>

                {result.data.closedDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      วันที่ปิดกิจการ
                    </label>
                    <p className="text-red-600 mt-1">{new Date(result.data.closedDate).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    ทุนจดทะเบียน
                  </label>
                  <p className="text-gray-900 mt-1 text-lg font-semibold">
                    {parseInt(result.data.capital).toLocaleString()} บาท
                  </p>
                </div>
              </div>
              
              {/* ข้อมูลเพิ่มเติม */}
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">สถานะ</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      result.data.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        result.data.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      {result.data.status === 'active' ? 'ดำเนินกิจการ' : 'ปิดกิจการ'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">ประเภทธุรกิจ</label>
                  <p className="text-gray-900 mt-1">{result.data.businessType}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    กรรมการผู้จัดการ
                  </label>
                  <div className="flex items-center mt-1">
                    <p className="text-gray-900">{result.data.director}</p>
                    <CopyButton text={result.data.director} fieldName="director" />
                  </div>
                </div>

                {result.data.phone && result.data.phone !== '-' && (
                  <div>
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

                {result.data.website && result.data.website !== '-' && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center">
                      <Globe className="w-4 h-4 mr-1" />
                      เว็บไซต์
                    </label>
                    <div className="flex items-center mt-1">
                      <a 
                        href={result.data.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-600 hover:text-orange-700 transition-colors font-medium"
                      >
                        {result.data.website}
                      </a>
                      <CopyButton text={result.data.website} fieldName="website" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ที่อยู่ */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <label className="text-sm font-medium text-gray-500 flex items-center mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                ที่อยู่
              </label>
              <div className="flex items-start">
                <p className="text-gray-900 text-sm leading-relaxed flex-1">{result.data.address}</p>
                <CopyButton text={result.data.address} fieldName="address" />
              </div>
            </div>
            
            {/* Footer Info */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap justify-between text-xs text-gray-500 gap-2">
                <span>Environment: {result.environment}</span>
                <span>เวลาที่ค้นหา: {new Date(result.timestamp).toLocaleString('th-TH')}</span>
                {result.isMockData && (
                  <span className="text-orange-600">🧪 ข้อมูลจำลองสำหรับการทดสอบ</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxIdLookup;