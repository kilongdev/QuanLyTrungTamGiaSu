# 🚀 Production Deployment Guide

## Checklist trước khi deploy

### 1. Email Configuration

#### ⚠️ **QUAN TRỌNG: Không dùng Gmail cá nhân cho production!**

**Tại sao?**
- Gmail giới hạn 500 email/ngày
- Dễ bị block/suspend account
- Không professional
- Security risk (credentials bị expose)

**Nên dùng gì?**
| Service | Free Tier | Recommended For |
|---------|-----------|-----------------|
| **SendGrid** | 100 emails/day | Startup, SMB |
| **Mailgun** | 5,000 emails/month | Small projects |
| **Amazon SES** | 62,000 emails/month (với EC2) | Scalable apps |
| **SMTP2GO** | 1,000 emails/month | Testing |

#### Setup với SendGrid (Khuyến nghị)

1. Đăng ký tại: https://sendgrid.com/
2. Verify domain của bạn
3. Tạo API Key
4. Cập nhật `.env`:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=SG.your-api-key-here
SMTP_FROM_EMAIL=noreply@yourdomain.com
SMTP_FROM_NAME=Trung Tâm Gia Sư
APP_ENV=production
```

### 2. Setup trên Server

#### A. Upload code lên server

```bash
# Via Git (Recommended)
git clone https://github.com/your-repo.git
cd QuanLyTrungTamGiaSu

# Install dependencies
npm install  # Tự động cài PHPMailer
cd frontend && npm install
```

#### B. Tạo file .env

```bash
cd backend
cp .env.example .env
nano .env  # Hoặc vim/editor khác
```

Cập nhật thông tin:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=your-actual-api-key
SMTP_FROM_EMAIL=noreply@yourdomain.com
SMTP_FROM_NAME=Trung Tâm Gia Sư
APP_ENV=production

DB_HOST=localhost
DB_NAME=quanlytrungtamgiasu
DB_USER=db_username
DB_PASS=strong_password_here
```

#### C. Set file permissions

```bash
# Backend
chmod 644 backend/.env
chmod 755 backend/public
chmod 755 backend/vendor

# Logs (nếu có)
mkdir -p backend/logs
chmod 777 backend/logs
```

### 3. Apache/Nginx Configuration

#### Apache (.htaccess)

File `backend/public/.htaccess`:
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ index.php/$1 [L,QSA]
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Prevent .env access
<Files .env>
    Order allow,deny
    Deny from all
</Files>
```

#### Nginx

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/QuanLyTrungTamGiaSu/backend/public;
    index index.php;

    # Prevent .env access
    location ~ /\.env {
        deny all;
        return 404;
    }

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

### 4. Firewall & Security

#### Mở ports cần thiết:
```bash
# SMTP (SendGrid/Mailgun)
sudo ufw allow 587/tcp

# HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

#### Block direct .env access:
```bash
# Đã có trong .htaccess/nginx config
# Test: curl https://yourdomain.com/backend/.env
# Phải trả về 403/404
```

### 5. Test trên Production

#### A. Test email sending

```bash
cd backend
php test-email.php
```

Kiểm tra:
- ✅ Email gửi thành công
- ✅ Không có error logs
- ✅ Email không vào spam

#### B. Test OTP API

```bash
curl -X POST https://yourdomain.com/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

Response mong đợi:
```json
{
  "status": "success",
  "message": "Đã gửi mã OTP đến email của bạn",
  "data": {
    "token": "eyJ0eXAi..."
  }
}
```

### 6. Monitoring & Logs

#### Setup error logging:

File `backend/app/core/ErrorHandler.php`:
```php
<?php
class ErrorHandler {
    public static function init() {
        if (Env::isProduction()) {
            ini_set('display_errors', 0);
            ini_set('log_errors', 1);
            ini_set('error_log', __DIR__ . '/../../logs/php-error.log');
        }
    }
}
ErrorHandler::init();
```

#### Monitor email failures:

```bash
# Check email logs
tail -f backend/logs/email-error.log

# Check PHP errors
tail -f backend/logs/php-error.log
```

### 7. Performance Optimization

#### Enable OPcache (php.ini):
```ini
opcache.enable=1
opcache.memory_consumption=128
opcache.max_accelerated_files=10000
opcache.revalidate_freq=2
```

#### Enable gzip compression (.htaccess):
```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>
```

## Common Issues & Solutions

### ❌ Email không gửi được

**Kiểm tra:**
```bash
# 1. Test SMTP connection
telnet smtp.sendgrid.net 587

# 2. Check credentials
grep SMTP_ backend/.env

# 3. Check logs
tail -50 backend/logs/email-error.log
```

**Giải pháp:**
- Verify API key vẫn còn hiệu lực
- Kiểm tra domain đã verify chưa
- Check firewall có block port 587 không

### ❌ "Class 'PHPMailer' not found"

```bash
# Re-install PHPMailer
cd backend
rm -rf vendor
cd ..
npm run setup
```

### ❌ Rate limit exceeded

**Gmail:** 500 emails/day
**SendGrid Free:** 100 emails/day

**Giải pháp:**
- Upgrade plan
- Dùng service khác
- Implement queue system

### ❌ Emails vào spam

**Giải pháp:**
1. Setup SPF record:
   ```
   TXT @ "v=spf1 include:sendgrid.net ~all"
   ```

2. Setup DKIM (SendGrid tự động)

3. Setup DMARC:
   ```
   TXT _dmarc "v=DMARC1; p=none; rua=mailto:admin@yourdomain.com"
   ```

## Security Best Practices

- ✅ **KHÔNG** commit file `.env`
- ✅ Dùng HTTPS (Let's Encrypt)
- ✅ Regular security updates
- ✅ Rate limiting trên API
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ XSS protection

## Backup & Recovery

```bash
# Backup .env
cp backend/.env backend/.env.backup

# Backup database
mysqldump -u user -p quanlytrungtamgiasu > backup.sql

# Restore
mysql -u user -p quanlytrungtamgiasu < backup.sql
```

## Support

- 📧 Email: support@yourdomain.com
- 📚 Docs: https://yourdomain.com/docs
- 🐛 Issues: https://github.com/your-repo/issues
