import React, { useState } from 'react';
import { Code, Send, Loader, CheckCircle, AlertCircle, Copy, CheckCheck, FileJson } from 'lucide-react';
import Navigation from './Navigation';

const ApiTesterPost = () => {
    const [selectedEndpoint, setSelectedEndpoint] = useState('');
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [error, setError] = useState('');
    const [copiedJson, setCopiedJson] = useState(false);
    const [pathParams, setPathParams] = useState({});
    const [requestBody, setRequestBody] = useState('');
    const [jsonError, setJsonError] = useState('');

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    const version = import.meta.env.VITE_API_VERSION;

    // API Endpoints สำหรับ POST method
    const endpoints = [
        {
            id: 'nsw-car001',
            name: '(NSW-CAR001) - Upload Reference Document',
            baseUrl: `${apiBaseUrl}/nsw/cargo/elock/{nswRefId}/referenceDocument`,
            description: 'อัพโหลดเอกสารอ้างอิง E-Lock',
            pathParams: ['nswRefId'],
            requestBodyExample: {
                xxx: "INVOICE",
                yyy: "INV2024001",
                callback_url: "https://webhook.site/efe10a8b-ec08-4cef-9cf2-3f9493601efb"
            }
        },
        {
            id: 'nsw-sss001',
            name: '(NSW-SSS001) - Get Request Progress',
            baseUrl: `${apiBaseUrl}/nsw/sss/requests/{document_id}/progress`,
            description: 'ตรวจสอบสถานะความคืบหน้าคำขอ',
            pathParams: ['document_id'],
            requestBodyExample: {
                message_header: {
                    message_info: {
                        message_id: "550e8400-e29b-41d4-a716-446655440000",
                        ref_to_message_id: "550e8400-e29b-41d4-a716-446655440001",
                        timestamp: "2025-10-15T10:30:00Z"
                    },
                    party_info: {
                        from: {
                            party_id: "SENDER001",
                            role: "EXPORTER"
                        },
                        to: {
                            party_id: "RECV001",
                            role: "CUSTOMS"
                        }
                    },
                    collaboration_info: {
                        conversation_id: "550e8400-e29b-41d4-a716-446655440002",
                        service: "submitPermitDocumentToNSW",
                        action: "REQUEST"
                    },
                    business_info: {
                        single_form_reference: "SF2025001",
                        document_id: "AAAA123456789",
                        document_type: "DFT-R04-CER"
                    }
                },
                payload: {
                    content_type: "application/json",
                    data: {
                        document_id: "AAAA123456789",
                        document_number: "DOC2025001",
                        document_type: "DFT-R04-CER",
                        response_code: "AC001",
                        rejected_items: [
                            {
                                item_number: "1",
                                reasons: [
                                    {
                                        reason_code: "ERR001",
                                        description: "ข้อมูลไม่ครบถ้วน"
                                    }
                                ]
                            }
                        ],
                        payment_request: {
                            payment_reference: "PAY2025001",
                            payment_reference_numbers: [
                                {
                                    name: "ref1",
                                    value: "REF2025001"
                                },
                                {
                                    name: "ref2",
                                    value: "REF2025002"
                                }
                            ],
                            payment_channel: "QR_CODE",
                            payment_due_date: "2025-11-15",
                            amount: 1500.00,
                            currency_code: "THB",
                            qr_code: {
                                format: "BANK-QR",
                                payload: "00020101021129370016A000000677010111011300660000000005802TH530376454041500.005802TH6304ABCD",
                                display_text: "สแกนเพื่อชำระเงิน"
                            },
                            payee: {
                                agency_code: "DFT001",
                                agency_name: "กรมการค้าต่างประเทศ",
                                bank_code: 14,
                                comp_code: "1234"
                            },
                            remark: "กรุณาชำระภายใน 30 วัน"
                        },
                        attachments: [
                            {
                                attachment_id: "ATT001",
                                file_name: "certificate.pdf",
                                file_type: "application/pdf",
                                file_size: 102400,
                                file_content: "base64EncodedContent=="
                            }
                        ]
                    }
                },
                payload_security_info: {
                    integrity: {
                        alg: "SHA256",
                        hash_value: "47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU="
                    },
                    signature: {
                        alg: "RS256",
                        signature_value: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9",
                        key_info: {
                            key_id: "sender-key-2025"
                        }
                    },
                    encryption: {
                        alg: "RSA-OAEP",
                        enc: "A256GCM",
                        key_info: {
                            key_id: "receiver-key-2025"
                        },
                        original_content_type: "application/json"
                    }
                },
                callback_url: "https://webhook.site/efe10a8b-ec08-4cef-9cf2-3f9493601efb"
            }
        },
        {
            id: 'nsw-sss002',
            name: '(NSW-SSS002) - Get Permit Document',
            baseUrl: `${apiBaseUrl}/nsw/sss/requests/{requestId}/permit-document`,
            description: 'ดึงเอกสารใบอนุญาต',
            pathParams: ['requestId'],
            requestBodyExample: {
                message_header: {
                    message_info: {
                        message_id: "550e8400-e29b-41d4-a716-446655440000",
                        ref_to_message_id: "550e8400-e29b-41d4-a716-446655440001",
                        timestamp: "2025-10-15T10:30:00Z"
                    },
                    party_info: {
                        from: {
                            party_id: "SENDER001",
                            role: "EXPORTER"
                        },
                        to: {
                            party_id: "RECV001",
                            role: "CUSTOMS"
                        }
                    },
                    collaboration_info: {
                        conversation_id: "550e8400-e29b-41d4-a716-446655440002",
                        service: "submitPermitDocumentToNSW",
                        action: "REQUEST"
                    },
                    business_info: {
                        single_form_reference: "SF2025001",
                        document_id: "AAAA123456789",
                        document_type: "DFT-R04-CER"
                    }
                },
                payload: {
                    content_type: "application/json",
                    data: {
                        document_id: "AAAA123456789",
                        document_number: "DOC2025001",
                        document_type: "DFT-R04-CER",
                        response_code: "AC001",
                        rejected_items: [
                            {
                                item_number: "1",
                                reasons: [
                                    {
                                        reason_code: "ERR001",
                                        description: "ข้อมูลไม่ครบถ้วน"
                                    }
                                ]
                            }
                        ],
                        payment_request: {
                            payment_reference: "PAY2025001",
                            payment_reference_numbers: [
                                {
                                    name: "ref1",
                                    value: "REF2025001"
                                },
                                {
                                    name: "ref2",
                                    value: "REF2025002"
                                }
                            ],
                            payment_channel: "QR_CODE",
                            payment_due_date: "2025-11-15",
                            amount: 1500.00,
                            currency_code: "THB",
                            qr_code: {
                                format: "BANK-QR",
                                payload: "00020101021129370016A000000677010111011300660000000005802TH530376454041500.005802TH6304ABCD",
                                display_text: "สแกนเพื่อชำระเงิน"
                            },
                            payee: {
                                agency_code: "DFT001",
                                agency_name: "กรมการค้าต่างประเทศ",
                                bank_code: 14,
                                comp_code: "1234"
                            },
                            remark: "กรุณาชำระภายใน 30 วัน"
                        },
                        attachments: [
                            {
                                attachment_id: "ATT001",
                                file_name: "certificate.pdf",
                                file_type: "application/pdf",
                                file_size: 102400,
                                file_content: "base64EncodedContent=="
                            }
                        ]
                    }
                },
                payload_security_info: {
                    integrity: {
                        alg: "SHA256",
                        hash_value: "47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU="
                    },
                    signature: {
                        alg: "RS256",
                        signature_value: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9",
                        key_info: {
                            key_id: "sender-key-2025"
                        }
                    },
                    encryption: {
                        alg: "RSA-OAEP",
                        enc: "A256GCM",
                        key_info: {
                            key_id: "receiver-key-2025"
                        },
                        original_content_type: "application/json"
                    }
                },
                callback_url: "https://webhook.site/efe10a8b-ec08-4cef-9cf2-3f9493601efb"
            }
        },
        {
            id: 'cus004',
            name: '(CUS004) - Record E-Lock Installation',
            baseUrl: `${apiBaseUrl}/customs/elock/{nswRefId}/installations`,
            description: 'บันทึกการติดตั้ง E-Lock',
            pathParams: ['nswRefId'],
            requestBodyExample: {
                containerNo: "CMAU1234567",
                transitDeclarationNo: "TD123456789",
                trackingNo: "TRK987654321",
                callback_url: "https://webhook.site/efe10a8b-ec08-4cef-9cf2-3f9493601efb"
            }
        },
        {
            id: 'cus005',
            name: '(CUS005) - Send E-Lock Alert',
            baseUrl: `${apiBaseUrl}/customs/elock/{nswRefId}/alerts`,
            description: 'ส่งการแจ้งเตือนจาก E-Lock',
            pathParams: ['nswRefId'],
            requestBodyExample: {
                trackingNo: "TRX202509050001",
                alert: {
                    trackId: "TRK-000123",
                    mappingId: "MAP-001",
                    deviceId: "ELOCK-DEV-7890",
                    imei: "359762081234567",
                    mobileNum: "0812345678",
                    simNum1: "8966001234567890123",
                    simNum2: "8966001987654321098",
                    carId: "CAR-TH-001",
                    frontLicense: "1กก1234",
                    backLicense: "1กก1234",
                    frontCity: "กรุงเทพมหานคร",
                    backCity: "กรุงเทพมหานคร",
                    color: "ขาว",
                    bodynum: "MRHCM12345A678901",
                    carPersonId: "DRV-00001",
                    name: "Somchai",
                    surname: "Sukjai",
                    driverLicense: "5401234567890",
                    personAddress: "99 ถ.หลัก แขวงดินแดง เขตดินแดง กรุงเทพฯ 10400",
                    personPhone: "0891234567",
                    containerId: "CONT-0001",
                    containerNumber: "TGHU1234567",
                    vendorId: "VDR-001",
                    vendorType: "SERVICE_PROVIDER",
                    titleId: "MR",
                    vendorFname: "Thanakorn",
                    vendorLname: "Prasert",
                    vendorName: "Example eLock Co., Ltd.",
                    phoneNo1: "021234567",
                    phoneNo2: "021234568",
                    speed: "62.5",
                    course: "NE",
                    signal: "GOOD",
                    batlv: "78%",
                    geomTrack: "{\"type\":\"Point\",\"coordinates\":[100.5018,13.7563]}",
                    geomTrackLocation: "ด่านศุลกากรท่าเรือกรุงเทพ",
                    alarmtypeId: 0,
                    mapAlarmId: "ALM-MAP-0001",
                    updateBy: "system",
                    updateDt: "2025-09-05T11:30:00Z"
                },
                callback_url: "https://webhook.site/efe10a8b-ec08-4cef-9cf2-3f9493601efb"
            }
        },
        {
            id: 'cus006',
            name: '(CUS006) - Request E-Lock Unlock',
            baseUrl: `${apiBaseUrl}/customs/elock/{nswRefId}/unlock`,
            description: 'ขอปลดล็อค E-Lock',
            pathParams: ['nswRefId'],
            requestBodyExample: {
                trackingNo: "TRX202509050001",
                callback_url: "https://webhook.site/efe10a8b-ec08-4cef-9cf2-3f9493601efb"
            }
        },
        {
            id: 'dft001',
            name: '(DFT001) - Create New Request',
            baseUrl: `${apiBaseUrl}/dft/requests`,
            description: 'สร้างคำขอใหม่',
            pathParams: [],
            requestBodyExample: {
                // ส่วน Header ของข้อความสำหรับ NSW (M = Mandatory)
                message_header: {
                    // ข้อมูลระบุตัวตนและเวลาของข้อความ
                    message_info: {
                        message_id: "550e8400-e29b-41d4-a716-446655440001", // UUID v4 format (36 chars)
                        ref_to_message_id: "", // UUID v4 format ถ้ามี (36 chars)
                        timestamp: "2024-01-15T10:30:00Z" // ISO 8601 UTC format (35 chars)
                    },

                    // ข้อมูลผู้ส่งและผู้รับ
                    party_info: {
                        from: {
                            party_id: "1234567890", // รหัส 10 หลักจาก Thai NSW
                            role: "Submitter" // บทบาทผู้ส่ง (20 chars)
                        },
                        to: {
                            party_id: "0987654321", // รหัส 10 หลักจาก Thai NSW
                            role: "Receiver" // บทบาทผู้รับ (20 chars)
                        }
                    },

                    // ข้อมูลบริบทการทำงานร่วมกัน
                    collaboration_info: {
                        conversation_id: "550e8400-e29b-41d4-a716-446655440002", // UUID v4 (36 chars)
                        service: "DFT-WTO-Certificate", // บริการทางธุรกิจ (50 chars)
                        action: "Submit" // การกระทำทางธุรกิจ (30 chars)
                    },

                    // ข้อมูลอ้างอิงที่เกี่ยวกับเนื้อหา
                    business_info: {
                        single_form_reference: "", // Optional - รหัสอ้างอิง Single Form
                        request_reference: "REF20240115001", // รหัสอ้างอิงคำขอ
                        document_type: "DFT-R04-REQ" // ประเภทเอกสาร - คำขอหนังสือรับรอง WTO นอกโควตา
                    }
                },

                // ส่วนเนื้อหาข้อมูลทางธุรกิจ
                payload: {
                    content_type: "application/json", // MIME Type
                    data: {
                        // รหัสอ้างอิงคำขอ (13 chars: AAAA + 9 digits)
                        document_id: "DFTR000000001",

                        // เลขที่อ้างอิงเอกสารคำขอเดิม (Optional)
                        referred_document_id: "",

                        // ประเภทใบอนุญาต (1 char)
                        // 0=นำเข้า, 1=ส่งออก, 2=ผ่านแดน, 3=นำเข้าและส่งออก
                        // 4=นำเข้าและได้รับสิทธิพิเศษทางภาษีศุลกากร, 5=สิทธิพิเศษทางภาษีศุลกากร
                        // 6=Re-export, 7=Re-import
                        license_type: "4",

                        // ประเภทใบอนุญาต คต. (10 chars)
                        request_type: "DFT-RO4",

                        // รหัสผู้ส่งข้อมูล NSW ID (35 chars)
                        submitter_identifier: "NSW-ID-1234567890",

                        // ผู้ยื่นคำขอ/ผู้กระทำการแทน
                        agent: {
                            agent_name: "บริษัท ตัวแทนนำเข้าส่งออก จำกัด", // 120 chars
                            company_tax_Number: "0105500000001", // 17 chars (Optional)
                            agent_identifier: "1234567890123" // เลขประจำตัวประชาชน 13 หลัก
                        },

                        // ผู้นำเข้า-ส่งออก/ผู้ขอ/ผู้ได้รับใบอนุญาต
                        requester: {
                            company_name: "ABC IMPORT EXPORT CO., LTD.", // 120 chars
                            company_tax_Number: "0105500000002", // 17 chars
                            company_branch: 0, // 6 digits
                            street_and_Number_1: "123/45", // บ้านเลขที่ (70 chars)
                            street_and_Number_2: "10", // หมู่ (70 chars) Optional
                            street_and_Number_3: "ซอยสุขุมวิท 39", // ตรอก/ซอย (70 chars) Optional
                            street_and_Number_4: "ถนนสุขุมวิท", // ถนน (70 chars) Optional
                            district: "คลองเตยเหนือ", // แขวง/ตำบล (35 chars)
                            sub_province: "วัฒนา", // อำเภอ/เขต (35 chars)
                            city: "กรุงเทพมหานคร", // เมือง/จังหวัด (35 chars)
                            postcode: "10110", // รหัสไปรษณีย์ (9 chars)
                            phone_Number: "0212345678", // โทรศัพท์ (15 chars)
                            fax: "0212345679" // โทรสาร (15 chars) Optional
                        },

                        // ผู้ซื้อ/ผู้รับ (Optional)
                        buyer: {
                            buyer_name: "Foreign Buyer Company Ltd.", // 70 chars
                            street_and_number_1: "456 Main Street", // 70 chars
                            street_and_number_2: "", // Optional
                            street_and_number_3: "", // Optional
                            street_and_number_4: "", // Optional
                            district: "", // Optional (35 chars)
                            sub_province: "", // Optional (35 chars)
                            city: "New York", // 35 chars
                            postcode: "10001", // Optional (9 chars)
                            country_code: "US", // ISO 3166 2 chars
                            phone_number: "+12125551234", // Optional (15 chars)
                            fax: "" // Optional (15 chars)
                        },

                        // ข้อมูลผู้ส่งออกสินค้า
                        exporter: {
                            company_name: "Thai Exporter Co., Ltd.", // 120 chars
                            street_and_number_1: "789/12", // 70 chars
                            street_and_number_2: "", // Optional
                            street_and_number_3: "", // Optional
                            street_and_number_4: "", // Optional
                            district: "บางรัก", // Optional (35 chars)
                            sub_province: "บางรัก", // Optional (35 chars)
                            city: "กรุงเทพมหานคร", // 35 chars
                            postcode: "10500", // Optional (9 chars)
                            country_code: "TH", // ISO 3166 2 chars
                            phone_number: "0223456789", // Optional (15 chars)
                            fax: "" // Optional (15 chars)
                        },

                        // ผู้ขายสินค้า (Optional)
                        seller: {
                            seller_name: "", // Optional (120 chars)
                            street_and_number_1: "", // Optional
                            street_and_number_2: "", // Optional
                            street_and_number_3: "", // Optional
                            street_and_number_4: "", // Optional
                            district: "", // Optional
                            sub_province: "", // Optional
                            city: "", // Optional
                            postcode: "", // Optional
                            country_code: "", // Optional
                            phone_number: "", // Optional
                            fax: "" // Optional
                        },

                        // ข้อมูลการนำเข้า/ส่งออก
                        import_export: {
                            country_exportation_code: "US", // รหัสประเทศต้นทางบรรทุก ISO 3166 (2 chars)
                            import_condition: 1, // 1=สินค้ายังมิได้ส่งจากต้นทาง, 2=อยู่ระหว่างเดินทาง, 3=เข้ามาในราชอาณาจักรแล้ว
                            explanation_and_reason: "นำเข้าสินค้าเพื่อจำหน่ายในประเทศ ตามความต้องการของตลาด" // 512 chars
                        },

                        // ข้อมูลใบกำกับรายการสินค้า (Invoice)
                        invoices: [
                            {
                                invoice_number: "INV2024010001", // 35 chars
                                invoice_date: "2024-01-10", // YYYY-MM-DD format
                                border_transport_means_mode: "1", // 1=เรือ, 2=รถไฟ, 3=รถยนต์, 4=เครื่องบิน, 5=ไปรษณีย์, 7=ท่อ, 8=เรือเล็ก, 9=ผู้โดยสาร
                                border_transport_means_name: "EVERGREEN MARINE", // ชื่อยานพาหนะ (35 chars)
                                arrival_date: "2024-02-01", // วันที่นำเข้า YYYY-MM-DD
                                unloading_location_identifier: 1001, // รหัสท่าที่นำเข้า (4 digits)
                                incoterms_terms: "CIF", // เงื่อนไขซื้อขาย EXW, FCA, FAS, FOB, CFR, CIF, CPT, CIP, DAT, DAP, DDP, ZZZ
                                other_term: "", // กรณี ZZZ ระบุรายละเอียด (120 chars) Optional
                                exchange_rate: 35.25 // อัตราแลกเปลี่ยน (12 digits) Optional
                            }
                        ],

                        // ข้อมูลรายการสินค้า
                        details: [
                            {
                                request_line_number: 1, // ลำดับรายการ 1-999
                                invoice_number: "INV2024010001", // เลขที่ใบกำกับสินค้า (35 chars)
                                invoice_item_number: 1, // ลำดับรายการในใบกำกับ (4 digits)
                                commodity_classification_identifier: 100630000000, // รหัสพิกัดศุลกากร (12 digits)
                                statistical_code: 100, // รหัสสถิติสินค้า (3 digits)
                                product_name: "JASMINE RICE", // ชื่อสินค้า (35 chars)
                                thai_description_of_goods: "ข้าวหอมมะลิ คุณภาพพิเศษ บรรจุถุง 5 กิโลกรัม", // รายละเอียดภาษาไทย (512 chars)
                                quantity: 1000.000, // ปริมาณ (14 digits, 3 decimals)
                                quantity_unit_code: "KGM", // หน่วยปริมาณ UNECE Rec 20 (3 chars) Optional
                                net_weight: 1000.000, // น้ำหนักสุทธิ (14 digits, 3 decimals)
                                net_weight_unit_code: "KGM", // หน่วยน้ำหนัก: KGM, TNE, GRM, CTM
                                specific_unit_code: 2, // รูปแบบคำนวณ: 1=ต่อ Ton, 2=ต่อ KGM, 3=ต่อบรรจุภัณฑ์
                                weight_sack: 5, // น้ำหนักต่อกระสอบ KGM (8 digits)
                                country_of_origin_code: "TH", // รหัสประเทศกำเนิด ISO 3166
                                invoice_amount_baht: 50000.00, // มูลค่ารวมบาท (16 digits, 2 decimals)
                                invoice_amount_foreign: 1418.44, // มูลค่าเงินต่างประเทศ Optional
                                currency_code: "USD" // สกุลเงิน
                            }
                        ],

                        // เอกสารแนบ (Optional)
                        attachments: [
                            {
                                item_number: 1, // ลำดับ 1-9
                                attachment_type: "REFERENCE", // REFERENCE หรือ EMBEDDED
                                document_number: "CERT123456", // เลขที่เอกสาร (35 chars) Optional
                                issue_authority_tax_id: "0994000165213", // เลขผู้เสียภาษีผู้ออกเอกสาร Optional
                                issue_date: "2024-01-05", // วันที่ออก YYYY-MM-DD Optional
                                document_type_code: "380", // รหัสประเภทเอกสาร (3 chars) Optional
                                document_type_name: "ใบรับรองคุณภาพสินค้า", // ชื่อเอกสารแนบ
                                file_name: "quality_cert.pdf", // ชื่อไฟล์ Optional
                                reference_details: {
                                    file_type: "PDF", // PDF, Excel, Word, Image (15 chars) Optional
                                    file_id: "FILE123456789", // ID ในระบบจัดเก็บ (50 chars)
                                    file_uri: "https://storage.example.com/docs/FILE123456789" // URL (512 chars)
                                },
                                embedded_details: null, // ใช้เมื่อ attachment_type = EMBEDDED
                                remark: "" // หมายเหตุ Optional
                            },
                            {
                                item_number: 2,
                                attachment_type: "EMBEDDED", // แนบไฟล์ตรง
                                document_number: "",
                                issue_authority_tax_id: "",
                                issue_date: "",
                                document_type_code: "",
                                document_type_name: "หนังสือมอบอำนาจ",
                                file_name: "power_of_attorney.pdf",
                                reference_details: null,
                                embedded_details: {
                                    content_type: "application/pdf", // MIME Type (255 chars)
                                    data: "JVBERi0xLjQKJeLjz9M..." // Base64 encoded file content
                                },
                                remark: "หนังสือมอบอำนาจฉบับล่าสุด"
                            }
                        ]
                    }
                },

                // ส่วนข้อมูล Security ของ Payload (Optional)
                payload_security_info: {
                    // ข้อมูล Hash (Optional)
                    integrity: {
                        alg: "SHA256", // Algorithm ที่ใช้
                        hash_value: "RG9jdW1lbnQgSGFzaCBWYWx1ZQ==" // Base64 encoded hash
                    },

                    // ข้อมูล Signature (Optional)
                    signature: {
                        alg: "RS256", // Algorithm
                        signature_value: "U2lnbmF0dXJlIFZhbHVl", // Base64URL encoded
                        key_info: {
                            key_id: "CERT-123456" // ตัวระบุ Key/Cert ของผู้ส่ง (255 chars)
                        }
                    },

                    // ข้อมูล Encryption (Optional)
                    encryption: {
                        alg: "RSA-OAEP", // Key Encryption Algorithm
                        enc: "A256GCM", // Content Encryption Algorithm
                        key_info: {
                            key_id: "RECIPIENT-CERT-789" // ตัวระบุ Key/Cert ของผู้รับ (255 chars)
                        },
                        original_content_type: "application/json" // Content Type เดิมก่อนเข้ารหัส
                    }
                },
                callback_url: "https://webhook.site/efe10a8b-ec08-4cef-9cf2-3f9493601efb"
            }
        },
        {
            id: 'eb001',
            name: '(EB001) - EBMS API',
            baseUrl: `${apiBaseUrl}/api/ebms`,
            description: 'EBMS API',
            // pathParams: ['nswRefId'],
            requestBodyExample: {
                callback_url: "https://webhook.site/efe10a8b-ec08-4cef-9cf2-3f9493601efb",
                data: {
                    msg_id: "MSG20241014153044001",
                    msg_ts: "2024-10-14T15:30:44",
                    refmsg_id: "REFMSG20241014001",
                    from_id: "01234567890123456789012345678",
                    to_id: "98765432109876543210987654321",
                    service: "THNSW.THTCD.eLicense",
                    action: "LicensePerInvoice",
                    ref_no: "REF2024001234",
                    payload: "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPExpY2Vuc2VQZXJJbnZvaWNlIHhtbG5zPSJodHRwOi8vd3d3LmN1c3RvbXMuZ28udGgveG1sbnMvTGljZW5zZVBlckludm9pY2UiPgogICAgPEhlYWRlcj4KICAgICAgICA8UmVmZXJlbmNlTm8+UkVGMjAyNDAwMTIzNDwvUmVmZXJlbmNlTm8+CiAgICAgICAgPExpY2Vuc2VUeXBlPkltcG9ydDwvTGljZW5zZVR5cGU+CiAgICAgICAgPElzc3VlRGF0ZT4yMDI0LTEwLTE0PC9Jc3N1ZURhdGU+CiAgICAgICAgPEV4cGlyeURhdGU+MjAyNC0xMi0zMTwvRXhwaXJ5RGF0ZT4KICAgICAgICA8SW1wb3J0ZXJJRD4xMjM0NTY3ODkwMTIzPC9JbXBvcnRlcklEPgogICAgICAgIDxJbXBvcnRlck5hbWU+4Lij4Li04Lip4Lix4LiXIOC4leC4seC4p+C4reC4ouC5iOC4suC4hyDguIjguLPguIHguLHguJQ8L0ltcG9ydGVyTmFtZT4KICAgIDwvSGVhZGVyPgogICAgPEludm9pY2VEZXRhaWxzPgogICAgICAgIDxJbnZvaWNlTm8+SU5WLTIwMjQtMDAxPC9JbnZvaWNlTm8+CiAgICAgICAgPEludm9pY2VEYXRlPjIwMjQtMTAtMTA8L0ludm9pY2VEYXRlPgogICAgICAgIDxUb3RhbEFtb3VudD4xMDAwMDAwLjAwPC9Ub3RhbEFtb3VudD4KICAgICAgICA8Q3VycmVuY3k+VEhCPC9DdXJyZW5jeT4KICAgIDwvSW52b2ljZURldGFpbHM+CiAgICA8SXRlbXM+CiAgICAgICAgPEl0ZW0+CiAgICAgICAgICAgIDxQcm9kdWN0Q29kZT4xMjM0NTY3ODwvUHJvZHVjdENvZGU+CiAgICAgICAgICAgIDxQcm9kdWN0TmFtZT7guKrguLTguJnguITguYnguLLguJXguLHguKfguK3guKLguYjguLLguIc8L1Byb2R1Y3ROYW1lPgogICAgICAgICAgICA8UXVhbnRpdHk+MTAwPC9RdWFudGl0eT4KICAgICAgICAgICAgPFVuaXQ+UENTPC9Vbml0PgogICAgICAgICAgICA8VW5pdFByaWNlPjEwMDAwLjAwPC9Vbml0UHJpY2U+CiAgICAgICAgPC9JdGVtPgogICAgPC9JdGVtcz4KPC9MaWNlbnNlUGVySW52b2ljZT4="
                }
            }
        },
        {
            id: 'eb002',
            name: '(EB002) - EBMS CALLBACK API',
            baseUrl: `${apiBaseUrl}/api/ebms/callback`,
            description: 'EBMS CALLBACK API',
            requestBodyExample: {
                callback_url: "https://webhook.site/efe10a8b-ec08-4cef-9cf2-3f9493601efb",
                msg_id: "MSG20241014153044001",
                msg_ts: "2024-10-14T15:30:44",
                conversation_id: "CONV20241014001",
                refmsg_id: "REFMSG20241014001",
                from_id: "01234567890123456789012345678",
                to_id: "98765432109876543210987654321",
                service: "THNSW.THTCD.eLicense",
                action: "LicensePerInvoice",
                subject: "LicensePerInvoice Response",
                ref_no: "REF2024001234",
                payload: "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPExpY2Vuc2VQZXJJbnZvaWNlIHhtbG5zPSJodHRwOi8vd3d3LmN1c3RvbXMuZ28udGgveG1sbnMvTGljZW5zZVBlckludm9pY2UiPgogICAgPEhlYWRlcj4KICAgICAgICA8UmVmZXJlbmNlTm8+UkVGMjAyNDAwMTIzNDwvUmVmZXJlbmNlTm8+CiAgICAgICAgPExpY2Vuc2VUeXBlPkltcG9ydDwvTGljZW5zZVR5cGU+CiAgICAgICAgPElzc3VlRGF0ZT4yMDI0LTEwLTE0PC9Jc3N1ZURhdGU+CiAgICAgICAgPEV4cGlyeURhdGU+MjAyNC0xMi0zMTwvRXhwaXJ5RGF0ZT4KICAgICAgICA8SW1wb3J0ZXJJRD4xMjM0NTY3ODkwMTIzPC9JbXBvcnRlcklEPgogICAgICAgIDxJbXBvcnRlck5hbWU+4Lij4Li04Lip4Lix4LiXIOC4leC4seC4p+C4reC4ouC5iOC4suC4hyDguIjguLPguIHguLHguJQ8L0ltcG9ydGVyTmFtZT4KICAgIDwvSGVhZGVyPgogICAgPEludm9pY2VEZXRhaWxzPgogICAgICAgIDxJbnZvaWNlTm8+SU5WLTIwMjQtMDAxPC9JbnZvaWNlTm8+CiAgICAgICAgPEludm9pY2VEYXRlPjIwMjQtMTAtMTA8L0ludm9pY2VEYXRlPgogICAgICAgIDxUb3RhbEFtb3VudD4xMDAwMDAwLjAwPC9Ub3RhbEFtb3VudD4KICAgICAgICA8Q3VycmVuY3k+VEhCPC9DdXJyZW5jeT4KICAgIDwvSW52b2ljZURldGFpbHM+CiAgICA8SXRlbXM+CiAgICAgICAgPEl0ZW0+CiAgICAgICAgICAgIDxQcm9kdWN0Q29kZT4xMjM0NTY3ODwvUHJvZHVjdENvZGU+CiAgICAgICAgICAgIDxQcm9kdWN0TmFtZT7guKrguLTguJnguITguYnguLLguJXguLHguKfguK3guKLguYjguLLguIc8L1Byb2R1Y3ROYW1lPgogICAgICAgICAgICA8UXVhbnRpdHk+MTAwPC9RdWFudGl0eT4KICAgICAgICAgICAgPFVuaXQ+UENTPC9Vbml0PgogICAgICAgICAgICA8VW5pdFByaWNlPjEwMDAwLjAwPC9Vbml0UHJpY2U+CiAgICAgICAgPC9JdGVtPgogICAgPC9JdGVtcz4KPC9MaWNlbnNlUGVySW52b2ljZT4="
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
                method: 'POST',
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
                        API Tester (POST)
                    </h1>
                    <p className="text-gray-600 text-lg">
                        ทดสอบเรียก API Method POST พร้อม Request Body แบบ JSON
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
                                    POST {buildUrl()}
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
                                        POST {response.url}
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

export default ApiTesterPost;