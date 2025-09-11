import axios from "axios";

// Create axios instance with base configuration
// ใน Vite ใช้ import.meta.env แทน process.env
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
    client_id: import.meta.env.VITE_CLIENT_ID || "",
    client_secret: import.meta.env.VITE_CLIENT_SECRET || "",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    if (import.meta.env.VITE_DEBUG === "true") {
      console.log("API Request:", config);
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
    if (import.meta.env.VITE_DEBUG === "true") {
      console.log("API Response:", response);
    }
    return response;
  },
  (error) => {
    if (import.meta.env.VITE_DEBUG === "true") {
      console.error("API Error:", error);
    }
    return Promise.reject(error);
  }
);

// API Methods
export const apiService = {
  // ค้นหาข้อมูลบริษัทจากรหัสนิติบุคคล
  async getCompanyByTaxId(taxId) {
    try {
      const response = await apiClient.get(
        `/dc85609a-a8e7-4076-b0a6-f3cf4bd005ec/customs/entities/${taxId}`
      );
      return {
        ...response.data,
        environment: import.meta.env.VITE_APP_ENV,
      };
    } catch (error) {
      // หากเป็น development mode ให้ใช้ mock data
      if (import.meta.env.VITE_APP_ENV === "development") {
        return this.getMockData(taxId);
      }
      throw new Error(this.getErrorMessage(error));
    }
  },

  // Mock data สำหรับ development ตามรูปแบบ API ใหม่
  async getMockData(taxId) {
    // Simulate API delay
    await new Promise((resolve) =>
      setTimeout(resolve, 800 + Math.random() * 800)
    );

    const mockData = {
      "0105551234567": {
        status: "SUCCESS",
        messageTH: "ทำรายการสำเร็จ",
        messageEN: "Transaction successful",
        transactionId: `TRX${Date.now()}${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        data: {
          taxNumber: "0105551234567",
          branch: 1,
          title: "บริษัท",
          preName: "001",
          name: "บริษัท ตัวอย่าง จำกัด",
          nameEnglish: "Example Company Limited",
          level: "G",
          personalType: "1",
          houseNumber: "99/88",
          buildingName: "อาคารตัวอย่าง",
          mooNumber: "5",
          soiNumber: "สุขุมวิท 10",
          streetName: "สุขุมวิท",
          tumbolName: "คลองตัน",
          amphurName: "คลองเตย",
          provinceName: "กรุงเทพมหานคร",
          postCode: "10110",
          phone: "021234567",
          fax: "021234568",
          email: "info@example.com",
          capitalAmount: 5000000,
          incorporationDate: 20200101,
          countryBase: "TH",
          penalty: "N",
          registerDate: 20200115,
          registerTime: 93000,
          dateAmend: 20210301,
          timeAmend: 103000,
          penaltyOrderForm: "N",
          penaltyInForm: "N",
          associationCode: 12,
          customsRegisterDirectorInfo: {
            personalNumber: "1101700234567",
            personalType: "1",
            employeeType: "D",
            preName: "001",
            preNameDesc: "นาย",
            firstName: "สมชาย",
            lastName: "ใจดี",
            firstNameEnglish: "Somchai",
            lastNameEnglish: "Jaidee",
            phone: "023334444",
            email: "somchai@example.com",
            dateOfBirth: 19790101,
            companyRegisterStatus: "A",
            employeeRegisterStatus: "Active",
          },
        },
      },
      "0105559876543": {
        status: "SUCCESS",
        messageTH: "ทำรายการสำเร็จ",
        messageEN: "Transaction successful",
        transactionId: `TRX${Date.now()}${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        data: {
          taxNumber: "0105559876543",
          branch: 1,
          title: "บริษัท",
          preName: "001",
          name: "บริษัท ทดสอบ จำกัด (มหาชน)",
          nameEnglish: "Test Company Public Limited",
          level: "G",
          personalType: "1",
          houseNumber: "456/78",
          buildingName: "อาคารทดสอบ",
          mooNumber: "3",
          soiNumber: "พหลโยธิน 15",
          streetName: "พหลโยธิน",
          tumbolName: "สามเสนใน",
          amphurName: "พญาไท",
          provinceName: "กรุงเทพมหานคร",
          postCode: "10400",
          phone: "029876543",
          fax: "029876544",
          email: "contact@test.co.th",
          capitalAmount: 100000000,
          incorporationDate: 20180722,
          countryBase: "TH",
          penalty: "N",
          registerDate: 20180801,
          registerTime: 103000,
          dateAmend: 20230515,
          timeAmend: 140000,
          penaltyOrderForm: "N",
          penaltyInForm: "N",
          associationCode: 15,
          customsRegisterDirectorInfo: {
            personalNumber: "1101700987654",
            personalType: "1",
            employeeType: "D",
            preName: "001",
            preNameDesc: "นาย",
            firstName: "ทดสอบ",
            lastName: "สำเร็จ",
            firstNameEnglish: "Test",
            lastNameEnglish: "Success",
            phone: "029998888",
            email: "test@test.co.th",
            dateOfBirth: 19750315,
            companyRegisterStatus: "A",
            employeeRegisterStatus: "Active",
          },
          customsRegisterBrokerInfo: {
            brokerTaxNumber: "0105557654321",
            title: "บริษัท",
            brokerName: "บริษัท นายหน้า จำกัด",
            brokerNameEnglish: "Broker Company Limited",
            phone: "022445566",
            email: "broker@example.com",
            startDate: 20200101,
            finishDate: 20991231,
            companyRegisterStatus: "A",
            brokerRegisterStatus: "A",
          },
        },
      },
      1111111111111: {
        status: "SUCCESS",
        messageTH: "ทำรายการสำเร็จ",
        messageEN: "Transaction successful",
        transactionId: `TRX${Date.now()}${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        data: {
          taxNumber: "1111111111111",
          branch: 1,
          title: "บริษัท",
          preName: "001",
          name: "บริษัท ปิดกิจการแล้ว จำกัด",
          nameEnglish: "Closed Business Company Limited",
          level: "G",
          personalType: "1",
          houseNumber: "789/12",
          mooNumber: "1",
          streetName: "ราชดำริ",
          tumbolName: "ลุมพินี",
          amphurName: "ปทุมวัน",
          provinceName: "กรุงเทพมหานคร",
          postCode: "10330",
          phone: "",
          fax: "",
          email: "",
          capitalAmount: 2000000,
          incorporationDate: 20150310,
          countryBase: "TH",
          penalty: "Y",
          registerDate: 20150315,
          registerTime: 93000,
          dateAmend: 20231231,
          timeAmend: 170000,
          penaltyOrderForm: "Y",
          penaltyInForm: "Y",
          associationCode: 0,
          customsRegisterDirectorInfo: {
            personalNumber: "1101700111111",
            personalType: "1",
            employeeType: "D",
            preName: "001",
            preNameDesc: "นาย",
            firstName: "ปิดกิจการ",
            lastName: "เศร้าใจ",
            firstNameEnglish: "Closed",
            lastNameEnglish: "Business",
            phone: "",
            email: "",
            dateOfBirth: 19700101,
            companyRegisterStatus: "I",
            employeeRegisterStatus: "Inactive",
          },
        },
      },
      "0105555555555": {
        status: "SUCCESS",
        messageTH: "ทำรายการสำเร็จ",
        messageEN: "Transaction successful",
        transactionId: `TRX${Date.now()}${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        data: {
          taxNumber: "0105555555555",
          branch: 1,
          title: "บริษัท",
          preName: "001",
          name: "บริษัท สตาร์ทอัพ เทค จำกัด",
          nameEnglish: "Startup Tech Company Limited",
          level: "G",
          personalType: "1",
          houseNumber: "999/1",
          buildingName: "อาคารเทคโนโลยี",
          mooNumber: "1",
          soiNumber: "อโศก 5",
          streetName: "พระราม 4",
          tumbolName: "คลองเตย",
          amphurName: "คลองเตย",
          provinceName: "กรุงเทพมหานคร",
          postCode: "10110",
          phone: "0951234567",
          fax: "",
          email: "contact@startup-tech.co.th",
          capitalAmount: 1000000,
          incorporationDate: 20230105,
          countryBase: "TH",
          penalty: "N",
          registerDate: 20230110,
          registerTime: 93000,
          dateAmend: 20240201,
          timeAmend: 103000,
          penaltyOrderForm: "N",
          penaltyInForm: "N",
          associationCode: 50,
          customsRegisterDirectorInfo: {
            personalNumber: "1101700555555",
            personalType: "1",
            employeeType: "D",
            preName: "002",
            preNameDesc: "นางสาว",
            firstName: "สตาร์ทอัพ",
            lastName: "ไฮเทค",
            firstNameEnglish: "Startup",
            lastNameEnglish: "Hitech",
            phone: "0951234567",
            email: "startup@startup-tech.co.th",
            dateOfBirth: 19920815,
            companyRegisterStatus: "A",
            employeeRegisterStatus: "Active",
          },
          customsRegisterEmployeeInfo: {
            personalNumber: "1101700444444",
            personalType: "1",
            employeeType: "S",
            preName: "001",
            preNameDesc: "นาย",
            firstName: "นักพัฒนา",
            lastName: "โค้ดดิ้ง",
            firstNameEnglish: "Developer",
            lastNameEnglish: "Coding",
            phone: "0952223333",
            email: "dev@startup-tech.co.th",
            dateOfBirth: 19950101,
            companyRegisterStatus: "A",
            employeeRegisterStatus: "Active",
          },
          customsRegisterBankAccountInfo: {
            accountNumber: "987654321098",
            accountName: "บัญชีบริษัท สตาร์ทอัพ เทค จำกัด",
            accountType: "01",
            creditDebit: "CR",
            bankCode: 148,
            branchCode: 5678,
            transactionType: "D",
          },
        },
      },
      // Mock Error Cases
      9999999999999: {
        status: "FAIL",
        messageTH: "ทำรายการไม่สำเร็จ",
        messageEN: "Transaction Fail",
        transactionId: `TRX${Date.now()}${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        error: {
          status: 400,
          type: "DFT::ERROR::UNPROCESSABLEENTITIES",
          title: "Response Error",
          detail: "Request is well-formed but semantically invalid",
          instance: "/CustomsRegistrationService/inquiryCustomsRegister",
          providers: "Customs",
          service: "/CustomsRegistrationService/inquiryCustomsRegister",
          rawResponse: {
            type: "NSW:ERROR::400",
            title: "Validation Error",
            status: 400,
            detail: "organizationJuristicId is not found",
            instance: "/CustomsRegistrationService/inquiryCustomsRegister",
          },
        },
      },
      8888888888888: {
        status: "FAIL",
        messageTH: "ไม่มีสิทธิ์เข้าใช้งาน",
        messageEN: "Unauthorized Access",
        transactionId: `TRX${Date.now()}${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        error: {
          status: 401,
          type: "AUTHENTICATION_ERROR",
          title: "Unauthorized",
          detail: "Access token is missing or invalid",
          instance: "/CustomsRegistrationService/inquiryCustomsRegister",
          providers: "Customs",
          service: "/CustomsRegistrationService/inquiryCustomsRegister",
          rawResponse: {
            type: "NSW:ERROR::401",
            title: "Unauthorized",
            status: 401,
            detail: "Unauthorized",
            instance: "/CustomsRegistrationService/inquiryCustomsRegister",
          },
        },
      },
    };

    // ลบ '-' และเอาเฉพาะตัวเลข
    const cleanTaxId = taxId.replace(/\D/g, "");

    if (mockData[cleanTaxId]) {
      const result = {
        ...mockData[cleanTaxId],
        environment: import.meta.env.VITE_APP_ENV,
        isMockData: true,
      };

      // ถ้าเป็น error case ให้ throw error
      if (result.status === "FAIL") {
        throw {
          isApiError: true,
          ...result,
        };
      }

      return result;
    } else {
      throw new Error("ไม่พบข้อมูลบริษัทที่มีรหัสนิติบุคคลนี้");
    }
  },

  // ตรวจสอบความถูกต้องของรหัสนิติบุคคล
  validateTaxId(taxId) {
    const cleanTaxId = taxId.replace(/\D/g, "");

    if (cleanTaxId.length !== 13) {
      return { valid: false, message: "รหัสนิติบุคคลต้องมี 13 หลัก" };
    }

    // เช็ค checksum (algorithm สำหรับรหัสนิติบุคคลไทย)
    const digits = cleanTaxId.split("").map(Number);
    const weights = [13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];

    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += digits[i] * weights[i];
    }

    const remainder = sum % 11;
    const checkDigit = remainder < 2 ? remainder : 11 - remainder;

    if (checkDigit !== digits[12]) {
      return {
        valid: false,
        message: "รหัสนิติบุคคลไม่ถูกต้อง (checksum ผิด)",
      };
    }

    return { valid: true, message: "รหัสนิติบุคคลถูกต้อง" };
  },

  // จัดการ error messages
  getErrorMessage(error) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message;

      switch (status) {
        case 400:
          return message || "ข้อมูลที่ส่งไม่ถูกต้อง";
        case 401:
          return "ไม่มีสิทธิ์เข้าใช้งาน กรุณาตรวจสอบ API Key";
        case 404:
          return "ไม่พบข้อมูลบริษัทที่มีรหัสนิติบุคคลนี้";
        case 429:
          return "การเรียกใช้ API เกินขีดจำกัด กรุณารอสักครู่";
        case 500:
          return "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง";
        default:
          return message || `เกิดข้อผิดพลาด (${status})`;
      }
    } else if (error.request) {
      return "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต";
    } else {
      return error.message || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
    }
  },
};

export default apiService;
