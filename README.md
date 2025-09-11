# Tax ID Lookup Application (Vite + React)

⚡ **เร็วกว่าที่เคย** - React application สำหรับค้นหาข้อมูลบริษัทจากรหัสนิติบุคคล ใช้ **Vite** สำหรับประสิทธิภาพสูงสุด

## 🚀 ความเร็วของ Vite

- **Dev server เริ่มใน 1-3 วินาที** (เทียบกับ CRA ที่ใช้ 30-60 วินาที)
- **Hot Module Replacement แบบทันที** - แก้โค้ดเห็นผลทันที
- **Build เร็วกว่า 5-10 เท่า** - production build ใน 10-20 วินาที
- **Bundle size เล็กกว่า** - โหลดเร็วกว่า

## ✨ คุณสมบัติหลัก

- 🔍 **ค้นหาข้อมูลบริษัท**: รหัสนิติบุคคล 13 หลัก พร้อม validation
- 🌍 **Environment Management**: แยก config สำหรับ Dev และ Prod
- 📱 **Responsive Design**: รองรับทุกหน้าจออุปกรณ์
- 🧪 **Mock Data**: ข้อมูลทดสอบครบครัน
- 📋 **Copy to Clipboard**: คัดลอกข้อมูลได้ทุกฟิลด์
- ⚡ **Real-time Validation**: ตรวจสอบความถูกต้องแบบทันที
- 🛡️ **Error Handling**: จัดการ error ครอบคลุม

## 🛠️ การติดตั้งและใช้งาน

### 1. สร้าง Project ใหม่

```bash
# สร้าง Vite + React project
npm create vite@latest taxid-lookup-vite -- --template react
cd taxid-lookup-vite

# ติดตั้ง dependencies
npm install
npm install axios lucide-react

# สร้างโฟลเดอร์ที่จำเป็น
mkdir -p src/components src/services
```

### 2. คัดลอกไฟล์

คัดลอกไฟล์ทั้งหมดจาก artifacts:

```
📁 Project Structure:
├── vite.config.js          # Vite configuration
├── .env.development         # Dev environment variables
├── .env.production          # Prod environment variables
├── src/
│   ├── main.jsx            # Entry point (Vite style)
│   ├── App.jsx             # Main App component
│   ├── App.css             # Styles
│   ├── index.css           # Global styles
│   ├── components/
│   │   └── TaxIdLookup.jsx # Main component
│   └── services/
│       └── apiService.js   # API service
├── package.json            # Dependencies
└── README.md              # Documentation
```

### 3. Environment Variables

**⚠️ สำคัญ:** Vite ใช้ `VITE_` prefix แทน `REACT_APP_`

#### `.env.development`
```bash
VITE_API_BASE_URL=https://dev-api.example.com/api/v1
VITE_APP_ENV=development
VITE_API_TIMEOUT=10000
VITE_API_KEY=dev-api-key-12345
VITE_DEBUG=true
VITE_APP_TITLE=Tax ID Lookup - Development
VITE_APP_VERSION=1.0.0
```

#### `.env.production`
```bash
VITE_API_BASE_URL=https://api.example.com/api/v1
VITE_APP_ENV=production
VITE_API_TIMEOUT=5000
VITE_API_KEY=prod-api-key-67890
VITE_DEBUG=false
VITE_APP_TITLE=Tax ID Lookup
VITE_APP_VERSION=1.0.0
```

## 🚀 คำสั่งการใช้งาน

### Development (เร็วมาก!)

```bash
# รัน dev server (เริ่มใน 1-3 วินาที)
npm run dev

# รัน dev server พร้อม debug
npm run dev:debug
```

### Production

```bash
# Build สำหรับ production (เร็วมาก!)
npm run build:prod

# Preview production build
npm run preview

# Build สำหรับ development
npm run build:dev
```

### อื่นๆ

```bash
# Lint code
npm run lint
npm run lint:fix

# ลบ cache และ build files
npm run clean

# วิเคราะห์ bundle size
npm run analyze
```

## 🆚 เปรียบเทียบ Vite vs Create React App

| คุณสมบัติ | **Vite** | **Create React App** |
|---|---|---|
| **เริ่มต้น dev server** | ⚡ 1-3 วินาที | 🐌 30-60 วินาที |
| **Hot reload** | ⚡ ทันที (แค่ส่วนที่เปลี่ยน) | 🐌 ช้า (รีโหลดทั้งหน้า) |
| **Build time** | ⚡ 10-20 วินาที | 🐌 1-5 นาที |
| **Bundle size** | 📦 เล็กกว่า | 📦 ใหญ่กว่า |
| **Configuration** | ⚙️ แก้ไขง่าย | ⚙️ ซ่อนไว้ (ต้อง eject) |
| **ES Modules** | ✅ Native support | ❌ ผ่าน polyfill |
| **Tree shaking** | ✅ ดีกว่า | ✅ พื้นฐาน |

## 📋 ข้อมูลทดสอบ

### รหัสนิติบุคคลสำหรับทดสอบ:

| รหัสนิติบุคคล | ชื่อบริษัท | สถานะ | หมายเหตุ |
|---|---|---|---|
| `012-34-56789-12-3` | บริษัท ตัวอย่าง จำกัด | ✅ ดำเนินกิจการ | บริษัททั่วไป |
| `987-65-43210-98-7` | บริษัท ทดสอบ จำกัด (มหาชน) | ✅ ดำเนินกิจการ | บริษัทมหาชน |
| `111-11-11111-11-1` | บริษัท ปิดกิจการแล้ว จำกัด | ❌ ปิดกิจการ | บริษัทปิด |
| `555-55-55555-55-5` | บริษัท สตาร์ทอัพ เทค จำกัด | ✅ ดำเนินกิจการ | สตาร์ทอัพ |

## 🔧 การปรับแต่ง

### เพิ่ม Environment ใหม่

1. สร้างไฟล์ `.env.staging`
2. เพิ่ม script ใน `package.json`
3. ปรับ `vite.config.js`

### เชื่อมต่อ API จริง

1. แก้ไข `VITE_API_BASE_URL` ใน `.env`
2. ใส่ `VITE_API_KEY` ที่ถูกต้อง
3. ปิด Mock data ใน `apiService.js`

### Vite Plugins ที่แนะนำ

```bash
# PWA support
npm install vite-plugin-pwa

# Bundle analyzer
npm install vite-bundle-analyzer

# Environment variables validation
npm install @vitejs/plugin-react-swc
```

## 🚀 Deployment

### Vercel (แนะนำ)

```bash
npm install -g vercel
vercel --prod
```

### Netlify

```bash
npm run build:prod
# อัปโหลด dist/ folder
```

### Traditional Hosting

```bash
npm run build:prod
# อัปโหลด dist/ folder ไปยัง web server
```

## 🐛 การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

1. **Environment variables ไม่ทำงาน**
   - ตรวจสอบใช้ `VITE_` prefix
   - ใช้ `import.meta.env` แทน `process.env`

2. **Hot reload ไม่ทำงาน**
   - ตรวจสอบ firewall
   - ใช้ `--host` flag

3. **Build ช้า**
   - ลบ `node_modules/.vite` cache
   - อัปเดต Vite เป็นเวอร์ชันล่าสุด

### Debug Mode

เปิด Debug โดยตั้งค่า `VITE_DEBUG=true`:
- API Request/Response logs  
- Environment configuration
- Error details
- Performance metrics

## 📊 Performance Tips

- ใช้ `npm run dev` สำหรับ development
- ใช้ `npm run preview` เพื่อทดสอบ production build
- เปิด `sourcemap: false` ใน production
- ใช้ dynamic imports สำหรับ code splitting

## 🎯 Production Best Practices

```javascript
// vite.config.js optimizations
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['axios', 'lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
})
```

## 📝 License

MIT License - ใช้งานได้อย่างเสรี

---

**🎉 สนุกกับการพัฒนาที่เร็วกว่าเดิมด้วย Vite!** ⚡