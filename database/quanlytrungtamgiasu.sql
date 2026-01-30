-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 30, 2026 at 05:03 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `quanlytrungtamgiasu`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `admin_id` int(11) NOT NULL,
  `ho_ten` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `mat_khau` varchar(255) NOT NULL,
  `so_dien_thoai` varchar(20) DEFAULT NULL,
  `ngay_tao` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`admin_id`, `ho_ten`, `email`, `mat_khau`, `so_dien_thoai`, `ngay_tao`) VALUES
(1, 'Admin 1', 'admin1@giasu.vn', '123', '0900000001', '2026-01-27 15:30:57'),
(2, 'Admin 2', 'admin2@giasu.vn', '123', '0900000002', '2026-01-27 15:30:57'),
(3, 'Admin 3', 'admin3@giasu.vn', '123', '0900000003', '2026-01-27 15:30:57'),
(4, 'Admin 4', 'admin4@giasu.vn', '123', '0900000004', '2026-01-27 15:30:57'),
(5, 'Admin 5', 'admin5@giasu.vn', '123', '0900000005', '2026-01-27 15:30:57'),
(6, 'Admin 6', 'admin6@giasu.vn', '123', '0900000006', '2026-01-27 15:30:57'),
(7, 'Admin 7', 'admin7@giasu.vn', '123', '0900000007', '2026-01-27 15:30:57'),
(8, 'Admin 8', 'admin8@giasu.vn', '123', '0900000008', '2026-01-27 15:30:57'),
(9, 'Admin 9', 'admin9@giasu.vn', '123', '0900000009', '2026-01-27 15:30:57'),
(10, 'Admin 10', 'admin10@giasu.vn', '123', '0900000010', '2026-01-27 15:30:57'),
(11, 'Admin Test', 'admin@test.com', '$2y$10$fa6TPARcg0TUHJkJkGTVnuNnPqL4MOmkFQB0D/11ErxzENl7pXq5.', '0123456789', '2026-01-28 22:41:36'),
(12, 'Admin Test', 'Minhthang123@test.com', '$2y$10$pjgD/BLr2JSLjDozvk7izOpSBiTfjuEAIpHAp.yu95XoBYgeZ3gOi', '0123456789', '2026-01-30 09:29:51');

-- --------------------------------------------------------

--
-- Table structure for table `chi_tiet_doanh_thu_lop`
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `chi_tiet_doanh_thu_lop`
--

INSERT INTO `chi_tiet_doanh_thu_lop` (`chi_tiet_id`, `lop_hoc_id`, `doanh_thu_id`, `thang`, `nam`, `so_hoc_sinh`, `so_buoi_hoc`, `tong_thu`, `tien_tra_gia_su`, `loi_nhuan_lop`, `ngay_tao`) VALUES
(1, 1, 1, 1, 2025, 1, 10, 3000000.00, 2100000.00, 900000.00, '2026-01-27 15:36:21'),
(2, 2, 2, 2, 2025, 1, 8, 3200000.00, 2240000.00, 960000.00, '2026-01-27 15:36:21'),
(3, 3, 3, 3, 2025, 1, 6, 3500000.00, 2625000.00, 875000.00, '2026-01-27 15:36:21'),
(4, 4, 4, 4, 2025, 1, 5, 3600000.00, 2700000.00, 900000.00, '2026-01-27 15:36:21'),
(5, 5, 5, 5, 2025, 1, 4, 2800000.00, 1960000.00, 840000.00, '2026-01-27 15:36:21'),
(6, 6, 6, 6, 2025, 1, 7, 3000000.00, 2100000.00, 900000.00, '2026-01-27 15:36:21'),
(7, 7, 7, 7, 2025, 1, 9, 4000000.00, 3200000.00, 800000.00, '2026-01-27 15:36:21'),
(8, 8, 8, 8, 2025, 1, 6, 3800000.00, 2850000.00, 950000.00, '2026-01-27 15:36:21'),
(9, 9, 9, 9, 2025, 1, 10, 2900000.00, 2030000.00, 870000.00, '2026-01-27 15:36:21'),
(10, 10, 10, 10, 2025, 1, 3, 3100000.00, 2170000.00, 930000.00, '2026-01-27 15:36:21');

-- --------------------------------------------------------

--
-- Table structure for table `dang_ky_lop`
--

CREATE TABLE `dang_ky_lop` (
  `dang_ky_id` int(11) NOT NULL,
  `hoc_sinh_id` int(11) NOT NULL,
  `lop_hoc_id` int(11) NOT NULL,
  `trang_thai` enum('cho_duyet','da_duyet','tu_choi','da_huy') DEFAULT 'cho_duyet',
  `ngay_dang_ky` datetime DEFAULT current_timestamp(),
  `ngay_duyet` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dang_ky_lop`
--

INSERT INTO `dang_ky_lop` (`dang_ky_id`, `hoc_sinh_id`, `lop_hoc_id`, `trang_thai`, `ngay_dang_ky`, `ngay_duyet`) VALUES
(1, 1, 1, 'da_duyet', '2026-01-27 15:34:24', NULL),
(2, 2, 2, 'da_duyet', '2026-01-27 15:34:24', NULL),
(3, 3, 3, 'da_duyet', '2026-01-27 15:34:24', NULL),
(4, 4, 4, 'da_duyet', '2026-01-27 15:34:24', NULL),
(5, 5, 5, 'da_duyet', '2026-01-27 15:34:24', NULL),
(6, 6, 6, 'da_duyet', '2026-01-27 15:34:24', NULL),
(7, 7, 7, 'da_duyet', '2026-01-27 15:34:24', NULL),
(8, 8, 8, 'da_duyet', '2026-01-27 15:34:24', NULL),
(9, 9, 9, 'da_duyet', '2026-01-27 15:34:24', NULL),
(10, 10, 10, 'da_duyet', '2026-01-27 15:34:24', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `danh_gia`
--

CREATE TABLE `danh_gia` (
  `danh_gia_id` int(11) NOT NULL,
  `phu_huynh_id` int(11) NOT NULL,
  `gia_su_id` int(11) NOT NULL,
  `diem_so` int(11) DEFAULT NULL CHECK (`diem_so` between 1 and 5),
  `noi_dung` text DEFAULT NULL,
  `ngay_danh_gia` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `danh_gia`
--

INSERT INTO `danh_gia` (`danh_gia_id`, `phu_huynh_id`, `gia_su_id`, `diem_so`, `noi_dung`, `ngay_danh_gia`) VALUES
(1, 1, 1, 5, 'Rất tốt', '2026-01-27 15:36:02'),
(2, 2, 2, 4, 'Tốt', '2026-01-27 15:36:02'),
(3, 3, 3, 5, 'Dạy dễ hiểu', '2026-01-27 15:36:02'),
(4, 4, 4, 4, 'Ổn', '2026-01-27 15:36:02'),
(5, 5, 5, 3, 'Bình thường', '2026-01-27 15:36:02'),
(6, 6, 6, 5, 'Rất nhiệt tình', '2026-01-27 15:36:02'),
(7, 7, 7, 5, 'Rất giỏi', '2026-01-27 15:36:02'),
(8, 8, 8, 4, 'Tốt', '2026-01-27 15:36:02'),
(9, 9, 9, 4, 'Ổn', '2026-01-27 15:36:02'),
(10, 10, 10, 5, 'Xuất sắc', '2026-01-27 15:36:02');

-- --------------------------------------------------------

--
-- Table structure for table `diem_danh`
--

CREATE TABLE `diem_danh` (
  `diem_danh_id` int(11) NOT NULL,
  `lich_hoc_id` int(11) NOT NULL,
  `hoc_sinh_id` int(11) NOT NULL,
  `tinh_trang` enum('co_mat','vang','vang_co_phep') DEFAULT 'co_mat',
  `ghi_chu` text DEFAULT NULL,
  `ngay_diem_danh` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `diem_danh`
--

INSERT INTO `diem_danh` (`diem_danh_id`, `lich_hoc_id`, `hoc_sinh_id`, `tinh_trang`, `ghi_chu`, `ngay_diem_danh`) VALUES
(1, 1, 1, 'co_mat', NULL, '2026-01-27 15:34:38'),
(2, 2, 2, 'co_mat', NULL, '2026-01-27 15:34:38'),
(3, 3, 3, 'co_mat', NULL, '2026-01-27 15:34:38'),
(4, 4, 4, 'co_mat', NULL, '2026-01-27 15:34:38'),
(5, 5, 5, 'vang', NULL, '2026-01-27 15:34:38'),
(6, 6, 6, 'co_mat', NULL, '2026-01-27 15:34:38'),
(7, 7, 7, 'co_mat', NULL, '2026-01-27 15:34:38'),
(8, 8, 8, 'vang_co_phep', NULL, '2026-01-27 15:34:38'),
(9, 9, 9, 'co_mat', NULL, '2026-01-27 15:34:38'),
(10, 10, 10, 'co_mat', NULL, '2026-01-27 15:34:38');

-- --------------------------------------------------------

--
-- Table structure for table `doanh_thu_thang`
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `doanh_thu_thang`
--

INSERT INTO `doanh_thu_thang` (`doanh_thu_id`, `thang`, `nam`, `tong_thu_hoc_phi`, `tong_tra_gia_su`, `loi_nhuan`, `so_luong_lop`, `so_luong_hoc_sinh`, `ngay_cap_nhat`) VALUES
(1, 1, 2025, 30000000.00, 22000000.00, 8000000.00, 10, 10, '2026-01-27 15:36:09'),
(2, 2, 2025, 28000000.00, 20000000.00, 8000000.00, 9, 9, '2026-01-27 15:36:09'),
(3, 3, 2025, 32000000.00, 23000000.00, 9000000.00, 10, 10, '2026-01-27 15:36:09'),
(4, 4, 2025, 31000000.00, 22500000.00, 8500000.00, 10, 10, '2026-01-27 15:36:09'),
(5, 5, 2025, 33000000.00, 24000000.00, 9000000.00, 10, 10, '2026-01-27 15:36:09'),
(6, 6, 2025, 34000000.00, 25000000.00, 9000000.00, 10, 10, '2026-01-27 15:36:09'),
(7, 7, 2025, 35000000.00, 26000000.00, 9000000.00, 10, 10, '2026-01-27 15:36:09'),
(8, 8, 2025, 36000000.00, 27000000.00, 9000000.00, 10, 10, '2026-01-27 15:36:09'),
(9, 9, 2025, 37000000.00, 28000000.00, 9000000.00, 10, 10, '2026-01-27 15:36:09'),
(10, 10, 2025, 38000000.00, 29000000.00, 9000000.00, 10, 10, '2026-01-27 15:36:09');

-- --------------------------------------------------------

--
-- Table structure for table `gia_su`
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
  `chung_chi` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`chung_chi`)),
  `gioi_thieu` text DEFAULT NULL,
  `kinh_nghiem` text DEFAULT NULL,
  `so_tai_khoan_ngan_hang` varchar(50) DEFAULT NULL,
  `diem_danh_gia_trung_binh` decimal(3,2) DEFAULT 0.00,
  `trang_thai` enum('cho_duyet','da_duyet','tu_choi','khoa') DEFAULT 'cho_duyet',
  `ngay_dang_ky` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `gia_su`
--

INSERT INTO `gia_su` (`gia_su_id`, `ho_ten`, `ngay_sinh`, `gioi_tinh`, `so_dien_thoai`, `email`, `mat_khau`, `dia_chi`, `anh_dai_dien`, `bang_cap`, `chung_chi`, `gioi_thieu`, `kinh_nghiem`, `so_tai_khoan_ngan_hang`, `diem_danh_gia_trung_binh`, `trang_thai`, `ngay_dang_ky`) VALUES
(1, 'Nguyễn Văn A', NULL, NULL, '0920000001', 'gs1@gmail.com', '123', NULL, NULL, 'Cử nhân', NULL, NULL, '3 năm', NULL, 0.00, 'da_duyet', '2026-01-27 15:31:32'),
(2, 'Lê Văn C', NULL, NULL, '0920000002', 'gs2@gmail.com', '123', NULL, NULL, 'Cử nhân', NULL, NULL, '4 năm', NULL, 0.00, 'da_duyet', '2026-01-27 15:31:32'),
(3, 'Lý Gia T', NULL, NULL, '0920000003', 'gs3@gmail.com', '123', NULL, NULL, 'Thạc sĩ', NULL, NULL, '5 năm', NULL, 0.00, 'da_duyet', '2026-01-27 15:31:32'),
(4, 'Nguyễn Văn D', NULL, NULL, '0920000004', 'gs4@gmail.com', '123', NULL, NULL, 'Thạc sĩ', NULL, NULL, '6 năm', NULL, 0.00, 'da_duyet', '2026-01-27 15:31:32'),
(5, 'Nguyễn Văn G', NULL, NULL, '0920000005', 'gs5@gmail.com', '123', NULL, NULL, 'Cử nhân', NULL, NULL, '2 năm', NULL, 0.00, 'da_duyet', '2026-01-27 15:31:32'),
(6, 'Hoàng Sỹ T', NULL, NULL, '0920000006', 'gs6@gmail.com', '123', NULL, NULL, 'Cử nhân', NULL, NULL, '3 năm', NULL, 0.00, 'da_duyet', '2026-01-27 15:31:32'),
(7, 'Lý Hoàng N', NULL, NULL, '0920000007', 'gs7@gmail.com', '123', NULL, NULL, 'Thạc sĩ', NULL, NULL, '7 năm', NULL, 0.00, 'da_duyet', '2026-01-27 15:31:32'),
(8, 'Nguyễn Thị T', NULL, NULL, '0920000008', 'gs8@gmail.com', '123', NULL, NULL, 'Cử nhân', NULL, NULL, '4 năm', NULL, 0.00, 'da_duyet', '2026-01-27 15:31:32'),
(9, 'Hoàng Văn D', NULL, NULL, '0920000009', 'gs9@gmail.com', '123', NULL, NULL, 'Thạc sĩ', NULL, NULL, '6 năm', NULL, 0.00, 'da_duyet', '2026-01-27 15:31:32'),
(10, 'Nguyễn Thị Bích T', NULL, NULL, '0920000010', 'gs10@gmail.com', '123', NULL, NULL, 'Cử nhân', NULL, NULL, '5 năm', NULL, 0.00, 'da_duyet', '2026-01-27 15:31:32');

-- --------------------------------------------------------

--
-- Table structure for table `gia_su_mon_hoc`
--

CREATE TABLE `gia_su_mon_hoc` (
  `gia_su_mon_hoc_id` int(11) NOT NULL,
  `gia_su_id` int(11) NOT NULL,
  `mon_hoc_id` int(11) NOT NULL,
  `trinh_do` varchar(100) DEFAULT NULL,
  `kinh_nghiem_nam` int(11) DEFAULT NULL,
  `ghi_chu` text DEFAULT NULL,
  `ngay_them` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `gia_su_mon_hoc`
--

INSERT INTO `gia_su_mon_hoc` (`gia_su_mon_hoc_id`, `gia_su_id`, `mon_hoc_id`, `trinh_do`, `kinh_nghiem_nam`, `ghi_chu`, `ngay_them`) VALUES
(1, 1, 1, 'Cử nhân', 3, NULL, '2026-01-27 15:33:23'),
(2, 2, 2, 'Cử nhân', 4, NULL, '2026-01-27 15:33:23'),
(3, 3, 3, 'Thạc sĩ', 5, NULL, '2026-01-27 15:33:23'),
(4, 4, 4, 'Thạc sĩ', 6, NULL, '2026-01-27 15:33:23'),
(5, 5, 5, 'Cử nhân', 2, NULL, '2026-01-27 15:33:23'),
(6, 6, 6, 'Cử nhân', 3, NULL, '2026-01-27 15:33:23'),
(7, 7, 7, 'Thạc sĩ', 7, NULL, '2026-01-27 15:33:23'),
(8, 8, 8, 'Cử nhân', 4, NULL, '2026-01-27 15:33:23'),
(9, 9, 9, 'Thạc sĩ', 6, NULL, '2026-01-27 15:33:23'),
(10, 10, 10, 'Cử nhân', 5, NULL, '2026-01-27 15:33:23');

-- --------------------------------------------------------

--
-- Table structure for table `hoc_phi`
--

CREATE TABLE `hoc_phi` (
  `hoc_phi_id` int(11) NOT NULL,
  `dang_ky_id` int(11) NOT NULL,
  `so_tien` decimal(10,2) NOT NULL,
  `so_buoi_da_hoc` int(11) DEFAULT 0,
  `trang_thai_thanh_toan` enum('chua_thanh_toan','da_thanh_toan','qua_han') DEFAULT 'chua_thanh_toan',
  `ngay_thanh_toan` date DEFAULT NULL,
  `ngay_tao` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hoc_phi`
--

INSERT INTO `hoc_phi` (`hoc_phi_id`, `dang_ky_id`, `so_tien`, `so_buoi_da_hoc`, `trang_thai_thanh_toan`, `ngay_thanh_toan`, `ngay_tao`) VALUES
(1, 1, 3000000.00, 10, 'da_thanh_toan', NULL, '2026-01-27 15:35:17'),
(2, 2, 3200000.00, 8, 'da_thanh_toan', NULL, '2026-01-27 15:35:17'),
(3, 3, 3500000.00, 6, 'chua_thanh_toan', NULL, '2026-01-27 15:35:17'),
(4, 4, 3600000.00, 5, 'chua_thanh_toan', NULL, '2026-01-27 15:35:17'),
(5, 5, 2800000.00, 4, 'da_thanh_toan', NULL, '2026-01-27 15:35:17'),
(6, 6, 3000000.00, 7, 'da_thanh_toan', NULL, '2026-01-27 15:35:17'),
(7, 7, 4000000.00, 9, 'qua_han', NULL, '2026-01-27 15:35:17'),
(8, 8, 3800000.00, 6, 'chua_thanh_toan', NULL, '2026-01-27 15:35:17'),
(9, 9, 2900000.00, 10, 'da_thanh_toan', NULL, '2026-01-27 15:35:17'),
(10, 10, 3100000.00, 3, 'chua_thanh_toan', NULL, '2026-01-27 15:35:17');

-- --------------------------------------------------------

--
-- Table structure for table `hoc_sinh`
--

CREATE TABLE `hoc_sinh` (
  `hoc_sinh_id` int(11) NOT NULL,
  `phu_huynh_id` int(11) NOT NULL,
  `ho_ten` varchar(255) NOT NULL,
  `ngay_sinh` date DEFAULT NULL,
  `khoi_lop` varchar(20) DEFAULT NULL,
  `ngay_tao` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hoc_sinh`
--

INSERT INTO `hoc_sinh` (`hoc_sinh_id`, `phu_huynh_id`, `ho_ten`, `ngay_sinh`, `khoi_lop`, `ngay_tao`) VALUES
(1, 1, 'Học sinh 1', '2012-01-01', '6', '2026-01-27 15:33:04'),
(2, 2, 'Học sinh 2', '2011-01-01', '7', '2026-01-27 15:33:04'),
(3, 3, 'Học sinh 3', '2010-01-01', '8', '2026-01-27 15:33:04'),
(4, 4, 'Học sinh 4', '2012-02-01', '6', '2026-01-27 15:33:04'),
(5, 5, 'Học sinh 5', '2011-02-01', '7', '2026-01-27 15:33:04'),
(6, 6, 'Học sinh 6', '2010-02-01', '8', '2026-01-27 15:33:04'),
(7, 7, 'Học sinh 7', '2012-03-01', '6', '2026-01-27 15:33:04'),
(8, 8, 'Học sinh 8', '2011-03-01', '7', '2026-01-27 15:33:04'),
(9, 9, 'Học sinh 9', '2010-03-01', '8', '2026-01-27 15:33:04'),
(10, 10, 'Học sinh 10', '2012-04-01', '6', '2026-01-27 15:33:04');

-- --------------------------------------------------------

--
-- Table structure for table `lich_hoc`
--

CREATE TABLE `lich_hoc` (
  `lich_hoc_id` int(11) NOT NULL,
  `lop_hoc_id` int(11) NOT NULL,
  `ngay_hoc` date NOT NULL,
  `gio_bat_dau` time NOT NULL,
  `gio_ket_thuc` time NOT NULL,
  `trang_thai` enum('chua_hoc','da_hoc','huy') DEFAULT 'chua_hoc'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lich_hoc`
--

INSERT INTO `lich_hoc` (`lich_hoc_id`, `lop_hoc_id`, `ngay_hoc`, `gio_bat_dau`, `gio_ket_thuc`, `trang_thai`) VALUES
(1, 1, '2025-01-01', '18:00:00', '19:30:00', 'chua_hoc'),
(2, 2, '2025-01-02', '18:00:00', '19:30:00', 'chua_hoc'),
(3, 3, '2025-01-03', '18:00:00', '19:30:00', 'chua_hoc'),
(4, 4, '2025-01-04', '18:00:00', '19:30:00', 'chua_hoc'),
(5, 5, '2025-01-05', '18:00:00', '19:30:00', 'chua_hoc'),
(6, 6, '2025-01-06', '18:00:00', '19:30:00', 'chua_hoc'),
(7, 7, '2025-01-07', '18:00:00', '19:30:00', 'chua_hoc'),
(8, 8, '2025-01-08', '18:00:00', '19:30:00', 'chua_hoc'),
(9, 9, '2025-01-09', '18:00:00', '19:30:00', 'chua_hoc'),
(10, 10, '2025-01-10', '18:00:00', '19:30:00', 'chua_hoc');

-- --------------------------------------------------------

--
-- Table structure for table `lop_hoc`
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
  `loai_chi_tra` enum('phan_tram','tien_cu_the') DEFAULT 'phan_tram',
  `gia_tri_chi_tra` decimal(10,2) DEFAULT NULL,
  `chu_ky_thanh_toan` varchar(20) DEFAULT 'theo_thang',
  `trang_thai` enum('sap_mo','dang_hoc','ket_thuc','dong') DEFAULT 'sap_mo',
  `ngay_tao` datetime DEFAULT current_timestamp(),
  `ngay_ket_thuc` datetime DEFAULT NULL
) ;

--
-- Dumping data for table `lop_hoc`
--

INSERT INTO `lop_hoc` (`lop_hoc_id`, `gia_su_id`, `mon_hoc_id`, `khoi_lop`, `gia_toan_khoa`, `so_buoi_hoc`, `gia_moi_buoi`, `so_luong_toi_da`, `so_luong_hien_tai`, `loai_chi_tra`, `gia_tri_chi_tra`, `chu_ky_thanh_toan`, `trang_thai`, `ngay_tao`, `ngay_ket_thuc`) VALUES
(1, 1, 1, '6', 3000000.00, 20, 150000.00, 1, 0, 'phan_tram', 70.00, 'theo_thang', 'dang_hoc', '2026-01-27 15:33:32', NULL),
(2, 2, 2, '7', 3200000.00, 20, 160000.00, 1, 0, 'phan_tram', 70.00, 'theo_thang', 'dang_hoc', '2026-01-27 15:33:32', NULL),
(3, 3, 3, '8', 3500000.00, 20, 175000.00, 1, 0, 'phan_tram', 75.00, 'theo_thang', 'dang_hoc', '2026-01-27 15:33:32', NULL),
(4, 4, 4, '9', 3600000.00, 20, 180000.00, 1, 0, 'phan_tram', 75.00, 'theo_thang', 'dang_hoc', '2026-01-27 15:33:32', NULL),
(5, 5, 5, '6', 2800000.00, 20, 140000.00, 1, 0, 'phan_tram', 70.00, 'theo_thang', 'dang_hoc', '2026-01-27 15:33:32', NULL),
(6, 6, 6, '7', 3000000.00, 20, 150000.00, 1, 0, 'phan_tram', 70.00, 'theo_thang', 'dang_hoc', '2026-01-27 15:33:32', NULL),
(7, 7, 7, '8', 4000000.00, 20, 200000.00, 1, 0, 'phan_tram', 80.00, 'theo_thang', 'dang_hoc', '2026-01-27 15:33:32', NULL),
(8, 8, 8, '9', 3800000.00, 20, 190000.00, 1, 0, 'phan_tram', 75.00, 'theo_thang', 'dang_hoc', '2026-01-27 15:33:32', NULL),
(9, 9, 9, '6', 2900000.00, 20, 145000.00, 1, 0, 'phan_tram', 70.00, 'theo_thang', 'dang_hoc', '2026-01-27 15:33:32', NULL),
(10, 10, 10, '7', 3100000.00, 20, 155000.00, 1, 0, 'phan_tram', 70.00, 'theo_thang', 'dang_hoc', '2026-01-27 15:33:32', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `luong_gia_su`
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `luong_gia_su`
--

INSERT INTO `luong_gia_su` (`luong_id`, `gia_su_id`, `lop_hoc_id`, `thang`, `nam`, `so_buoi_day`, `tong_tien_thu`, `tien_tra_gia_su`, `loai_chi_tra`, `gia_tri_ap_dung`, `trang_thai_thanh_toan`, `ngay_thanh_toan`, `ngay_tao`) VALUES
(1, 1, 1, 1, 2025, 10, 3000000.00, 2100000.00, 'phan_tram', 70.00, 'chua_thanh_toan', NULL, '2026-01-27 15:35:39'),
(2, 2, 2, 1, 2025, 8, 3200000.00, 2240000.00, 'phan_tram', 70.00, 'chua_thanh_toan', NULL, '2026-01-27 15:35:39'),
(3, 3, 3, 1, 2025, 6, 3500000.00, 2625000.00, 'phan_tram', 75.00, 'chua_thanh_toan', NULL, '2026-01-27 15:35:39'),
(4, 4, 4, 1, 2025, 5, 3600000.00, 2700000.00, 'phan_tram', 75.00, 'chua_thanh_toan', NULL, '2026-01-27 15:35:39'),
(5, 5, 5, 1, 2025, 4, 2800000.00, 1960000.00, 'phan_tram', 70.00, 'chua_thanh_toan', NULL, '2026-01-27 15:35:39'),
(6, 6, 6, 1, 2025, 7, 3000000.00, 2100000.00, 'phan_tram', 70.00, 'chua_thanh_toan', NULL, '2026-01-27 15:35:39'),
(7, 7, 7, 1, 2025, 9, 4000000.00, 3200000.00, 'phan_tram', 80.00, 'chua_thanh_toan', NULL, '2026-01-27 15:35:39'),
(8, 8, 8, 1, 2025, 6, 3800000.00, 2850000.00, 'phan_tram', 75.00, 'chua_thanh_toan', NULL, '2026-01-27 15:35:39'),
(9, 9, 9, 1, 2025, 10, 2900000.00, 2030000.00, 'phan_tram', 70.00, 'chua_thanh_toan', NULL, '2026-01-27 15:35:39'),
(10, 10, 10, 1, 2025, 3, 3100000.00, 2170000.00, 'phan_tram', 70.00, 'chua_thanh_toan', NULL, '2026-01-27 15:35:39');

-- --------------------------------------------------------

--
-- Table structure for table `mon_hoc`
--

CREATE TABLE `mon_hoc` (
  `mon_hoc_id` int(11) NOT NULL,
  `ten_mon_hoc` varchar(100) NOT NULL,
  `mo_ta` text DEFAULT NULL,
  `trang_thai` enum('hoat_dong','khong_hoat_dong') DEFAULT 'hoat_dong',
  `ngay_tao` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mon_hoc`
--

INSERT INTO `mon_hoc` (`mon_hoc_id`, `ten_mon_hoc`, `mo_ta`, `trang_thai`, `ngay_tao`) VALUES
(1, 'Toán', NULL, 'hoat_dong', '2026-01-27 15:33:13'),
(2, 'Văn', NULL, 'hoat_dong', '2026-01-27 15:33:13'),
(3, 'Anh', NULL, 'hoat_dong', '2026-01-27 15:33:13'),
(4, 'Lý', NULL, 'hoat_dong', '2026-01-27 15:33:13'),
(5, 'Hóa', NULL, 'hoat_dong', '2026-01-27 15:33:13'),
(6, 'Sinh', NULL, 'hoat_dong', '2026-01-27 15:33:13'),
(7, 'Sử', NULL, 'hoat_dong', '2026-01-27 15:33:13'),
(8, 'Địa', NULL, 'hoat_dong', '2026-01-27 15:33:13'),
(9, 'Tin', NULL, 'hoat_dong', '2026-01-27 15:33:13'),
(10, 'GDCD', NULL, 'hoat_dong', '2026-01-27 15:33:13');

-- --------------------------------------------------------

--
-- Table structure for table `phu_huynh`
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `phu_huynh`
--

INSERT INTO `phu_huynh` (`phu_huynh_id`, `ho_ten`, `so_dien_thoai`, `email`, `mat_khau`, `dia_chi`, `trang_thai`, `ngay_dang_ky`) VALUES
(1, 'Phụ huynh 1', '0910000001', 'ph1@gmail.com', '123', 'HN', 'da_duyet', '2026-01-27 15:31:25'),
(2, 'Phụ huynh 2', '0910000002', 'ph2@gmail.com', '123', 'HN', 'da_duyet', '2026-01-27 15:31:25'),
(3, 'Phụ huynh 3', '0910000003', 'ph3@gmail.com', '123', 'HCM', 'da_duyet', '2026-01-27 15:31:25'),
(4, 'Phụ huynh 4', '0910000004', 'ph4@gmail.com', '123', 'HCM', 'da_duyet', '2026-01-27 15:31:25'),
(5, 'Phụ huynh 5', '0910000005', 'ph5@gmail.com', '123', 'DN', 'da_duyet', '2026-01-27 15:31:25'),
(6, 'Phụ huynh 6', '0910000006', 'ph6@gmail.com', '123', 'DN', 'da_duyet', '2026-01-27 15:31:25'),
(7, 'Phụ huynh 7', '0910000007', 'ph7@gmail.com', '123', 'CT', 'da_duyet', '2026-01-27 15:31:25'),
(8, 'Phụ huynh 8', '0910000008', 'ph8@gmail.com', '123', 'CT', 'da_duyet', '2026-01-27 15:31:25'),
(9, 'Phụ huynh 9', '0910000009', 'ph9@gmail.com', '123', 'HN', 'da_duyet', '2026-01-27 15:31:25'),
(10, 'Phụ huynh 10', '0910000010', 'ph10@gmail.com', '123', 'HN', 'da_duyet', '2026-01-27 15:31:25');

-- --------------------------------------------------------

--
-- Table structure for table `thong_bao`
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `thong_bao`
--

INSERT INTO `thong_bao` (`thong_bao_id`, `nguoi_gui_id`, `loai_nguoi_gui`, `nguoi_nhan_id`, `loai_nguoi_nhan`, `loai_thong_bao`, `tieu_de`, `noi_dung`, `lien_ket_id`, `lien_ket_loai`, `da_doc`, `ngay_tao`) VALUES
(1, 1, 'admin', 1, 'gia_su', 'he_thong', 'Duyệt hồ sơ', 'Hồ sơ đã duyệt', NULL, NULL, 0, '2026-01-27 15:35:47'),
(2, 1, 'admin', 2, 'gia_su', 'he_thong', 'Duyệt hồ sơ', 'Hồ sơ đã duyệt', NULL, NULL, 0, '2026-01-27 15:35:47'),
(3, 1, 'admin', 3, 'gia_su', 'he_thong', 'Duyệt hồ sơ', 'Hồ sơ đã duyệt', NULL, NULL, 0, '2026-01-27 15:35:47'),
(4, 1, 'admin', 4, 'gia_su', 'he_thong', 'Duyệt hồ sơ', 'Hồ sơ đã duyệt', NULL, NULL, 0, '2026-01-27 15:35:47'),
(5, 1, 'admin', 5, 'gia_su', 'he_thong', 'Duyệt hồ sơ', 'Hồ sơ đã duyệt', NULL, NULL, 0, '2026-01-27 15:35:47'),
(6, 1, 'admin', 6, 'gia_su', 'he_thong', 'Duyệt hồ sơ', 'Hồ sơ đã duyệt', NULL, NULL, 0, '2026-01-27 15:35:47'),
(7, 1, 'admin', 7, 'gia_su', 'he_thong', 'Duyệt hồ sơ', 'Hồ sơ đã duyệt', NULL, NULL, 0, '2026-01-27 15:35:47'),
(8, 1, 'admin', 8, 'gia_su', 'he_thong', 'Duyệt hồ sơ', 'Hồ sơ đã duyệt', NULL, NULL, 0, '2026-01-27 15:35:47'),
(9, 1, 'admin', 9, 'gia_su', 'he_thong', 'Duyệt hồ sơ', 'Hồ sơ đã duyệt', NULL, NULL, 0, '2026-01-27 15:35:47'),
(10, 1, 'admin', 10, 'gia_su', 'he_thong', 'Duyệt hồ sơ', 'Hồ sơ đã duyệt', NULL, NULL, 0, '2026-01-27 15:35:47');

-- --------------------------------------------------------

--
-- Table structure for table `tin_nhan`
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tin_nhan`
--

INSERT INTO `tin_nhan` (`tin_nhan_id`, `nguoi_gui_id`, `loai_nguoi_gui`, `nguoi_nhan_id`, `loai_nguoi_nhan`, `noi_dung`, `da_doc`, `ngay_gui`) VALUES
(1, 1, 'phu_huynh', 1, 'gia_su', 'Thầy cho hỏi lịch học', 0, '2026-01-27 15:35:55'),
(2, 2, 'phu_huynh', 2, 'gia_su', 'Em hỏi bài', 0, '2026-01-27 15:35:55'),
(3, 3, 'phu_huynh', 3, 'gia_su', 'Con em học ổn', 0, '2026-01-27 15:35:55'),
(4, 4, 'phu_huynh', 4, 'gia_su', 'Xin đổi giờ', 0, '2026-01-27 15:35:55'),
(5, 5, 'phu_huynh', 5, 'gia_su', 'Học phí thế nào', 0, '2026-01-27 15:35:55'),
(6, 6, 'phu_huynh', 6, 'gia_su', 'Nhờ thầy hỗ trợ', 0, '2026-01-27 15:35:55'),
(7, 7, 'phu_huynh', 7, 'gia_su', 'Con hơi yếu', 0, '2026-01-27 15:35:55'),
(8, 8, 'phu_huynh', 8, 'gia_su', 'Xin nghỉ buổi', 0, '2026-01-27 15:35:55'),
(9, 9, 'phu_huynh', 9, 'gia_su', 'Cảm ơn thầy', 0, '2026-01-27 15:35:55'),
(10, 10, 'phu_huynh', 10, 'gia_su', 'Hỏi lịch thi', 0, '2026-01-27 15:35:55');

-- --------------------------------------------------------

--
-- Table structure for table `yeu_cau`
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `yeu_cau`
--

INSERT INTO `yeu_cau` (`yeu_cau_id`, `nguoi_tao_id`, `loai_nguoi_tao`, `phan_loai`, `tieu_de`, `noi_dung`, `lop_hoc_id`, `dang_ky_id`, `gia_su_id`, `trang_thai`, `nguoi_xu_ly_id`, `ghi_chu_xu_ly`, `ngay_tao`, `ngay_xu_ly`) VALUES
(1, 1, 'gia_su', 'nghi_day', 'Xin nghỉ', 'Xin nghỉ buổi 1', 1, NULL, NULL, 'cho_duyet', NULL, NULL, '2026-01-27 15:35:10', NULL),
(2, 2, 'gia_su', 'nghi_day', 'Xin nghỉ', 'Xin nghỉ buổi 2', 2, NULL, NULL, 'da_duyet', NULL, NULL, '2026-01-27 15:35:10', NULL),
(3, 3, 'gia_su', 'huy_lop', 'Hủy lớp', 'Lớp ít học sinh', 3, NULL, NULL, 'dang_xu_ly', NULL, NULL, '2026-01-27 15:35:10', NULL),
(4, 4, 'gia_su', 'khac', 'Đề xuất', 'Đổi giờ học', 4, NULL, NULL, 'cho_duyet', NULL, NULL, '2026-01-27 15:35:10', NULL),
(5, 5, 'phu_huynh', 'khac', 'Phản hồi', 'Xin đổi gia sư', 5, NULL, NULL, 'cho_duyet', NULL, NULL, '2026-01-27 15:35:10', NULL),
(6, 6, 'phu_huynh', 'khac', 'Góp ý', 'Dạy hơi nhanh', 6, NULL, NULL, 'da_duyet', NULL, NULL, '2026-01-27 15:35:10', NULL),
(7, 7, 'gia_su', 'mo_lop', 'Mở lớp', 'Mở lớp mới', 7, NULL, NULL, 'da_duyet', NULL, NULL, '2026-01-27 15:35:10', NULL),
(8, 8, 'gia_su', 'khac', 'Thiết bị', 'Thiếu tài liệu', 8, NULL, NULL, 'dang_xu_ly', NULL, NULL, '2026-01-27 15:35:10', NULL),
(9, 9, 'phu_huynh', 'khac', 'Học phí', 'Hỏi học phí', 9, NULL, NULL, 'da_hoan_thanh', NULL, NULL, '2026-01-27 15:35:10', NULL),
(10, 10, 'gia_su', 'khac', 'Khác', 'Yêu cầu khác', 10, NULL, NULL, 'tu_choi', NULL, NULL, '2026-01-27 15:35:10', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`admin_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `chi_tiet_doanh_thu_lop`
--
ALTER TABLE `chi_tiet_doanh_thu_lop`
  ADD PRIMARY KEY (`chi_tiet_id`),
  ADD UNIQUE KEY `uq_ctdt` (`lop_hoc_id`,`thang`,`nam`),
  ADD KEY `doanh_thu_id` (`doanh_thu_id`);

--
-- Indexes for table `dang_ky_lop`
--
ALTER TABLE `dang_ky_lop`
  ADD PRIMARY KEY (`dang_ky_id`),
  ADD UNIQUE KEY `uq_hs_lh` (`hoc_sinh_id`,`lop_hoc_id`),
  ADD KEY `lop_hoc_id` (`lop_hoc_id`),
  ADD KEY `trang_thai` (`trang_thai`);

--
-- Indexes for table `danh_gia`
--
ALTER TABLE `danh_gia`
  ADD PRIMARY KEY (`danh_gia_id`),
  ADD KEY `phu_huynh_id` (`phu_huynh_id`,`gia_su_id`),
  ADD KEY `gia_su_id` (`gia_su_id`);

--
-- Indexes for table `diem_danh`
--
ALTER TABLE `diem_danh`
  ADD PRIMARY KEY (`diem_danh_id`),
  ADD UNIQUE KEY `uq_dd` (`lich_hoc_id`,`hoc_sinh_id`),
  ADD KEY `hoc_sinh_id` (`hoc_sinh_id`);

--
-- Indexes for table `doanh_thu_thang`
--
ALTER TABLE `doanh_thu_thang`
  ADD PRIMARY KEY (`doanh_thu_id`),
  ADD UNIQUE KEY `uq_doanh_thu` (`thang`,`nam`);

--
-- Indexes for table `gia_su`
--
ALTER TABLE `gia_su`
  ADD PRIMARY KEY (`gia_su_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `email_2` (`email`),
  ADD KEY `trang_thai` (`trang_thai`);

--
-- Indexes for table `gia_su_mon_hoc`
--
ALTER TABLE `gia_su_mon_hoc`
  ADD PRIMARY KEY (`gia_su_mon_hoc_id`),
  ADD UNIQUE KEY `uq_gs_mh` (`gia_su_id`,`mon_hoc_id`),
  ADD KEY `mon_hoc_id` (`mon_hoc_id`);

--
-- Indexes for table `hoc_phi`
--
ALTER TABLE `hoc_phi`
  ADD PRIMARY KEY (`hoc_phi_id`),
  ADD KEY `trang_thai_thanh_toan` (`trang_thai_thanh_toan`),
  ADD KEY `dang_ky_id` (`dang_ky_id`);

--
-- Indexes for table `hoc_sinh`
--
ALTER TABLE `hoc_sinh`
  ADD PRIMARY KEY (`hoc_sinh_id`),
  ADD KEY `phu_huynh_id` (`phu_huynh_id`);

--
-- Indexes for table `lich_hoc`
--
ALTER TABLE `lich_hoc`
  ADD PRIMARY KEY (`lich_hoc_id`),
  ADD KEY `ngay_hoc` (`ngay_hoc`),
  ADD KEY `lop_hoc_id` (`lop_hoc_id`),
  ADD KEY `trang_thai` (`trang_thai`);

--
-- Indexes for table `lop_hoc`
--
ALTER TABLE `lop_hoc`
  ADD PRIMARY KEY (`lop_hoc_id`),
  ADD KEY `trang_thai` (`trang_thai`),
  ADD KEY `mon_hoc_id` (`mon_hoc_id`),
  ADD KEY `gia_su_id` (`gia_su_id`);

--
-- Indexes for table `luong_gia_su`
--
ALTER TABLE `luong_gia_su`
  ADD PRIMARY KEY (`luong_id`),
  ADD UNIQUE KEY `uq_luong` (`gia_su_id`,`lop_hoc_id`,`thang`,`nam`),
  ADD KEY `lop_hoc_id` (`lop_hoc_id`),
  ADD KEY `trang_thai_thanh_toan` (`trang_thai_thanh_toan`),
  ADD KEY `thang` (`thang`,`nam`);

--
-- Indexes for table `mon_hoc`
--
ALTER TABLE `mon_hoc`
  ADD PRIMARY KEY (`mon_hoc_id`),
  ADD UNIQUE KEY `ten_mon_hoc` (`ten_mon_hoc`),
  ADD KEY `trang_thai` (`trang_thai`);

--
-- Indexes for table `phu_huynh`
--
ALTER TABLE `phu_huynh`
  ADD PRIMARY KEY (`phu_huynh_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `email_2` (`email`),
  ADD KEY `trang_thai` (`trang_thai`);

--
-- Indexes for table `thong_bao`
--
ALTER TABLE `thong_bao`
  ADD PRIMARY KEY (`thong_bao_id`),
  ADD KEY `nguoi_nhan_id` (`nguoi_nhan_id`),
  ADD KEY `da_doc` (`da_doc`),
  ADD KEY `loai_thong_bao` (`loai_thong_bao`),
  ADD KEY `ngay_tao` (`ngay_tao`);

--
-- Indexes for table `tin_nhan`
--
ALTER TABLE `tin_nhan`
  ADD PRIMARY KEY (`tin_nhan_id`),
  ADD KEY `nguoi_nhan_id` (`nguoi_nhan_id`),
  ADD KEY `da_doc` (`da_doc`),
  ADD KEY `ngay_gui` (`ngay_gui`);

--
-- Indexes for table `yeu_cau`
--
ALTER TABLE `yeu_cau`
  ADD PRIMARY KEY (`yeu_cau_id`),
  ADD KEY `lop_hoc_id` (`lop_hoc_id`),
  ADD KEY `dang_ky_id` (`dang_ky_id`),
  ADD KEY `gia_su_id` (`gia_su_id`),
  ADD KEY `phan_loai` (`phan_loai`),
  ADD KEY `trang_thai` (`trang_thai`),
  ADD KEY `nguoi_tao_id` (`nguoi_tao_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `admin_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `chi_tiet_doanh_thu_lop`
--
ALTER TABLE `chi_tiet_doanh_thu_lop`
  MODIFY `chi_tiet_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `dang_ky_lop`
--
ALTER TABLE `dang_ky_lop`
  MODIFY `dang_ky_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `danh_gia`
--
ALTER TABLE `danh_gia`
  MODIFY `danh_gia_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `diem_danh`
--
ALTER TABLE `diem_danh`
  MODIFY `diem_danh_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `doanh_thu_thang`
--
ALTER TABLE `doanh_thu_thang`
  MODIFY `doanh_thu_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `gia_su`
--
ALTER TABLE `gia_su`
  MODIFY `gia_su_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `gia_su_mon_hoc`
--
ALTER TABLE `gia_su_mon_hoc`
  MODIFY `gia_su_mon_hoc_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `hoc_phi`
--
ALTER TABLE `hoc_phi`
  MODIFY `hoc_phi_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `hoc_sinh`
--
ALTER TABLE `hoc_sinh`
  MODIFY `hoc_sinh_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `lich_hoc`
--
ALTER TABLE `lich_hoc`
  MODIFY `lich_hoc_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `lop_hoc`
--
ALTER TABLE `lop_hoc`
  MODIFY `lop_hoc_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `luong_gia_su`
--
ALTER TABLE `luong_gia_su`
  MODIFY `luong_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `mon_hoc`
--
ALTER TABLE `mon_hoc`
  MODIFY `mon_hoc_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `phu_huynh`
--
ALTER TABLE `phu_huynh`
  MODIFY `phu_huynh_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `thong_bao`
--
ALTER TABLE `thong_bao`
  MODIFY `thong_bao_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `tin_nhan`
--
ALTER TABLE `tin_nhan`
  MODIFY `tin_nhan_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `yeu_cau`
--
ALTER TABLE `yeu_cau`
  MODIFY `yeu_cau_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `chi_tiet_doanh_thu_lop`
--
ALTER TABLE `chi_tiet_doanh_thu_lop`
  ADD CONSTRAINT `chi_tiet_doanh_thu_lop_ibfk_1` FOREIGN KEY (`lop_hoc_id`) REFERENCES `lop_hoc` (`lop_hoc_id`),
  ADD CONSTRAINT `chi_tiet_doanh_thu_lop_ibfk_2` FOREIGN KEY (`doanh_thu_id`) REFERENCES `doanh_thu_thang` (`doanh_thu_id`);

--
-- Constraints for table `dang_ky_lop`
--
ALTER TABLE `dang_ky_lop`
  ADD CONSTRAINT `dang_ky_lop_ibfk_1` FOREIGN KEY (`hoc_sinh_id`) REFERENCES `hoc_sinh` (`hoc_sinh_id`),
  ADD CONSTRAINT `dang_ky_lop_ibfk_2` FOREIGN KEY (`lop_hoc_id`) REFERENCES `lop_hoc` (`lop_hoc_id`);

--
-- Constraints for table `danh_gia`
--
ALTER TABLE `danh_gia`
  ADD CONSTRAINT `danh_gia_ibfk_1` FOREIGN KEY (`phu_huynh_id`) REFERENCES `phu_huynh` (`phu_huynh_id`),
  ADD CONSTRAINT `danh_gia_ibfk_2` FOREIGN KEY (`gia_su_id`) REFERENCES `gia_su` (`gia_su_id`);

--
-- Constraints for table `diem_danh`
--
ALTER TABLE `diem_danh`
  ADD CONSTRAINT `diem_danh_ibfk_1` FOREIGN KEY (`lich_hoc_id`) REFERENCES `lich_hoc` (`lich_hoc_id`),
  ADD CONSTRAINT `diem_danh_ibfk_2` FOREIGN KEY (`hoc_sinh_id`) REFERENCES `hoc_sinh` (`hoc_sinh_id`);

--
-- Constraints for table `gia_su_mon_hoc`
--
ALTER TABLE `gia_su_mon_hoc`
  ADD CONSTRAINT `gia_su_mon_hoc_ibfk_1` FOREIGN KEY (`gia_su_id`) REFERENCES `gia_su` (`gia_su_id`),
  ADD CONSTRAINT `gia_su_mon_hoc_ibfk_2` FOREIGN KEY (`mon_hoc_id`) REFERENCES `mon_hoc` (`mon_hoc_id`);

--
-- Constraints for table `hoc_phi`
--
ALTER TABLE `hoc_phi`
  ADD CONSTRAINT `hoc_phi_ibfk_1` FOREIGN KEY (`dang_ky_id`) REFERENCES `dang_ky_lop` (`dang_ky_id`);

--
-- Constraints for table `hoc_sinh`
--
ALTER TABLE `hoc_sinh`
  ADD CONSTRAINT `hoc_sinh_ibfk_1` FOREIGN KEY (`phu_huynh_id`) REFERENCES `phu_huynh` (`phu_huynh_id`);

--
-- Constraints for table `lich_hoc`
--
ALTER TABLE `lich_hoc`
  ADD CONSTRAINT `lich_hoc_ibfk_1` FOREIGN KEY (`lop_hoc_id`) REFERENCES `lop_hoc` (`lop_hoc_id`);

--
-- Constraints for table `lop_hoc`
--
ALTER TABLE `lop_hoc`
  ADD CONSTRAINT `lop_hoc_ibfk_1` FOREIGN KEY (`gia_su_id`) REFERENCES `gia_su` (`gia_su_id`),
  ADD CONSTRAINT `lop_hoc_ibfk_2` FOREIGN KEY (`mon_hoc_id`) REFERENCES `mon_hoc` (`mon_hoc_id`);

--
-- Constraints for table `luong_gia_su`
--
ALTER TABLE `luong_gia_su`
  ADD CONSTRAINT `luong_gia_su_ibfk_1` FOREIGN KEY (`gia_su_id`) REFERENCES `gia_su` (`gia_su_id`),
  ADD CONSTRAINT `luong_gia_su_ibfk_2` FOREIGN KEY (`lop_hoc_id`) REFERENCES `lop_hoc` (`lop_hoc_id`);

--
-- Constraints for table `yeu_cau`
--
ALTER TABLE `yeu_cau`
  ADD CONSTRAINT `yeu_cau_ibfk_1` FOREIGN KEY (`lop_hoc_id`) REFERENCES `lop_hoc` (`lop_hoc_id`),
  ADD CONSTRAINT `yeu_cau_ibfk_2` FOREIGN KEY (`dang_ky_id`) REFERENCES `dang_ky_lop` (`dang_ky_id`),
  ADD CONSTRAINT `yeu_cau_ibfk_3` FOREIGN KEY (`gia_su_id`) REFERENCES `gia_su` (`gia_su_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
