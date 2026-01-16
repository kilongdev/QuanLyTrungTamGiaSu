# GitHub Repository Description

**Tiếng Việt:**
Hệ thống quản lý trung tâm gia sư toàn diện với 3 vai trò chính (Admin, Gia sư, Phụ huynh). Tính năng: đăng ký tài khoản, quản lý lớp học, điểm danh tự động, tính học phí/lương, nhắn tin realtime, đánh giá gia sư và báo cáo doanh thu chi tiết.

**English:**
Comprehensive tutoring center management system with 3 main roles (Admin, Tutor, Parent). Features: account registration, class management, automatic attendance tracking, tuition/salary calculation, real-time messaging, tutor ratings, and detailed revenue reporting.

---

# 🎓 Hệ Thống Quản Lý Trung Tâm Gia Sư

Hệ thống web quản lý toàn diện cho trung tâm gia sư, hỗ trợ kết nối giữa gia sư, phụ huynh và quản lý trung tâm một cách hiệu quả và chuyên nghiệp.

## 📋 Mục Lục

- [Tổng Quan](#-tổng-quan)
- [Tính Năng Chính](#-tính-năng-chính)
- [Kiến Trúc Hệ Thống](#-kiến-trúc-hệ-thống)
- [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
- [Cài Đặt](#-cài-đặt)
- [Sử Dụng](#-sử-dụng)
- [Quy Trình Nghiệp Vụ](#-quy-trình-nghiệp-vụ)
- [Cấu Trúc Database](#-cấu-trúc-database)
- [Đóng Góp](#-đóng-góp)
- [License](#-license)

## 🌟 Tổng Quan

Hệ thống Quản Lý Trung Tâm Gia Sư được phát triển nhằm giải quyết các vấn đề trong việc quản lý lớp học kèm, kết nối gia sư với phụ huynh, theo dõi tiến độ học tập và xử lý các giao dịch tài chính một cách tự động và minh bạch.

### 🎯 Mục Tiêu

- Tự động hóa quy trình đăng ký và quản lý tài khoản
- Kết nối nhanh chóng giữa gia sư phù hợp với nhu cầu phụ huynh
- Theo dõi chi tiết quá trình học tập và điểm danh
- Tính toán tự động học phí và lương gia sư
- Tạo báo cáo doanh thu và phân tích hiệu quả hoạt động

### 👥 Đối Tượng Sử Dụng

1. **Quản Lý (Admin)** - Điều phối toàn bộ hệ thống
2. **Gia Sư** - Người trực tiếp giảng dạy
3. **Phụ Huynh** - Người quản lý học sinh và theo dõi học tập

## ✨ Tính Năng Chính

### 🔐 Quản Lý Tài Khoản

- Đăng ký tài khoản với xác thực qua email
- Phê duyệt tài khoản bởi Admin
- Quản lý hồ sơ cá nhân và chuyên môn
- Phân quyền chi tiết theo vai trò

### 📚 Quản Lý Lớp Học

- Tạo lớp học với thông tin chi tiết (môn học, khối lớp, giá cả)
- Cấu hình linh hoạt số lượng học sinh (1-1 hoặc nhóm)
- Quản lý lịch giảng dạy theo ngày/tuần/tháng
- Theo dõi trạng thái lớp học realtime

### 📝 Hệ Thống Điểm Danh

- Điểm danh chi tiết cho từng buổi học
- Các trạng thái: Có mặt, Vắng, Vắng có phép
- Ghi chú và nhận xét cho từng học sinh
- Báo cáo tỷ lệ tham gia tự động

### 💰 Quản Lý Tài Chính

- **Học phí:**
  - Tính tự động dựa trên số buổi học thực tế
  - Hỗ trợ thanh toán theo tháng hoặc toàn khóa
  - Lịch sử giao dịch chi tiết

- **Lương gia sư:**
  - Hai hình thức: Theo phần trăm hoặc cố định
  - Tính toán tự động dựa trên điểm danh
  - Quản lý chu kỳ thanh toán linh hoạt

### 📊 Báo Cáo & Phân Tích

- Báo cáo doanh thu theo tháng/quý/năm
- Phân tích chi tiết theo từng lớp học
- Thống kê số lượng học sinh và gia sư
- Đánh giá hiệu quả hoạt động trung tâm

### 💬 Giao Tiếp & Thông Báo

- Hệ thống thông báo tự động
- Nhắn tin trực tiếp giữa phụ huynh và gia sư
- Theo dõi trạng thái đã đọc/chưa đọc
- Lưu trữ lịch sử trao đổi

### ⭐ Đánh Giá Gia Sư

- Phụ huynh đánh giá sau khi kết thúc khóa học
- Thang điểm 1-5 sao với nhận xét chi tiết
- Hiển thị điểm trung bình trên hồ sơ gia sư
- Hỗ trợ phụ huynh lựa chọn gia sư phù hợp

### 🔄 Quản Lý Yêu Cầu

- Yêu cầu mở lớp học mới từ phụ huynh hoặc gia sư
- Yêu cầu hủy đăng ký lớp học
- Yêu cầu nghỉ dạy của gia sư
- Quy trình phê duyệt rõ ràng và minh bạch

## 🏗️ Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────┐
│      Frontend (React + Vite)           │
│  - Admin Dashboard                      │
│  - Tutor Portal                         │
│  - Parent Portal                        │
│  - Tailwind CSS Styling                 │
└──────────────┬──────────────────────────┘
               │
               │ REST API (AJAX/Fetch)
               │
┌──────────────▼──────────────────────────┐
│         Backend (PHP)                   │
│  - Authentication & Authorization       │
│  - Business Logic                       │
│  - API Endpoints                        │
│  - Session Management                   │
└──────────────┬──────────────────────────┘
               │
               │
┌──────────────▼──────────────────────────┐
│         Database (MySQL)                │
│  - User Management                      │
│  - Class & Schedule                     │
│  - Financial Records                    │
│  - Messaging & Notifications            │
└─────────────────────────────────────────┘
```

## 🛠️ Công Nghệ Sử Dụng

### Frontend
- **React** (via Vite) - UI Framework với build tool nhanh
- **Vite** - Build tool và development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Navigation
- **Axios** - HTTP Client

### Backend
- **PHP** - Server-side scripting
- **Vanilla JavaScript** - Client-side scripting
- **Apache/Nginx** - Web server

### Database
- **MySQL** - Relational database
- **phpMyAdmin** - Database management

### DevOps & Tools
- **Git** - Version control
- **Composer** - PHP dependency manager
- **npm/yarn** - JavaScript package manager

## 📦 Cài Đặt

### Yêu Cầu Hệ Thống

- Node.js >= 18.x (cho Vite)
- npm >= 9.x hoặc yarn >= 1.22.x
- PHP >= 8.0
- MySQL >= 8.0
- Apache/Nginx web server
- Composer (PHP package manager)
- Git

### Các Bước Cài Đặt

1. **Clone repository:**
```bash
git clone https://github.com/yourusername/tutoring-center-management.git
cd tutoring-center-management
```

2. **Cài đặt Backend (PHP):**
```bash
cd backend
composer install
```

3. **Cấu hình Backend:**
```bash
# Copy file config mẫu
cp config/config.example.php config/config.php
```

Chỉnh sửa file `config/config.php`:
```php
<?php
define('DB_HOST', 'localhost');
define('DB_NAME', 'tutoring_db');
define('DB_USER', 'root');
define('DB_PASS', 'your_password');

define('JWT_SECRET', 'your_secret_key');
define('JWT_EXPIRE', 86400 * 7); // 7 days

define('MAIL_HOST', 'smtp.gmail.com');
define('MAIL_PORT', 587);
define('MAIL_USER', 'your_email@gmail.com');
define('MAIL_PASS', 'your_password');
?>
```

4. **Khởi tạo database:**
```bash
# Import SQL file
mysql -u root -p tutoring_db < database/schema.sql
mysql -u root -p tutoring_db < database/seed.sql
```

5. **Cài đặt Frontend (React + Vite):**
```bash
cd frontend
npm install
```

6. **Cấu hình Frontend:**
```bash
# Copy file environment mẫu
cp .env.example .env
```

Chỉnh sửa file `.env`:
```env
VITE_API_URL=http://localhost/tutoring-center-management/backend/api
VITE_APP_NAME=Tutoring Center Management
```

7. **Cấu hình Web Server:**

**Cho Apache (.htaccess trong thư mục backend):**
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/(.*)$ api/index.php [L,QSA]

# CORS headers
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header set Access-Control-Allow-Headers "Content-Type, Authorization"
```

**Cho Nginx (trong server block):**
```nginx
location /api {
    try_files $uri $uri/ /api/index.php?$query_string;
    
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
    add_header Access-Control-Allow-Headers "Content-Type, Authorization";
}

location ~ \.php$ {
    fastcgi_pass unix:/var/run/php/php8.0-fpm.sock;
    fastcgi_index index.php;
    include fastcgi_params;
}
```

8. **Chạy ứng dụng:**

```bash
# Frontend (development mode)
cd frontend
npm run dev

# Backend đã được serve bởi Apache/Nginx
```

9. **Build cho production:**
```bash
cd frontend
npm run build
# Output sẽ ở trong thư mục dist/
```

10. **Truy cập ứng dụng:**
- Frontend (dev): http://localhost:5173
- Backend API: http://localhost/tutoring-center-management/backend/api
- Production: Copy thư mục `dist/` vào document root

## 🚀 Sử Dụng

### Tài Khoản Mặc Định

Sau khi import seed data, sử dụng các tài khoản sau để đăng nhập:

**Admin:**
- Email: admin@tutoring.com
- Password: admin123

**Gia sư mẫu:**
- Email: tutor@tutoring.com
- Password: tutor123

**Phụ huynh mẫu:**
- Email: parent@tutoring.com
- Password: parent123

### Cấu Trúc Thư Mục

```
tutoring-center-management/
├── frontend/                 # React + Vite application
│   ├── src/
│   │   ├── assets/          # Images, fonts, etc.
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── utils/           # Utility functions
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── public/              # Static files
│   ├── index.html           # HTML template
│   ├── package.json
│   ├── vite.config.js       # Vite configuration
│   └── tailwind.config.js   # Tailwind configuration
│
├── backend/                 # PHP application
│   ├── api/                 # API endpoints
│   │   ├── index.php        # API router
│   │   ├── auth/            # Authentication endpoints
│   │   ├── admin/           # Admin endpoints
│   │   ├── tutor/           # Tutor endpoints
│   │   └── parent/          # Parent endpoints
│   ├── config/              # Configuration files
│   │   └── config.php       # Database & app config
│   ├── models/              # Data models
│   ├── controllers/         # Business logic
│   ├── middleware/          # Authentication, CORS, etc.
│   └── utils/               # Helper functions
│
├── database/                # Database files
│   ├── schema.sql           # Database structure
│   └── seed.sql             # Sample data
│
├── docs/                    # Documentation
│   ├── ERD.md              # Entity Relationship Diagram
│   └── API.md              # API documentation
│
└── README.md
```

### Quy Trình Sử Dụng Cơ Bản

1. **Đăng ký tài khoản:** Gia sư/Phụ huynh điền form → Admin phê duyệt
2. **Tạo yêu cầu lớp học:** Phụ huynh tạo yêu cầu → Admin lọc gia sư → Phụ huynh chọn → Gia sư phản hồi
3. **Học tập:** Gia sư điểm danh → Hệ thống tự động tính học phí
4. **Thanh toán:** Phụ huynh thanh toán → Admin xác nhận → Tính lương gia sư

## 🔄 Quy Trình Nghiệp Vụ

### 1. Quy Trình Đăng Ký Tài Khoản
```
Người dùng → Điền form → Gửi đăng ký → Admin duyệt → Kích hoạt tài khoản
```

### 2. Quy Trình Mở Lớp Học Mới
```
Phụ huynh tạo yêu cầu → Admin duyệt & lọc gia sư → 
Phụ huynh chọn gia sư → Gia sư phản hồi → 
[Đồng ý] → Tạo lớp → Thông báo
[Từ chối] → Chọn lại gia sư khác
```

### 3. Quy Trình Điểm Danh & Tính Học Phí
```
Gia sư điểm danh → Lưu dữ liệu → Cuối tháng tự động:
- Tính số buổi thực tế
- Tạo hóa đơn học phí
- Gửi thông báo phụ huynh
→ Phụ huynh thanh toán → Admin xác nhận → Tính lương gia sư
```

## 🗄️ Cấu Trúc Database

### Các Bảng Chính

#### Quản Lý Người Dùng
- `ADMIN` - Thông tin quản lý
- `GIA_SU` - Thông tin gia sư
- `PHU_HUYNH` - Thông tin phụ huynh
- `HOC_SINH` - Thông tin học sinh

#### Quản Lý Lớp Học
- `LOP_HOC` - Thông tin lớp học
- `LICH_HOC` - Lịch giảng dạy
- `DANG_KY_LOP` - Đăng ký lớp học
- `DIEM_DANH` - Điểm danh học sinh

#### Quản Lý Yêu Cầu
- `YEU_CAU_MO_LOP` - Yêu cầu mở lớp mới
- `GIA_SU_PHU_HOP` - Danh sách gia sư phù hợp
- `PHAN_HOI_GIA_SU` - Phản hồi của gia sư
- `YEU_CAU_HUY_LOP` - Yêu cầu hủy lớp
- `YEU_CAU_NGHI_DAY` - Yêu cầu nghỉ dạy

#### Quản Lý Tài Chính
- `HOC_PHI` - Học phí
- `LUONG_GIA_SU` - Lương gia sư
- `DOANH_THU_THANG` - Doanh thu tháng
- `CHI_TIET_DOANH_THU_LOP` - Chi tiết doanh thu lớp

#### Giao Tiếp
- `THONG_BAO` - Thông báo hệ thống
- `TIN_NHAN` - Tin nhắn trực tiếp
- `DANH_GIA` - Đánh giá gia sư

### Sơ Đồ ERD

Chi tiết sơ đồ ERD xem tại: [docs/ERD.md](docs/ERD.md)

## 🤝 Đóng Góp

Chúng tôi hoan nghênh mọi đóng góp cho dự án!

### Quy Trình Đóng Góp

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

### Coding Standards

- Sử dụng ESLint và Prettier
- Viết test cho features mới
- Tuân thủ quy ước đặt tên biến/hàm
- Comment code khi cần thiết

## 📝 License

Dự án này được phân phối dưới giấy phép MIT. Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 📞 Liên Hệ & Hỗ Trợ

- **Email:** support@tutoring.com
- **Website:** https://tutoring.com
- **Issues:** https://github.com/yourusername/tutoring-center-management/issues

## 🙏 Lời Cảm Ơn

- Cảm ơn tất cả contributors đã đóng góp cho dự án
- Cảm ơn các thư viện mã nguồn mở được sử dụng trong dự án
- Cảm ơn cộng đồng developer Việt Nam

---

**Phát triển bởi:** [Tên Team/Tổ Chức]  
**Môn học:** Web Nâng Cao  
**Năm:** 2026