# Vercel Deployment Checklist

## Pre-Deployment Checklist

### Local Testing
- [ ] Chạy `npm install` để cài đặt dependencies
- [ ] Chạy `npm run dev` để test local development
- [ ] Chạy `npm run build` để test production build
- [ ] Chạy `npm run preview` để xem production build locally
- [ ] Kiểm tra console không có lỗi
- [ ] Test tất cả features chính

### Configuration
- [ ] Cập nhật `VITE_API_URL` trong `.env.production` với URL backend thật
- [ ] Kiểm tra `vercel.json` configuration
- [ ] Kiểm tra `.gitignore` - không commit `.env.local`
- [ ] Commit tất cả changes lên Git

### Backend Preparation
- [ ] Backend API đã live và accessible
- [ ] CORS được cấu hình đúng (nếu frontend & backend khác domain)
- [ ] Kiểm tra API endpoints hoạt động bình thường
- [ ] Có API documentation sẵn

## Deployment Steps

### Step 1: Git Push
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```
- [ ] Changes đã push lên GitHub/GitLab/Bitbucket

### Step 2: Vercel Setup
- [ ] Đăng nhập Vercel (https://vercel.com)
- [ ] Click "Add New" > "Project"
- [ ] Import Git repository
- [ ] Chọn `frontend` folder nếu monorepo

### Step 3: Configure Build
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Framework: Vite (auto-detected)

### Step 4: Environment Variables
**Option A: Thêm thủ công**
- [ ] VITE_API_URL = `https://your-backend-api.com/api`
- [ ] VITE_APP_ENV = `production`

**Option B: Từ file**
- [ ] Upload `.env.production` (nếu cần)

### Step 5: Deploy
- [ ] Click "Deploy"
- [ ] Chờ build hoàn thành (3-5 phút)
- [ ] Kiểm tra build logs không có error

## Post-Deployment Testing

### 5 Minutes After Deploy
- [ ] ✓ Site accessible tại URL được cung cấp
- [ ] ✓ Trang load bình thường
- [ ] ✓ Keine Breaking Layout Issues

### 10 Minutes After Deploy
- [ ] ✓ Đăng nhập hoạt động
- [ ] ✓ API calls thành công (kiểm tra Network tab)
- [ ] ✓ Data hiển thị đúng
- [ ] ✓ Navigation hoạt động smooth

### 15 Minutes After Deploy
- [ ] ✓ Test responsive design (Mobile/Tablet/Desktop)
- [ ] ✓ Test major features
- [ ] ✓ Không có console errors
- [ ] ✓ Performance acceptable (< 3s first paint)

## Rollback Plan

Nếu có vấn đề:
- [ ] Xác minh lỗi từ Vercel logs
- [ ] Revert lần deploy trước (Vercel dashboard)
- [ ] Hoặc push code fix + redeploy
- [ ] Notify team về issue

## Future Deployments

Lần sau khi deploy:
1. Push code to `main` branch
2. Vercel tự động build & deploy
3. Chỉ cần verify site hoạt động

**Tip:** Vercel cũng tự động preview PR trước merge!

## Support

- Vercel Docs: https://vercel.com/docs
- Check logs: Vercel Dashboard > Deployments > See logs
- Build failed? Re-run build
- Contact: Vercel support team
