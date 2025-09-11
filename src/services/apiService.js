import axios from 'axios';

// Create axios instance with base configuration
// ใน Vite ใช้ import.meta.env แทน process.env
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_API_KEY}`,
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log('API Request:', config);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log('API Response:', response);
    }
    return response;
  },
  (error) => {
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.error('API Error:', error);
    }
    return Promise.reject(error);
  }
);

// API Methods
export const apiService = {
  // ค้นหาข้อมูลบริษัทจากรหัสนิติบุคคล
  async getCompanyByTaxId(taxId) {
    try {
      const response = await apiClient.get(`/company/lookup/${taxId}`);
      return {
        success: true,
        data: response.data,
        environment: import.meta.env.VITE_APP_ENV,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      // หากเป็น development mode ให้ใช้ mock data
      if (import.meta.env.VITE_APP_ENV === 'development') {
        return this.getMockData(taxId);
      }
      throw new Error(this.getErrorMessage(error));
    }
  },

  // Mock data สำหรับ development
  async getMockData(taxId) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 800));
    
    const mockData = {
      '0123456789123': {
        taxId: '0123456789123',
        companyName: 'บริษัท ตัวอย่าง จำกัด',
        companyNameEn: 'Example Company Limited',
        registrationDate: '2020-01-15',
        status: 'active',
        address: '123/45 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110',
        businessType: 'เทคโนโลยีสารสนเทศและการสื่อสาร',
        capital: '5000000',
        director: 'นายตัวอย่าง ใจดี',
        phone: '02-123-4567',
        website: 'https://example.com'
      },
      '9876543210987': {
        taxId: '9876543210987',
        companyName: 'บริษัท ทดสอบ จำกัด (มหาชน)',
        companyNameEn: 'Test Company Public Limited',
        registrationDate: '2018-07-22',
        status: 'active',
        address: '456/78 ถนนพหลโยธิน แขวงสามเสนใน เขตพญาไท กรุงเทพมหานคร 10400',
        businessType: 'การค้าขายและจำหน่ายสินค้าทั่วไป',
        capital: '100000000',
        director: 'นายทดสอบ สำเร็จ',
        phone: '02-987-6543',
        website: 'https://test-company.co.th'
      },
      '1111111111111': {
        taxId: '1111111111111',
        companyName: 'บริษัท ปิดกิจการแล้ว จำกัด',
        companyNameEn: 'Closed Business Company Limited',
        registrationDate: '2015-03-10',
        status: 'inactive',
        closedDate: '2023-12-31',
        address: '789/12 ถนนราชดำริ แขวงลุมพินี เขตปทุมวัน กรุงเทพมหานคร 10330',
        businessType: 'บริการทั่วไป',
        capital: '2000000',
        director: 'นายปิดกิจการ เศร้าใจ',
        phone: '-',
        website: '-'
      },
      '5555555555555': {
        taxId: '5555555555555',
        companyName: 'บริษัท สตาร์ทอัพ เทค จำกัด',
        companyNameEn: 'Startup Tech Company Limited',
        registrationDate: '2023-01-05',
        status: 'active',
        address: '999/1 อาคารเทคโนโลยี ถนนพระราม 4 แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110',
        businessType: 'พัฒนาซอฟต์แวร์และแอปพลิเคชัน',
        capital: '1000000',
        director: 'นางสาวสตาร์ทอัพ ไฮเทค',
        phone: '095-123-4567',
        website: 'https://startup-tech.co.th'
      }
    };

    if (mockData[taxId]) {
      return {
        success: true,
        data: mockData[taxId],
        environment: import.meta.env.VITE_APP_ENV,
        timestamp: new Date().toISOString(),
        isMockData: true
      };
    } else {
      throw new Error('ไม่พบข้อมูลบริษัทที่มีรหัสนิติบุคคลนี้');
    }
  },

  // ตรวจสอบความถูกต้องของรหัสนิติบุคคล
  validateTaxId(taxId) {
    const cleanTaxId = taxId.replace(/\D/g, '');
    
    if (cleanTaxId.length !== 13) {
      return { valid: false, message: 'รหัสนิติบุคคลต้องมี 13 หลัก' };
    }

    // เช็ค checksum (algorithm สำหรับรหัสนิติบุคคลไทย)
    const digits = cleanTaxId.split('').map(Number);
    const weights = [13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
    
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += digits[i] * weights[i];
    }
    
    const remainder = sum % 11;
    const checkDigit = remainder < 2 ? remainder : 11 - remainder;
    
    if (checkDigit !== digits[12]) {
      return { valid: false, message: 'รหัสนิติบุคคลไม่ถูกต้อง (checksum ผิด)' };
    }

    return { valid: true, message: 'รหัสนิติบุคคลถูกต้อง' };
  },

  // จัดการ error messages
  getErrorMessage(error) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message;
      
      switch (status) {
        case 400:
          return message || 'ข้อมูลที่ส่งไม่ถูกต้อง';
        case 401:
          return 'ไม่มีสิทธิ์เข้าใช้งาน กรุณาตรวจสอบ API Key';
        case 404:
          return 'ไม่พบข้อมูลบริษัทที่มีรหัสนิติบุคคลนี้';
        case 429:
          return 'การเรียกใช้ API เกินขีดจำกัด กรุณารอสักครู่';
        case 500:
          return 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง';
        default:
          return message || `เกิดข้อผิดพลาด (${status})`;
      }
    } else if (error.request) {
      return 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
    } else {
      return error.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
    }
  }
};

export default apiService;