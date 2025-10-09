# Simple Dockerfile สำหรับรัน Local เท่านั้น
FROM node:20-alpine

# ตั้ง working directory
WORKDIR /app

# คัดลอก package.json และ package-lock.json
COPY package*.json ./

# ติดตั้ง dependencies
RUN npm install

# คัดลอกโค้ดทั้งหมด
COPY . .

# สร้าง .env file สำหรับ development
RUN echo "VITE_API_BASE_URL=http://localhost:3001/api/v1" > .env.development && \
    echo "VITE_APP_ENV=development" >> .env.development && \
    echo "VITE_API_TIMEOUT=10000" >> .env.development && \
    echo "VITE_API_KEY=dev-api-key-12345" >> .env.development && \
    echo "VITE_DEBUG=true" >> .env.development && \
    echo "VITE_APP_TITLE=Tax ID Lookup - Local" >> .env.development && \
    echo "VITE_APP_VERSION=1.0.0" >> .env.development

# Expose port
EXPOSE 5173

# รัน dev server โดยไม่เปิดเบราว์เซอร์อัตโนมัติ
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--open", "false"]