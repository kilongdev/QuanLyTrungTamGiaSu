-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th1 30, 2026 lúc 04:46 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `trungtamgiasu`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `admin`
--

CREATE TABLE `admin` (
  `admin_id` int(11) NOT NULL,
  `ho_ten` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `mat_khau` varchar(255) NOT NULL,
  `so_dien_thoai` varchar(20) DEFAULT NULL,
  `ngay_tao` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chi_tiet_doanh_thu_lop`
--

CREATE TABLE `chi_tiet_doanh_thu_lop` (
  `chi_tiet_id` int(11) NOT NULL,
  `lop_hoc_id` int(11) NOT NULL,
  `doanh_thu_id` int(11) NOT NULL,
  `thang` int(11) NOT NULL,
  `nam` int(11) NOT NULL,
  `so_hoc_sinh` int(11) DEFAULT 0,
  `so_buoi_hoc` int(11) DEFAULT 0,
  `tong_thu` decimal(10,2) DEFAULT 0.00,
  `tien_tra_gia_su` decimal(10,2) DEFAULT 0.00,
  `loi_nhuan_lop` decimal(10,2) DEFAULT 0.00,
  `ngay_tao` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `dang_ky_lop`
--

CREATE TABLE `dang_ky_lop` (
  `dang_ky_id` int(11) NOT NULL,
  `hoc_sinh_id` int(11) NOT NULL,
  `lop_hoc_id` int(11) NOT NULL,
  `trang_thai` enum('cho_duyet','da_duyet','tu_choi','da_huy') DEFAULT 'cho_duyet',
  `ngay_dang_ky` datetime DEFAULT current_timestamp(),
  `ngay_duyet` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `danh_gia`
--

CREATE TABLE `danh_gia` (
  `danh_gia_id` int(11) NOT NULL,
  `phu_huynh_id` int(11) NOT NULL,
  `gia_su_id` int(11) NOT NULL,
  `diem_so` int(11) DEFAULT NULL CHECK (`diem_so` >= 1 and `diem_so` <= 5),
  `noi_dung` text DEFAULT NULL,
  `ngay_danh_gia` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `diem_danh`
--

CREATE TABLE `diem_danh` (
  `diem_danh_id` int(11) NOT NULL,
  `lich_hoc_id` int(11) NOT NULL,
  `hoc_sinh_id` int(11) NOT NULL,
  `tinh_trang` enum('co_mat','vang','vang_co_phep') DEFAULT 'co_mat',
  `ghi_chu` text DEFAULT NULL,
  `ngay_diem_danh` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `doanh_thu_thang`
--

CREATE TABLE `doanh_thu_thang` (
  `doanh_thu_id` int(11) NOT NULL,
  `thang` int(11) NOT NULL,
  `nam` int(11) NOT NULL,
  `tong_thu_hoc_phi` decimal(10,2) DEFAULT 0.00,
  `tong_tra_gia_su` decimal(10,2) DEFAULT 0.00,
  `loi_nhuan` decimal(10,2) DEFAULT 0.00,
  `so_luong_lop` int(11) DEFAULT 0,
  `so_luong_hoc_sinh` int(11) DEFAULT 0,
  `ngay_cap_nhat` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `gia_su`
--

CREATE TABLE `gia_su` (
  `gia_su_id` int(11) NOT NULL,
  `ho_ten` varchar(255) NOT NULL,
  `ngay_sinh` date DEFAULT NULL,
  `gioi_tinh` varchar(10) DEFAULT NULL,
  `so_dien_thoai` varchar(20) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `mat_khau` varchar(255) NOT NULL,
  `dia_chi` text DEFAULT NULL,
  `anh_dai_dien` varchar(255) DEFAULT NULL,
  `bang_cap` text DEFAULT NULL,
  `chung_chi` text DEFAULT NULL,
  `gioi_thieu` text DEFAULT NULL,
  `kinh_nghiem` text DEFAULT NULL,
  `so_tai_khoan_ngan_hang` varchar(50) DEFAULT NULL,
  `diem_danh_gia_trung_binh` decimal(3,2) DEFAULT 0.00,
  `trang_thai` enum('cho_duyet','da_duyet','tu_choi','khoa') DEFAULT 'cho_duyet',
  `ngay_dang_ky` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `gia_su_mon_hoc`
--

CREATE TABLE `gia_su_mon_hoc` (
  `gia_su_mon_hoc_id` int(11) NOT NULL,
  `gia_su_id` int(11) NOT NULL,
  `mon_hoc_id` int(11) NOT NULL,
  `trinh_do` varchar(100) DEFAULT NULL,
  `kinh_nghiem_nam` int(11) DEFAULT NULL,
  `ghi_chu` text DEFAULT NULL,
  `ngay_them` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `hoc_phi`
--

CREATE TABLE `hoc_phi` (
  `hoc_phi_id` int(11) NOT NULL,
  `dang_ky_id` int(11) NOT NULL,
  `so_tien` decimal(10,2) NOT NULL,
  `so_buoi_da_hoc` int(11) DEFAULT 0,
  `trang_thai_thanh_toan` enum('chua_thanh_toan','da_thanh_toan','qua_han') DEFAULT 'chua_thanh_toan',
  `ngay_thanh_toan` date DEFAULT NULL,
  `ngay_tao` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `hoc_sinh`
--

CREATE TABLE `hoc_sinh` (
  `hoc_sinh_id` int(11) NOT NULL,
  `phu_huynh_id` int(11) NOT NULL,
  `ho_ten` varchar(255) NOT NULL,
  `ngay_sinh` date DEFAULT NULL,
  `khoi_lop` varchar(20) DEFAULT NULL,
  `ngay_tao` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `lich_hoc`
--

CREATE TABLE `lich_hoc` (
  `lich_hoc_id` int(11) NOT NULL,
  `lop_hoc_id` int(11) NOT NULL,
  `ngay_hoc` date NOT NULL,
  `gio_bat_dau` time NOT NULL,
  `gio_ket_thuc` time NOT NULL,
  `trang_thai` enum('chua_hoc','da_hoc','huy') DEFAULT 'chua_hoc'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `lop_hoc`
--

CREATE TABLE `lop_hoc` (
  `lop_hoc_id` int(11) NOT NULL,
  `gia_su_id` int(11) DEFAULT NULL,
  `mon_hoc_id` int(11) NOT NULL,
  `khoi_lop` varchar(20) DEFAULT NULL,
  `gia_toan_khoa` decimal(10,2) DEFAULT NULL,
  `so_buoi_hoc` int(11) DEFAULT NULL,
  `gia_moi_buoi` decimal(10,2) DEFAULT NULL,
  `so_luong_toi_da` int(11) DEFAULT 1,
  `so_luong_hien_tai` int(11) DEFAULT 0,
  `loai_chi_tra` enum('phan_tram','tien_cu_the') NOT NULL DEFAULT 'phan_tram',
  `gia_tri_chi_tra` decimal(10,2) DEFAULT NULL,
  `chu_ky_thanh_toan` varchar(20) DEFAULT 'theo_thang',
  `trang_thai` enum('sap_mo','dang_hoc','ket_thuc','dong') DEFAULT 'sap_mo',
  `ngay_tao` datetime DEFAULT current_timestamp(),
  `ngay_ket_thuc` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `luong_gia_su`
--

CREATE TABLE `luong_gia_su` (
  `luong_id` int(11) NOT NULL,
  `gia_su_id` int(11) NOT NULL,
  `lop_hoc_id` int(11) NOT NULL,
  `thang` int(11) DEFAULT NULL,
  `nam` int(11) DEFAULT NULL,
  `so_buoi_day` int(11) DEFAULT 0,
  `tong_tien_thu` decimal(10,2) DEFAULT NULL,
  `tien_tra_gia_su` decimal(10,2) DEFAULT NULL,
  `loai_chi_tra` enum('phan_tram','tien_cu_the') DEFAULT NULL,
  `gia_tri_ap_dung` decimal(10,2) DEFAULT NULL,
  `trang_thai_thanh_toan` enum('chua_thanh_toan','da_thanh_toan','qua_han') DEFAULT 'chua_thanh_toan',
  `ngay_thanh_toan` date DEFAULT NULL,
  `ngay_tao` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `mon_hoc`
--

CREATE TABLE `mon_hoc` (
  `mon_hoc_id` int(11) NOT NULL,
  `ten_mon_hoc` varchar(100) NOT NULL,
  `mo_ta` text DEFAULT NULL,
  `trang_thai` enum('hoat_dong','khong_hoat_dong') DEFAULT 'hoat_dong',
  `ngay_tao` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `phu_huynh`
--

CREATE TABLE `phu_huynh` (
  `phu_huynh_id` int(11) NOT NULL,
  `ho_ten` varchar(255) NOT NULL,
  `so_dien_thoai` varchar(20) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `mat_khau` varchar(255) NOT NULL,
  `dia_chi` text DEFAULT NULL,
  `trang_thai` enum('cho_duyet','da_duyet','tu_choi','khoa') DEFAULT 'cho_duyet',
  `ngay_dang_ky` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `thong_bao`
--

CREATE TABLE `thong_bao` (
  `thong_bao_id` int(11) NOT NULL,
  `nguoi_gui_id` int(11) DEFAULT NULL,
  `loai_nguoi_gui` enum('admin','gia_su','phu_huynh') DEFAULT NULL,
  `nguoi_nhan_id` int(11) DEFAULT NULL,
  `loai_nguoi_nhan` enum('admin','gia_su','phu_huynh') DEFAULT NULL,
  `loai_thong_bao` enum('he_thong','lop_hoc','thanh_toan','yeu_cau','danh_gia','khac') DEFAULT 'khac',
  `tieu_de` varchar(255) DEFAULT NULL,
  `noi_dung` text DEFAULT NULL,
  `lien_ket_id` int(11) DEFAULT NULL,
  `lien_ket_loai` varchar(50) DEFAULT NULL,
  `da_doc` tinyint(1) DEFAULT 0,
  `ngay_tao` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tin_nhan`
--

CREATE TABLE `tin_nhan` (
  `tin_nhan_id` int(11) NOT NULL,
  `nguoi_gui_id` int(11) NOT NULL,
  `loai_nguoi_gui` enum('admin','gia_su','phu_huynh') DEFAULT NULL,
  `nguoi_nhan_id` int(11) NOT NULL,
  `loai_nguoi_nhan` enum('admin','gia_su','phu_huynh') DEFAULT NULL,
  `noi_dung` text DEFAULT NULL,
  `da_doc` tinyint(1) DEFAULT 0,
  `ngay_gui` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `yeu_cau`
--

CREATE TABLE `yeu_cau` (
  `yeu_cau_id` int(11) NOT NULL,
  `nguoi_tao_id` int(11) NOT NULL,
  `loai_nguoi_tao` enum('admin','gia_su','phu_huynh') NOT NULL,
  `phan_loai` varchar(50) NOT NULL,
  `tieu_de` varchar(255) NOT NULL,
  `noi_dung` text NOT NULL,
  `lop_hoc_id` int(11) DEFAULT NULL,
  `dang_ky_id` int(11) DEFAULT NULL,
  `gia_su_id` int(11) DEFAULT NULL,
  `trang_thai` enum('cho_duyet','dang_xu_ly','da_duyet','tu_choi','da_hoan_thanh') DEFAULT 'cho_duyet',
  `nguoi_xu_ly_id` int(11) DEFAULT NULL,
  `ghi_chu_xu_ly` text DEFAULT NULL,
  `ngay_tao` datetime DEFAULT current_timestamp(),
  `ngay_xu_ly` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`admin_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Chỉ mục cho bảng `chi_tiet_doanh_thu_lop`
--
ALTER TABLE `chi_tiet_doanh_thu_lop`
  ADD PRIMARY KEY (`chi_tiet_id`),
  ADD UNIQUE KEY `unique_lop_thang_nam` (`lop_hoc_id`,`thang`,`nam`),
  ADD KEY `doanh_thu_id` (`doanh_thu_id`);

--
-- Chỉ mục cho bảng `dang_ky_lop`
--
ALTER TABLE `dang_ky_lop`
  ADD PRIMARY KEY (`dang_ky_id`),
  ADD UNIQUE KEY `unique_hoc_sinh_lop` (`hoc_sinh_id`,`lop_hoc_id`),
  ADD KEY `lop_hoc_id` (`lop_hoc_id`),
  ADD KEY `idx_trang_thai` (`trang_thai`);

--
-- Chỉ mục cho bảng `danh_gia`
--
ALTER TABLE `danh_gia`
  ADD PRIMARY KEY (`danh_gia_id`),
  ADD KEY `idx_phu_huynh_gia_su` (`phu_huynh_id`,`gia_su_id`),
  ADD KEY `idx_gia_su_id` (`gia_su_id`);

--
-- Chỉ mục cho bảng `diem_danh`
--
ALTER TABLE `diem_danh`
  ADD PRIMARY KEY (`diem_danh_id`),
  ADD UNIQUE KEY `unique_lich_hoc_sinh` (`lich_hoc_id`,`hoc_sinh_id`),
  ADD KEY `hoc_sinh_id` (`hoc_sinh_id`);

--
-- Chỉ mục cho bảng `doanh_thu_thang`
--
ALTER TABLE `doanh_thu_thang`
  ADD PRIMARY KEY (`doanh_thu_id`),
  ADD UNIQUE KEY `unique_thang_nam` (`thang`,`nam`);

--
-- Chỉ mục cho bảng `gia_su`
--
ALTER TABLE `gia_su`
  ADD PRIMARY KEY (`gia_su_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_trang_thai` (`trang_thai`);

--
-- Chỉ mục cho bảng `gia_su_mon_hoc`
--
ALTER TABLE `gia_su_mon_hoc`
  ADD PRIMARY KEY (`gia_su_mon_hoc_id`),
  ADD UNIQUE KEY `unique_gia_su_mon_hoc` (`gia_su_id`,`mon_hoc_id`),
  ADD KEY `mon_hoc_id` (`mon_hoc_id`);

--
-- Chỉ mục cho bảng `hoc_phi`
--
ALTER TABLE `hoc_phi`
  ADD PRIMARY KEY (`hoc_phi_id`),
  ADD KEY `idx_trang_thai_thanh_toan` (`trang_thai_thanh_toan`),
  ADD KEY `idx_dang_ky_id` (`dang_ky_id`);

--
-- Chỉ mục cho bảng `hoc_sinh`
--
ALTER TABLE `hoc_sinh`
  ADD PRIMARY KEY (`hoc_sinh_id`),
  ADD KEY `phu_huynh_id` (`phu_huynh_id`);

--
-- Chỉ mục cho bảng `lich_hoc`
--
ALTER TABLE `lich_hoc`
  ADD PRIMARY KEY (`lich_hoc_id`),
  ADD KEY `idx_ngay_hoc` (`ngay_hoc`),
  ADD KEY `idx_lop_hoc_id` (`lop_hoc_id`),
  ADD KEY `idx_trang_thai` (`trang_thai`);

--
-- Chỉ mục cho bảng `lop_hoc`
--
ALTER TABLE `lop_hoc`
  ADD PRIMARY KEY (`lop_hoc_id`),
  ADD KEY `idx_trang_thai` (`trang_thai`),
  ADD KEY `idx_mon_hoc_id` (`mon_hoc_id`),
  ADD KEY `idx_gia_su_id` (`gia_su_id`);

--
-- Chỉ mục cho bảng `luong_gia_su`
--
ALTER TABLE `luong_gia_su`
  ADD PRIMARY KEY (`luong_id`),
  ADD UNIQUE KEY `unique_luong` (`gia_su_id`,`lop_hoc_id`,`thang`,`nam`),
  ADD KEY `lop_hoc_id` (`lop_hoc_id`),
  ADD KEY `idx_trang_thai_thanh_toan` (`trang_thai_thanh_toan`),
  ADD KEY `idx_thang_nam` (`thang`,`nam`);

--
-- Chỉ mục cho bảng `mon_hoc`
--
ALTER TABLE `mon_hoc`
  ADD PRIMARY KEY (`mon_hoc_id`),
  ADD UNIQUE KEY `ten_mon_hoc` (`ten_mon_hoc`),
  ADD KEY `idx_trang_thai` (`trang_thai`);

--
-- Chỉ mục cho bảng `phu_huynh`
--
ALTER TABLE `phu_huynh`
  ADD PRIMARY KEY (`phu_huynh_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_trang_thai` (`trang_thai`);

--
-- Chỉ mục cho bảng `thong_bao`
--
ALTER TABLE `thong_bao`
  ADD PRIMARY KEY (`thong_bao_id`),
  ADD KEY `idx_nguoi_nhan_id` (`nguoi_nhan_id`),
  ADD KEY `idx_da_doc` (`da_doc`),
  ADD KEY `idx_loai_thong_bao` (`loai_thong_bao`),
  ADD KEY `idx_ngay_tao` (`ngay_tao`);

--
-- Chỉ mục cho bảng `tin_nhan`
--
ALTER TABLE `tin_nhan`
  ADD PRIMARY KEY (`tin_nhan_id`),
  ADD KEY `idx_nguoi_nhan_id` (`nguoi_nhan_id`),
  ADD KEY `idx_da_doc` (`da_doc`),
  ADD KEY `idx_ngay_gui` (`ngay_gui`);

--
-- Chỉ mục cho bảng `yeu_cau`
--
ALTER TABLE `yeu_cau`
  ADD PRIMARY KEY (`yeu_cau_id`),
  ADD KEY `lop_hoc_id` (`lop_hoc_id`),
  ADD KEY `dang_ky_id` (`dang_ky_id`),
  ADD KEY `gia_su_id` (`gia_su_id`),
  ADD KEY `idx_phan_loai` (`phan_loai`),
  ADD KEY `idx_trang_thai` (`trang_thai`),
  ADD KEY `idx_nguoi_tao_id` (`nguoi_tao_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `admin`
--
ALTER TABLE `admin`
  MODIFY `admin_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `chi_tiet_doanh_thu_lop`
--
ALTER TABLE `chi_tiet_doanh_thu_lop`
  MODIFY `chi_tiet_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `dang_ky_lop`
--
ALTER TABLE `dang_ky_lop`
  MODIFY `dang_ky_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `danh_gia`
--
ALTER TABLE `danh_gia`
  MODIFY `danh_gia_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `diem_danh`
--
ALTER TABLE `diem_danh`
  MODIFY `diem_danh_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `doanh_thu_thang`
--
ALTER TABLE `doanh_thu_thang`
  MODIFY `doanh_thu_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `gia_su`
--
ALTER TABLE `gia_su`
  MODIFY `gia_su_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `gia_su_mon_hoc`
--
ALTER TABLE `gia_su_mon_hoc`
  MODIFY `gia_su_mon_hoc_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `hoc_phi`
--
ALTER TABLE `hoc_phi`
  MODIFY `hoc_phi_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `hoc_sinh`
--
ALTER TABLE `hoc_sinh`
  MODIFY `hoc_sinh_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `lich_hoc`
--
ALTER TABLE `lich_hoc`
  MODIFY `lich_hoc_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `lop_hoc`
--
ALTER TABLE `lop_hoc`
  MODIFY `lop_hoc_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `luong_gia_su`
--
ALTER TABLE `luong_gia_su`
  MODIFY `luong_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `mon_hoc`
--
ALTER TABLE `mon_hoc`
  MODIFY `mon_hoc_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `phu_huynh`
--
ALTER TABLE `phu_huynh`
  MODIFY `phu_huynh_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `thong_bao`
--
ALTER TABLE `thong_bao`
  MODIFY `thong_bao_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `tin_nhan`
--
ALTER TABLE `tin_nhan`
  MODIFY `tin_nhan_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `yeu_cau`
--
ALTER TABLE `yeu_cau`
  MODIFY `yeu_cau_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `chi_tiet_doanh_thu_lop`
--
ALTER TABLE `chi_tiet_doanh_thu_lop`
  ADD CONSTRAINT `chi_tiet_doanh_thu_lop_ibfk_1` FOREIGN KEY (`lop_hoc_id`) REFERENCES `lop_hoc` (`lop_hoc_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chi_tiet_doanh_thu_lop_ibfk_2` FOREIGN KEY (`doanh_thu_id`) REFERENCES `doanh_thu_thang` (`doanh_thu_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `dang_ky_lop`
--
ALTER TABLE `dang_ky_lop`
  ADD CONSTRAINT `dang_ky_lop_ibfk_1` FOREIGN KEY (`hoc_sinh_id`) REFERENCES `hoc_sinh` (`hoc_sinh_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `dang_ky_lop_ibfk_2` FOREIGN KEY (`lop_hoc_id`) REFERENCES `lop_hoc` (`lop_hoc_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `danh_gia`
--
ALTER TABLE `danh_gia`
  ADD CONSTRAINT `danh_gia_ibfk_1` FOREIGN KEY (`phu_huynh_id`) REFERENCES `phu_huynh` (`phu_huynh_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `danh_gia_ibfk_2` FOREIGN KEY (`gia_su_id`) REFERENCES `gia_su` (`gia_su_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `diem_danh`
--
ALTER TABLE `diem_danh`
  ADD CONSTRAINT `diem_danh_ibfk_1` FOREIGN KEY (`lich_hoc_id`) REFERENCES `lich_hoc` (`lich_hoc_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `diem_danh_ibfk_2` FOREIGN KEY (`hoc_sinh_id`) REFERENCES `hoc_sinh` (`hoc_sinh_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `gia_su_mon_hoc`
--
ALTER TABLE `gia_su_mon_hoc`
  ADD CONSTRAINT `gia_su_mon_hoc_ibfk_1` FOREIGN KEY (`gia_su_id`) REFERENCES `gia_su` (`gia_su_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `gia_su_mon_hoc_ibfk_2` FOREIGN KEY (`mon_hoc_id`) REFERENCES `mon_hoc` (`mon_hoc_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `hoc_phi`
--
ALTER TABLE `hoc_phi`
  ADD CONSTRAINT `hoc_phi_ibfk_1` FOREIGN KEY (`dang_ky_id`) REFERENCES `dang_ky_lop` (`dang_ky_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `hoc_sinh`
--
ALTER TABLE `hoc_sinh`
  ADD CONSTRAINT `hoc_sinh_ibfk_1` FOREIGN KEY (`phu_huynh_id`) REFERENCES `phu_huynh` (`phu_huynh_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `lich_hoc`
--
ALTER TABLE `lich_hoc`
  ADD CONSTRAINT `lich_hoc_ibfk_1` FOREIGN KEY (`lop_hoc_id`) REFERENCES `lop_hoc` (`lop_hoc_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `lop_hoc`
--
ALTER TABLE `lop_hoc`
  ADD CONSTRAINT `lop_hoc_ibfk_1` FOREIGN KEY (`gia_su_id`) REFERENCES `gia_su` (`gia_su_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `lop_hoc_ibfk_2` FOREIGN KEY (`mon_hoc_id`) REFERENCES `mon_hoc` (`mon_hoc_id`);

--
-- Các ràng buộc cho bảng `luong_gia_su`
--
ALTER TABLE `luong_gia_su`
  ADD CONSTRAINT `luong_gia_su_ibfk_1` FOREIGN KEY (`gia_su_id`) REFERENCES `gia_su` (`gia_su_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `luong_gia_su_ibfk_2` FOREIGN KEY (`lop_hoc_id`) REFERENCES `lop_hoc` (`lop_hoc_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `yeu_cau`
--
ALTER TABLE `yeu_cau`
  ADD CONSTRAINT `yeu_cau_ibfk_1` FOREIGN KEY (`lop_hoc_id`) REFERENCES `lop_hoc` (`lop_hoc_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `yeu_cau_ibfk_2` FOREIGN KEY (`dang_ky_id`) REFERENCES `dang_ky_lop` (`dang_ky_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `yeu_cau_ibfk_3` FOREIGN KEY (`gia_su_id`) REFERENCES `gia_su` (`gia_su_id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
