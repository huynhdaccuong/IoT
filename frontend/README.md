<div align="center">

# XÂY DỰNG HỆ THỐNG GIÁM SÁT BẰNG IOT TÍCH HỢP FUZZY LOGIC 
### *Building an IoT-based monitoring system integrated with Fuzzy Logic. *


**Khoá luận Tốt nghiệp - Năm học 2025–2026**

Khoa Toán — Tin · Trường Đại học Sư phạm · Đại học Đà Nẵng

</div>

---

## Mục lục

1. [Thông tin chung](#1-thông-tin-chung)
2. [Giới thiệu đề tài](#2-giới-thiệu-đề-tài)
3. [Các chức năng chính](#3-các-chức-năng-chính)
4. [Kiến trúc hệ thống](#4-kiến-trúc-hệ-thống)
5. [Công nghệ sử dụng](#5-công-nghệ-sử-dụng)
6. [Yêu cầu môi trường](#6-yêu-cầu-môi-trường)
7. [Hướng dẫn cài đặt](#7-hướng-dẫn-cài-đặt-và-chạy)
8. [Cấu trúc thư mục](#8-cấu-trúc-thư-mục)
9. [Cơ sở dữ liệu](#9-cơ-sở-dữ-liệu)
10. [Mô hình Fuzzy Logic](#10-mô-hình-fuzzy-logic)
11. [API & Tài liệu kỹ thuật](#11-api--tài-liệu-kỹ-thuật)
12. [Kiểm thử](#12-kiểm-thử)
13. [Triển khai](#13-triển-khai)
14. [Giao diện minh hoạ](#14-giao-diện-minh-hoạ)
15. [Tài liệu liên quan](#15-tài-liệu-liên-quan)
16. [Lời cảm ơn](#16-lời-cảm-ơn)
17. [Liên hệ](#17-liên-hệ)

---

## 1. Thông tin chung

| Mục | Thông tin |
|:---|:---|
| **Tên đề tài (Tiếng Việt)** | Xây dựng hệ thống giám sát bằng IoT tích hợp Fuzzy Logic  |
| **Tên đề tài (Tiếng Anh)** | Building an IoT-based monitoring system integrated with Fuzzy Logic. |
| **Sinh viên thực hiện** | Huỳnh Đắc Cường |
| **Mã số sinh viên** | 3120222015 |
| **Lớp** | 22CNTT2 |
| **Email sinh viên** | 3120222015@ued.udn.vn |
| **Số điện thoại** | 0769532951 |
| **Giảng viên hướng dẫn** | TS. Đoàn Duy Bình |
| **Đơn vị công tác GVHD** | Khoa Toán — Tin, Trường Đại học Sư phạm — Đại học Đà Nẵng |
| **Email GVHD** | ddbinh@ued.udn.vn |
| **Niên khoá** | 2022 — 2026 |
| **Năm bảo vệ** | 2026 |
| **Ngành đào tạo** | Công nghệ Thông tin |

---

## 2. Giới thiệu đề tài

### 2.1. Bối cảnh

Các hệ thống IoT (Internet of Things) hiện đại cần một giải pháp quản lý thiết bị toàn diện, cho phép người dùng giám sát dữ liệu từ nhiều cảm biến (nhiệt độ, độ ẩm, nồng độ khí gas) từ xa thông qua một giao diện web thân thiện. Các thiết bị ESP32 phổ biến hiện nay có khả năng kết nối WiFi mạnh mẽ, nhưng yêu cầu một backend đồng bộ để lưu trữ, xử lý và hiển thị dữ liệu realtime. Thêm vào đó, việc đánh giá mức độ rủi ro từ dữ liệu cảm biến đòi hỏi một cách tiếp cận linh hoạt hơn so với ngưỡng cố định truyền thống.

### 2.2. Vấn đề

- Các nền tảng IoT hiện có chưa hỗ trợ đầy đủ chia sẻ thiết bị giữa nhiều người dùng.
- Dữ liệu cảm biến thường được xử lý bằng ngưỡng cố định, không phản ánh chính xác trong các trường hợp ranh giới.
- Thiếu một hệ thống cảnh báo tự động gửi thông báo khi phát hiện nguy hiểm.     

### 2.3. Mục tiêu

Đề tài hướng đến thiết kế và triển khai một hệ thống giám sát thông minh
có khả năng phát hiện sớm nguy cơ cháy nổ và cảnh báo kịp thời cho người
dùng. Thông qua việc ứng dụng IoT kết hợp Fuzzy Logic góp phần nâng cao độ
chính xác trong việc đánh giá rủi ro, giảm thiểu sai sót, đồng thời góp phần đảm
bảo an toàn cho con người và tài sản.

### 2.4. Phạm vi

•Thiết kế và triển khai website hiển thị dữ liệu thu thập từ hệ thống IoT.
• Xây dựng cơ sở dữ liệu phục vụ việc lưu trữ dữ liệu từ hệ thống.
• Thu thập và xử lý dữ liệu từ các cảm biến cơ bản(nhiệt độ, độ ẩm, khí
gas), chưa mở rộng đến các yếu tố môi trường phức tạp khác.
• Triển khai chức năng truy xuất và hiển thị dữ liệu trên website theo thời
gian thực hoặc định kỳ một cách trực quan.
• Áp dụng Fuzzy Logic ở mức cơ bản để đánh giá mức độ nguy hiểm và
đưa ra cảnh báo.
• Hệ thống chỉ tập trung ở mức giám sát và cảnh báo.
• Hệ thống mang tính mô phỏng và thực nghiệm trong phạm vi khuôn khổ
đồ án.
### 2.5. Đóng góp của đề tài

- Một nền tảng web toàn chức năng với vai trò (chủ sở hữu-người dùng phụ).
- Một mô hình Fuzzy Logic được xử lý trực tiếp trên ESP32 (edge computing) để tính toán mức độ rủi zo.

## 3. Các chức năng chính

### Phân hệ Chủ sỡ hữu
- Đăng ký / đăng nhập bằng email hoặc OAuth Google
- Thêm thiết bị mới bằng Device ID
- Đổi tên thiết bị để gợi nhớ
- Xem dữ liệu realtime (gas, nhiệt độ, độ ẩm, mức rủi ro)
- Dữ liệu được cập nhật mỗi 5 giây từ ESP32
- Xem lịch sử dữ liệu dưới dạng biểu đồ (Chart.js)
- Chia sẻ thiết bị với người dùng khác
- Nhận cảnh báo email tự động khi phát hiện nguy hiểm
- Cập nhật hồ sơ cá nhân

### Phân hệ Người dùng phụ
- Đăng ký / đăng nhập bằng email hoặc OAuth Google
- Thêm thiết bị mới bằng Device ID
- Đổi tên thiết bị để gợi nhớ
- Xem dữ liệu realtime (gas, nhiệt độ, độ ẩm, mức rủi ro)
- Dữ liệu được cập nhật mỗi 5 giây từ ESP32
- Xem lịch sử dữ liệu dưới dạng biểu đồ (Chart.js)
- Chia sẻ thiết bị với người dùng khác
- Nhận cảnh báo email tự động khi phát hiện nguy hiểm
- Cập nhật hồ sơ cá nhân

*** Người dùng phụ cũng có thể là chủ sở hữu và ngược lại ***
---

## 4. Kiến trúc hệ thống

```
┌──────────────────────────────────────────────────────────────┐
│          Thiết bị ESP32 + Cảm biến (DHT22, MQ-02, MQ-09)    │
└────────────────────────────┬─────────────────────────────────┘
                              │ HTTP POST /api/data
                              ▼
┌──────────────────────────────────────────────────────────────┐
│         Frontend SPA  (React 19 · Vite · TailwindCSS)        │
└────────────────────────────┬───────────────────────────────────┘
                              │ REST + WebSocket
                              ▼
┌──────────────────────────────────────────────────────────────┐
│   API Gateway / Backend  (Node.js · Express · TypeScript)    │
│  ┌──────────────┬──────────────┬──────────────┬────────────┐ │
│  │ Auth Service │ Device Svc   │ Class Service│ Report Svc │ │
│  └──────────────┴──────────────┴──────────────┴────────────┘ │
└────────────────┬────────────────────┬──────────────────────┘
                 │                    │
                 ▼                    ▼
        ┌────────────────┐  ┌─────────────────────────┐
        │ PostgreSQL     │  │ ESP32                   │
        │ - Dữ liệu user │  │ · Fuzzy Logic           │
        │ - Devices      │  │ · Risk level evaluation │
        │ - Sensor data  │  └─────────────────────────┘
        │ - Shares       │  
        └────────────────┘
```

---

## 5. Công nghệ sử dụng

| Thành phần | Công nghệ | Phiên bản |
|:---|:---|:---:|
| **Frontend** | React | 19.2.0 |
| | Vite | 5.0+ |
| | Axios | 1.13.6 |
| | React Router | 7.13.1 |
| | TailwindCSS | 4.2.1 |
| | Chart.js + React-ChartJS-2 | 4.5.1 / 5.3.1 |
| | Heroicons | 2.2.0 |
| **Backend** | Node.js + Express | 20 LTS / 5.2.1 |
| | TypeScript | 5.3+ |
| | Prisma | 5.10+ |
| | JWT (jsonwebtoken) | 9.0.3 |
| | bcryptjs | 3.0.3 |
| | Nodemailer | 8.0.1 |
| | CORS | 2.8.6 |
| **ML Service** | Python | 3.11 |
| | FastAPI | 0.110+ |
| | scikit-learn, NumPy, SciPy | Latest |
| **Database** | PostgreSQL | 16 |
| | Redis | 7.2 |
| **Hardware** | ESP32 | — |
| | DHT22 | — |
| | MQ-02, MQ-09 (Gas sensors) | — |
| **DevOps** | Docker + Docker Compose | 24 / v2 |
| | GitHub Actions | — |

---

## 6. Yêu cầu môi trường

| Yêu cầu | Tối thiểu | Khuyến nghị |
|:---|:---:|:---:|
| Node.js | 18.0 | 20.11 LTS |
| Python | 3.10 | 3.11 |
| PostgreSQL | 14 | 16 |
| Redis | 6 | 7.2 |
| RAM | 4 GB | 8 GB |
| Disk | 10 GB | 20 GB |

---

## 7. Hướng dẫn cài đặt và chạy

### 7.1. Clone mã nguồn

```bash
git clone https://github.com/<username>/iotdms-fuzzy.git
cd iotdms-fuzzy
```

### 7.2. Cài đặt bằng Docker (khuyến nghị)

```bash
cp .env.example .env
docker compose up -d --build
docker compose exec backend npm run db:migrate
docker compose exec backend npm run db:seed
```

Truy cập: http://localhost:5173

### 7.3. Cài đặt thủ công

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (terminal khác)
cd frontend && npm install && npm run dev

# ESP32
#include <WiFi.h>
#include <HTTPClient.h>
#include <WebServer.h>
#include <Preferences.h>
#include <DHT.h>
#include <FuzzyLogic.h>
```

---

## 8. Cấu trúc thư mục

```
KhoaLuan/
│
├── backend/                           # Server Node.js + Express
│   ├── .env                          # Environment variables
│   ├── server.js                     # Entry point
│   ├── package.json                  # Dependencies
│   ├── package-lock.json             # Dependency lock
│   │
│   ├── database.sql                  # Database schema
│   ├── migrate.js                    # Database migration
│   ├── migrate_device_sharing.js     # Device sharing migration
│   ├── migrate_reset_password.js     # Password reset migration
│   │
│   ├── config/                       # Configuration
│   │   └── db.js                    # MySQL connection
│   │
│   ├── controllers/                  # Business logic (MVC)
│   │   ├── authController.js        # Authentication logic
│   │   ├── deviceController.js      # Device management logic
│   │   └── userController.js        # User management logic
│   │
│   ├── middleware/                   # Express middleware
│   │   ├── authMiddleware.js        # JWT verification
│   │   └── deviceOwnerMiddleware.js # Device ownership check
│   │
│   ├── routes/                       # API routes
│   │   ├── authRoutes.js            # Auth endpoints
│   │   ├── deviceRoutes.js          # Device endpoints
│   │   └── userRoutes.js            # User endpoints
│   │
│   ├── services/                     # Business services
│   │   └── alertService.js          # Email alert logic
│   │
│   ├── utils/                        # Utility functions
│   │   └── emailService.js          # Nodemailer config
│   │
│   └── node_modules/                 # npm packages (gitignore)
│
├── frontend/                          # React web application
│   ├── .gitignore                    # Git ignore rules
│   ├── index.html                    # HTML entry
│   ├── package.json                  # Frontend dependencies
│   ├── postcss.config.js             # PostCSS config
│   ├── tailwind.config.js            # Tailwind CSS config
│   ├── vite.config.js                # Vite build config
│   ├── eslint.config.js              # ESLint rules
│   ├── README.md                     # Frontend README
│   │
│   ├── public/                       # Static assets
│   │
│   ├── src/                          # Source code
│   │   ├── main.jsx                 # React entry point
│   │   ├── App.jsx                  # Root component
│   │   ├── App.css                  # Global styles
│   │   ├── index.css                # Index styles
│   │   │
│   │   ├── api/                     # API configuration
│   │   │   └── axiosClient.js      # Axios instance
│   │   │
│   │   ├── components/              # Reusable components
│   │   │   ├── AddDeviceCard.jsx   # Add device card
│   │   │   ├── DeviceCard.jsx      # Device display card
│   │   │   ├── DeviceDropdown.jsx  # Device selector dropdown
│   │   │   ├── Button.jsx          # Custom button
│   │   │   ├── Input.jsx           # Custom input
│   │   │   ├── Header.jsx          # Navigation header
│   │   │   ├── SearchInput.jsx     # Search bar
│   │   │   ├── ShareButton.jsx     # Share button
│   │   │   ├── SharedUserList.jsx  # Shared users list
│   │   │   └── Toast.jsx           # Notification toast
│   │   │
│   │   ├── context/                 # React context API
│   │   │   └── AuthContext.jsx     # Auth state management
│   │   │
│   │   ├── modal/                   # Modal components
│   │   │   ├── DeviceModal.jsx     # Add/Edit device modal
│   │   │   ├── ShareModal.jsx      # Share device modal
│   │   │   ├── RenameDeviceModal.jsx # Rename modal
│   │   │   ├── EditProfileModal.jsx # Profile edit modal
│   │   │   └── ConfirmDeleteModal.jsx # Delete confirm
│   │   │
│   │   ├── pages/                   # Page components
│   │   │   ├── Home.jsx            # Landing/Home page
│   │   │   ├── Login.jsx           # Login page
│   │   │   ├── Register.jsx        # Register page
│   │   │   ├── Dashboard.jsx       # Main dashboard
│   │   │   ├── Profile.jsx         # User profile
│   │   │   ├── VerifyEmail.jsx     # Email verification
│   │   │   ├── EmailVerified.jsx   # Verified success
│   │   │   ├── ForgotPassword.jsx  # Forgot password
│   │   │   └── ResetPassword.jsx   # Reset password
│   │   │
│   │   ├── services/                # API service layer
│   │   │   ├── authService.js      # Auth API calls
│   │   │   ├── deviceService.js    # Device API calls
│   │   │   └── userService.js      # User API calls
│   │   │
│   │   └── assets/                  # Images, fonts, etc.

```

---

## 9. Cơ sở dữ liệu

PostgreSQL với 12 bảng chính:
- **users** — thông tin người dùng
- **devices** — danh sách thiết bị IoT
- **user_devices** — liên kết người dùng — thiết bị
- **device_shares** — chia sẻ thiết bị
- **sensor_current** — dữ liệu realtime
- **sensor_history** — lịch sử dữ liệu

---

## 10. Mô hình Fuzzy Logic

### Tham số đầu vào
- **Gas (ppm)**: 0-1000 → Low, Medium, High
- **Temperature (°C)**: 15-45 → Cool, Normal, Hot
- **Humidity (%)**: 20-100 → Dry, Normal, Humid

### Đầu ra (Risk Level)
- **SAFE**: Rủi ro thấp (≤ 30%)
- **WARNING**: Rủi ro trung bình (30-70%)
- **DANGER**: Rủi ro cao (> 70%)

### Luật suy diễn
Tổng cộng: **27 luật** được thiết kế dựa trên tiêu chuẩn an toàn hóa chất.


## 11. Tài liệu liên quan

| Tài liệu | Đường dẫn |
|:---|:---|
| Báo cáo khoá luận (full) | [https://ued-my.sharepoint.com/:w:/g/personal/3120222015_ued_udn_vn/IQC6mjvOcCcYQIkY_ck4QA9ZAYE02QF-zuC-od2kvn9vp1Q?e=mHETPe|]
| Các sơ đồ |[https://drive.google.com/file/d/17C9fk3esqZd69cjSnHW3ekKKMSkefSbj/view?usp=sharing]

---

## 12. Lời cảm ơn

Trong quá trình thực hiện dự án nhờ sự giúp đỡ và tạo điều kiện của các
thầy, cô trường Đại học Sư Phạm-Đại học Đà Nẵng, em đã hoàn thành dự án và
bài báo cáo trong thời gian quy định. Trong quá trình thực hiện không tránh
được những thiếu sót, em rất mong nhận được sự góp ý, hướng dẫn và hỗ trợ từ
quý thầy cô để có thể tiếp tục hoàn thiện và nâng cao chất lượng của dự án trong
thời gian tới.
Với lòng kính trọng và biết ơn sâu sắc, em xin gửi lời cảm ơn đến thầy
giảng viên hướng dẫn, TS Đoàn Duy Bình đã tận tình giúp đỡ em từ bước đầu
tiên khi lên ý tưởng dự án, đề cương khóa luận cũng như trong suốt quá trình
thực hiện dự án khóa luận này.
Em cũng xin gửi lời cảm ơn chân thành đến quý thầy cô khoa Toán – Tin
đã tạo điều kiện và giúp đỡ em trong thời gian học tập thực hiện dự án khóa
luận này.

---

## 13. Liên hệ

| Thông tin | Chi tiết |
|:---|:---|
| Email | 3120222015@ued.udn.vn |
| Điện thoại | 0769531958 |
| GitHub | https://github.com/cuonghuynh/iotdms-fuzzy |

---

**License**: Academic Use Only

*Last Updated: May 2, 2026*