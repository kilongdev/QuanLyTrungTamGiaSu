# Hướng Dẫn Deploy Frontend lên Vercel

## Bước 1: Chuẩn Bị
- Đã có tài khoản Vercel (đăng ký tại https://vercel.com)
- Có Git repository (GitHub, GitLab, hoặc Bitbucket)
- Code đã push lên Git repository

## Bước 2: Cấu Hình Backend API
Trước khi deploy, cập nhật URL backend trong các file:

### 2.1 File `.env.production` (frontend/.env.production)
```
VITE_API_URL=https://your-backend-url.com/api
VITE_APP_ENV=production
```

### 2.2 Hoặc cấu hình trực tiếp trên Vercel Dashboard
Xem hướng dẫn ở **Bước 4** phần "Environment Variables"

## Bước 3: Các File Cấu Hình Đã Tạo

### vercel.json - Cấu hình Vercel
- `buildCommand`: Lệnh build dự án (`npm run build`)
- `outputDirectory`: Thư mục output (`dist`)
- `framework`: Framework sử dụng (`vite`)
- `rewrites`: Chuyển hướng tất cả route về index.html (SPA)
- `headers`: Cấu hình cache cho assets (tối ưu hóa tốc độ)

### .env.production - Biến môi trường sản xuất
```
VITE_API_URL=https://your-backend-api.com/api
VITE_APP_ENV=production
```

### .env.local - (Tùy chọn) Biến môi trường local
```
VITE_API_URL=http://localhost/QuanLyTrungTamGiaSu/backend/public
VITE_APP_ENV=development
```

## Bước 4: Deploy lên Vercel

### Cách 1: Qua Web Dashboard
1. Truy cập https://vercel.com/dashboard
2. Click "Add New..." > "Project"
3. Chọn Git repository của bạn
4. Trong "Import Project":
   - **PROJECT NAME**: Đặt tên dự án
   - **ROOT DIRECTORY**: `frontend` (nếu monorepo)
   - **BUILD COMMAND**: `npm run build` (tự động nhận diện)
   - **OUTPUT DIRECTORY**: `dist` (tự động nhận diện)

### Cách 2: Cấu Hình Environment Variables
Trong Vercel Dashboard:
1. Vào **Settings** > **Environment Variables**
2. Thêm biến:
   ```
   Name: VITE_API_URL
   Value: https://your-backend-api.com/api
   ```
3. Chọn Environment: Production, Preview, Development (tuỳ theo nhu cầu)
4. Click "Save"

### Cách 3: Deploy qua CLI (Tuỳ chọn)
```bash
# Cài đặt Vercel CLI
npm install -g vercel

# Đứng trong thư mục frontend
cd frontend

# Deploy
vercel

# Deploy production
vercel --prod
```

## Bước 5: Xác Minh Deployment

### Kiểm tra Build Log
- Trong Vercel Dashboard, chọn project
- Tab "Builds" để xem chi tiết build process
- Xem "Function Logs" để debug lỗi

### Kiểm tra Live Site
- Truy cập URL được cung cấp: `https://your-project.vercel.app`
- Kiểm tra:
  - ✓ Trang tải bình thường
  - ✓ Không có lỗi console
  - ✓ API calls hoạt động (kiểm tra Network tab)
  - ✓ Responsive design trên mobile

## Bước 6: Cấu Hình Domain (Tuỳ chọn)

1. Mua domain tại: Namecheap, GoDaddy, hoặc Domain Registrar khác
2. Trong Vercel Dashboard:
   - Project Settings > Domains
   - Click "Add Domain"
   - Nhập domain name
   - Thực hiện theo hướng dẫn cấu hình DNS

## Bước 7: CORS Configuration (Nếu Cần)

Nếu backend và frontend ở domain khác nhau, cần cấu hình CORS trên backend:

```php
// Trong Backend API
header('Access-Control-Allow-Origin: https://your-project.vercel.app');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
```

## Bước 8: Monitoring & Logging

### Xem Logs Real-time
```bash
vercel logs
```

### Cấu Hình Analytics (Tuỳ chọn)
- Vercel tự động cung cấp Web Analytics
- Xem trong tab "Analytics" của project

## Troubleshooting

### Build Failed
- Kiểm tra `npm run build` chạy successful trên local
- Xem Vercel build logs chi tiết
- Thường do: Missing dependencies, Node version không tương thích

### API Calls Failed
- Kiểm tra `VITE_API_URL` đúng chưa
- Xoá `.env.production` nếu cấu hình via Vercel Dashboard
- Kiểm tra CORS configuration trên backend

### Blank Page sau Deploy
- Kiểm tra Network tab, có lỗi 404 không?
- Kiểm tra build output (`dist` folder)
- Vercel `rewrites` configuration trong `vercel.json`

### Node Module Issues
- Clear cache Vercel: Settings > Git > Redeploy
- Xoá `node_modules` và `package-lock.json` trên local, rebuild

## Environment Variables Reference

| Variable | Local | Production | Khi Cần |
|----------|-------|-----------|---------|
| `VITE_API_URL` | `http://localhost/.../backend/public` | `https://api.yourdomain.com` | Luôn có |
| `VITE_APP_ENV` | `development` | `production` | Tuỳ chọn |

## Tip & Best Practices

1. **Git Workflow**
   - Tạo branch `develop` cho development
   - Pull Request trước khi merge `main`
   - Vercel tự động preview trên PR

2. **Performance**
   - Cấu hình caching trong `vercel.json` đã tối ưu
   - Vercel CDN tự động phân phối toàn cầu

3. **Security**
   - Không commit `.env.local`
   - Cấu hình Environment Variables trên Vercel Dashboard
   - `.gitignore` đã có `.env.local`

4. **Development**
   - Thường xuyên pull lại config
   - Test locally trước khi push
   - Sử dụng `npm run preview` để test production build

## Liên Hệ & Support

- Vercel Docs: https://vercel.com/docs
- Vite Docs: https://vitejs.dev/
