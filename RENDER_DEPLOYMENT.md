# 🚀 Hướng dẫn Deploy Backend lên Render

## Các bước setup

### 1. Chuẩn bị Render Account

1. Đăng ký tại https://render.com
2. Liên kết GitHub account của bạn
3. Có credit card (Render free tier sẽ ephemeral sau 15 min inactivity)

### 2. Thiết lập Render Deployment

#### Option A: Deploy từ render.yaml (Khuyến nghị)

File `render.yaml` đã được tạo sẵn. Render sẽ tự động đọc nó từ repository.

#### Option B: Deploy thủ công qua Dashboard

1. Vào https://dashboard.render.com
2. Click **New +** → **Web Service**
3. Chọn GitHub repository
4. Cấu hình:
   - **Name**: `gia-su-backend` (hoặc tên khác)
   - **Runtime**: `Docker`
   - **Build Command**: Để trống (Docker sẽ handle)
   - **Start Command**: Để trống (Dockerfile xử lý)

### 3. Thiết lập Environment Variables

Trên Render Dashboard, vào **Settings** → **Environment**:

```
APP_ENV=production
DISPLAY_ERRORS=0
LOG_ERRORS=1

# Database (lấy từ Render Database)
DB_HOST=<your-render-db-host>
DB_PORT=3306
DB_USER=<username>
DB_PASSWORD=<password>
DB_NAME=quanlytrungtamgiasu

# Email (SendGrid - recommended)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=SG.your-sendgrid-api-key

# JWT & Security
JWT_SECRET=<generate-long-random-string>
OTP_EXPIRY=300
```

### 4. Thiết lập Database

#### Option A: Sử dụng Render Managed Database

1. Trên Render Dashboard, click **New +** → **MySQL**
2. Cấu hình:
   - **Name**: `mysql-db`
   - **Database**: `quanlytrungtamgiasu`
   - **Username**: Render tự generate
3. Nhập database connection vào backend env vars

#### Option B: Sử dụng Database bên ngoài

- Cập nhật `DB_HOST`, `DB_USER`, `DB_PASSWORD` ở env vars
- Đảm bảo firewall cho phép Render service connect

### 5. Import Database Schema

Sau khi backend deploy thành công:

```bash
# Từ local machine
mysql -h <render-db-host> -u <username> -p<password> quanlytrungtamgiasu < database/quanlytrungtamgiasu_fixed.sql
```

### 6. Deploy

1. Render sẽ tự động detect `Dockerfile` ở root
2. Nhấn Deploy → Chờ build hoàn thành (~5-10 phút)
3. Kiểm tra logs ở tab **Logs**

## Troubleshooting

### ❌ Build Failed: "Dockerfile not found"

✅ Giải pháp:
- Đảm bảo `Dockerfile` nằm ở **root directory** (không trong `/backend`)
- Push lên GitHub
- Trigger redeploy trên Render Dashboard

### ❌ 500 Error: "Failed to connect to database"

✅ Giải pháp:
- Kiểm tra env vars có đúng không
- Verify database credentials
- Kiểm tra Database connection string format
- Mở database firewall:
  ```
  mysql -h <host> -u <user> -p
  GRANT ALL PRIVILEGES ON quanlytrungtamgiasu.* TO '<user>'@'%' IDENTIFIED BY '<password>';
  FLUSH PRIVILEGES;
  ```

### ❌ 502 Bad Gateway / Service Crashed

✅ Giải pháp:
- Xem logs: Dashboard → **Logs** tab
- Thường do:
  - PHP extension missing → thêm vào Dockerfile
  - Memory limit quá thấp
  - .env variables thiếu

### ❌ CORS Errors

✅ Giải pháp:
- Backend/index.php đã có CORS headers
- Kiểm tra frontend `.env` có đúng VITE_API_URL không
- Format: `https://your-backend.onrender.com`

## Performance Tips

1. **Disable Debug Mode**: `APP_ENV=production`, `DISPLAY_ERRORS=0`
2. **Use Starter/Standard Plan**: Free tier có downtime
3. **Optimize Database Queries**: Thêm indexes nếu cần
4. **Enable Caching**: Implement Redis nếu có traffic cao
5. **Monitor**: Xem logs thường xuyên để phát hiện issues

## Health Check

Backend có endpoint `/health-check.php` để test:

```bash
curl https://your-backend.onrender.com/health-check.php
```

Response: `{"status":"ok"}`

## Next Steps

- Connect frontend từ Vercel/Netlify
- Setup custom domain
- Backup database regularly
- Monitor error logs
