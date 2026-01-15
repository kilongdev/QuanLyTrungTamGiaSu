# Quản Lý Trung Tâm Gia Sư

Hệ thống quản lý trung tâm gia sư với React + PHP

## Cấu trúc

```
├── backend/          # PHP API
│   ├── app/
│   │   ├── controllers/
│   │   ├── core/
│   │   └── models/
│   ├── public/
│   └── routes/
└── frontend/         # React + Vite + Tailwind
    └── src/
        ├── components/
        ├── pages/
        └── services/
```

## Cài đặt

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
php -S localhost:8080 -t public
```

## Công nghệ

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** PHP
