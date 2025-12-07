# 🚀 Quick Start Guide

## 1. Cài đặt Dependencies

```bash
npm install
```

## 2. Chạy Development Server

```bash
npm run dev
```

Mở trình duyệt: **http://localhost:3000**

## 3. Login

Sử dụng credentials:

```
username: admin@example.com
password: password123
```

## 4. Các tính năng chính

### Dashboard (`/dashboard`)

- Xem tổng quan hệ thống
- Số lượng học viên, khóa học, đăng ký
- Truy cập nhanh các chức năng

### Quản lý học viên (`/students`)

- Xem danh sách học viên
- Tìm kiếm theo mã HV hoặc tên
- **Admin**: Thêm/Sửa/Xóa học viên
- Xem lịch sử học của từng học viên

### Quản lý khóa học (`/courses`)

- Xem danh sách khóa học
- **Admin**: Thêm/Sửa/Xóa khóa học
- Chọn thời gian bắt đầu/kết thúc

### Đăng ký học (`/enrollments`)

- Đăng ký học viên vào khóa học
- Chọn học viên và khóa học từ dropdown

### Cấp chứng chỉ (`/certificates`)

- **Admin/Staff only**
- Nhập ID đăng ký học
- Chọn trạng thái: Đạt/Không đạt/Chờ xử lý

### Thống kê (`/statistics`)

- Thống kê học viên theo tỉnh
- Thống kê khóa học theo năm
- Số lượng đạt/không đạt

## 5. Phân quyền

- **ADMIN**: Full access (CRUD all)
- **STAFF**: View all + Issue certificates
- **USER**: View only

## 6. Build Production

```bash
npm run build
```

Output: `dist/` folder

## 🔧 Troubleshooting

### Backend không kết nối được

- Kiểm tra backend đang chạy tại `http://localhost:8080`
- Kiểm tra CORS config trong backend

### Token hết hạn

- Clear localStorage và login lại
- Token expires sau 10 giờ

### TypeScript errors

```bash
npm run build
```

## 📝 API Base URL

Mặc định: `http://localhost:8080/api`

Nếu cần thay đổi, sửa trong `src/services/api.ts`:

```ts
const API_BASE_URL = "http://your-backend-url/api";
```

## 🎨 Customize Colors

Sửa trong `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom colors
      }
    }
  }
}
```

## 📚 Structure Overview

```
src/
├── components/
│   ├── auth/ProtectedRoute.tsx
│   ├── common/Button|Input|Modal|Table|Card.tsx
│   └── layout/Navbar|Layout.tsx
├── pages/
│   ├── auth/LoginPage.tsx
│   ├── dashboard/DashboardPage.tsx
│   ├── students/StudentsPage|StudentFormPage|StudentHistoryPage.tsx
│   ├── courses/CoursesPage|CourseFormPage.tsx
│   ├── enrollments/EnrollmentPage.tsx
│   ├── certificates/CertificatesPage.tsx
│   └── statistics/StatisticsPage.tsx
├── redux/
│   ├── store.ts
│   ├── authSlice.ts
│   └── hooks.ts
├── services/
│   ├── api.ts (Axios instance + interceptors)
│   └── index.ts (All API functions)
├── types/index.ts (TypeScript interfaces)
├── utils/
│   ├── dateUtils.ts
│   ├── roleUtils.ts
│   └── helpers.ts
├── App.tsx (Routes)
└── main.tsx (Entry)
```

## ✅ Checklist

- [ ] Backend chạy ở port 8080
- [ ] Frontend chạy ở port 3000
- [ ] CORS được config đúng
- [ ] User đã được tạo trong backend
- [ ] Dependencies đã được cài đặt
- [ ] Login thành công
- [ ] Token được lưu trong localStorage

---

**Happy Coding! 🎉**
