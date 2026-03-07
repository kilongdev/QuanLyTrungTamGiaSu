# PHPMailer Automatic Setup Guide

## Cách sử dụng

### Option 1: Automatic Setup (Khuyến nghị)
```bash
npm install
```
- Script sẽ tự động chạy **postinstall hook**
- PHPMailer sẽ được download và cài đặt tự động

### Option 2: Manual Setup
```bash
npm run setup
```

## Kiểm tra cài đặt

Sau khi chạy `npm install`, kiểm tra xem PHPMailer đã được cài đặt:

```bash
# Windows
Test-Path "backend/vendor/phpmailer/phpmailer/src/PHPMailer.php"

# Linux/Mac
test -f "backend/vendor/phpmailer/phpmailer/src/PHPMailer.php" && echo "OK"
```

## Cấu hình Email

1. Mở file: `backend/app/services/EmailService.php`
2. Cập nhật SMTP credentials:
   ```php
   private static $smtpHost = 'smtp.gmail.com';
   private static $smtpUsername = 'your-email@gmail.com';
   private static $smtpPassword = 'your-app-password';
   private static $fromEmail = 'your-email@gmail.com';
   ```

3. Lấy **Gmail App Password**:
   - Tại https://myaccount.google.com/apppasswords
   - Chọn Mail và Windows Computer
   - Copy password vào `smtpPassword`

## Test Email

Sau khi cài đặt PHPMailer:

```bash
cd backend
php test-email.php
```

Nếu thành công, bạn sẽ thấy:
```
✓ Email sent successfully!
```

## Troubleshooting

### ❌ "PHPMailer not found"
- Chạy: `npm run setup`
- Hoặc chạy: `npm install` lại

### ❌ "Email không gửi được"
1. Kiểm tra SMTP credentials trong `EmailService.php`
2. Kiểm tra App Password vẫn còn hiệu lực
3. Kiểm tra kết nối internet
4. Kiểm tra error logs: `C:\xampp\apache\logs\error.log`

### ❌ "Script không chạy trên Windows"
- Mở PowerShell as Administrator
- Chạy: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
- Thử lại: `npm install`

## File Structure

```
├── backend/
│   ├── vendor/
│   │   ├── phpmailer/
│   │   │   └── phpmailer/
│   │   │       ├── src/
│   │   │       │   ├── PHPMailer.php
│   │   │       │   ├── SMTP.php
│   │   │       │   └── ...
│   │   │       └── ...
│   │   └── autoload.php
│   └── app/
│       └── services/
│           └── EmailService.php
├── scripts/
│   └── setup-phpmailer.js
└── package.json
```

## Notes

- ✅ Chỉ cài đặt **một lần** khi `npm install`
- ✅ Không cần cài Composer riêng
- ✅ Hoạt động trên Windows, Linux, Mac
- ✅ OTP sẽ được gửi tự động qua email
