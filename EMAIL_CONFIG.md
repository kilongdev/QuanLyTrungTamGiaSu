# 📧 Email & Production Configuration

## 🎯 TL;DR - Nhanh chóng

```bash
# 1. Install dependencies
npm install  # Tự động cài PHPMailer

# 2. Setup email
cd backend
cp .env.example .env
# Sửa SMTP_USERNAME và SMTP_PASSWORD trong .env

# 3. Test
php test-email.php
```

## ⚠️ Quan trọng khi DEPLOY ONLINE

### ❌ **ĐỪNG dùng Gmail cá nhân cho production!**

**Lý do:**
- Gmail giới hạn **500 email/ngày** → Hệ thống sẽ bị ngưng
- Dễ bị Google suspend account
- Password bị hardcode → Security risk
- Không professional

### ✅ **Nên dùng:**

| Service | Free Tier | Tốt nhất cho |
|---------|-----------|--------------|
| **SendGrid** | 100 emails/day | Startup |
| **Mailgun** | 5,000 emails/month | SMB |
| **Amazon SES** | 62,000/month | Scale lớn |
| **SMTP2GO** | 1,000/month | Testing |

## 🚀 Setup cho Production

### Bước 1: Đăng ký email service (VD: SendGrid)

1. Tạo tài khoản: https://sendgrid.com/
2. Verify domain của bạn
3. Tạo API Key → Copy

### Bước 2: Cập nhật .env

```env
# Production Email Config
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=SG.xxxxxxxxxxxxx
SMTP_FROM_EMAIL=noreply@yourdomain.com
SMTP_FROM_NAME=Trung Tâm Gia Sư

# QUAN TRỌNG!
APP_ENV=production
```

### Bước 3: Upload lên server

```bash
# Clone repo
git clone https://github.com/your-repo.git

# Install & setup
npm install  # Auto-install PHPMailer

# Tạo .env từ template
cd backend
cp .env.example .env
nano .env  # Nhập credentials thật
```

### Bước 4: Kiểm tra health

```bash
# Test health check
curl https://yourdomain.com/backend/public/health-check.php
```

Response mong muốn:
```json
{
  "status": "healthy",
  "checks": {
    "phpmailer": {"status": "ok"},
    "smtp_config": {"status": "ok"}
  }
}
```

## 🔒 Security Checklist

- ✅ File `.env` **KHÔNG** được commit lên Git
- ✅ File `.env.example` chỉ chứa placeholder
- ✅ Dùng HTTPS (Let's Encrypt)
- ✅ Block truy cập `.env` từ web:

```apache
# .htaccess
<Files .env>
    Order allow,deny
    Deny from all
</Files>
```

## 🐛 Troubleshooting Production

### Email không gửi được

```bash
# 1. Check config
grep SMTP backend/.env

# 2. Test SMTP connection
telnet smtp.sendgrid.net 587

# 3. Check logs
tail -f backend/logs/email-error.log

# 4. Test direct
cd backend
php test-email.php
```

### PHPMailer not found

```bash
# Re-install
rm -rf backend/vendor
npm run setup
```

### Email vào Spam

**Giải pháp:**

1. **SPF Record** (DNS):
```
TXT @ "v=spf1 include:sendgrid.net ~all"
```

2. **DKIM** - SendGrid tự động setup

3. **DMARC** (DNS):
```
TXT _dmarc "v=DMARC1; p=none; rua=mailto:admin@yourdomain.com"
```

## 📊 Monitoring

### Check server health

```bash
# Endpoint
https://yourdomain.com/backend/public/health-check.php

# Should return:
{
  "status": "healthy",
  "timestamp": "2026-03-06 10:30:00",
  "checks": {
    "php": {"status": "ok"},
    "env_file": {"status": "ok"},
    "phpmailer": {"status": "ok"},
    "smtp_config": {"status": "ok"}
  }
}
```

### Monitor logs

```bash
# Email errors
tail -f backend/logs/email-error.log

# PHP errors
tail -f /var/log/apache2/error.log
```

## 📚 Chi tiết hơn

- 📖 [DEPLOYMENT.md](DEPLOYMENT.md) - Hướng dẫn deploy đầy đủ
- 📖 [PHPMAILER_SETUP.md](PHPMAILER_SETUP.md) - Setup PHPMailer local

## 💡 Tips

### Development vs Production

**Development (.env):**
```env
APP_ENV=development
SMTP_HOST=smtp.gmail.com
SMTP_USERNAME=test@gmail.com
SMTP_PASSWORD=test-password
```

**Production (.env):**
```env
APP_ENV=production
SMTP_HOST=smtp.sendgrid.net
SMTP_USERNAME=apikey
SMTP_PASSWORD=SG.real-api-key
```

### Rate Limiting

Implement rate limiting để tránh spam:

```php
// app/middleware/RateLimitMiddleware.php
// Giới hạn 5 OTP / 1 giờ / 1 email
```

### Backup .env

```bash
# Trước khi deploy
cp backend/.env backend/.env.backup
chmod 600 backend/.env.backup
```

## 🆘 Support

Gặp vấn đề? Check:
1. [DEPLOYMENT.md](DEPLOYMENT.md) - Deploy guide
2. [Issues](https://github.com/your-repo/issues)
3. Email: support@yourdomain.com
