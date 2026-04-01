<?php
class GiaSu
{
    public static function getAll(string $search = '', string $trangThai = '', int $limit = 10, int $offset = 0): array
    {
        $where = "WHERE 1=1";
        $params = [];

        if (!empty($search)) {
            $where .= " AND (ho_ten LIKE ? OR email LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }

        if (!empty($trangThai)) {
            $where .= " AND trang_thai = ?";
            $params[] = $trangThai;
        }

        $countParams = $params;
        $params[] = $limit;
        $params[] = $offset;

        $data = Database::query(
            "SELECT gia_su_id, ho_ten, email, so_dien_thoai, bang_cap, kinh_nghiem, 
                    diem_danh_gia_trung_binh, trang_thai, ngay_dang_ky
             FROM gia_su $where 
             ORDER BY ngay_dang_ky DESC 
             LIMIT ? OFFSET ?",
            $params
        );

        $total = Database::queryOne("SELECT COUNT(*) as count FROM gia_su $where", $countParams)['count'];

        return [
            'data' => $data,
            'total' => (int)$total
        ];
    }

    public static function findById(string $id): ?array
    {
        $giaSu = Database::queryOne(
            "SELECT * FROM gia_su WHERE gia_su_id = ?",
            [$id]
        );

        if ($giaSu) {
            unset($giaSu['mat_khau']);
        }

        return $giaSu;
    }

    public static function findByEmail(string $email): ?array
    {
        return Database::queryOne(
            "SELECT * FROM gia_su WHERE email = ?",
            [$email]
        );
    }

    public static function findByEmailForLogin(string $email): ?array
    {
        return Database::queryOne(
            "SELECT gia_su_id as id, ho_ten as name, email, so_dien_thoai as phone, 
                    mat_khau as password, 'gia_su' as role, trang_thai
             FROM gia_su WHERE email = ?",
            [$email]
        );
    }

    public static function findByPhone(string $phone): ?array
    {
        return Database::queryOne(
            "SELECT gia_su_id as id, ho_ten as name, email, so_dien_thoai as phone, 
                    mat_khau as password, 'gia_su' as role, trang_thai
             FROM gia_su WHERE so_dien_thoai = ?",
            [$phone]
        );
    }

    public static function getMonHoc(string $giaSuId): array
    {
        return Database::query(
            "SELECT mh.* FROM mon_hoc mh
             INNER JOIN gia_su_mon_hoc gsmh ON mh.mon_hoc_id = gsmh.mon_hoc_id
             WHERE gsmh.gia_su_id = ?",
            [$giaSuId]
        );
    }

    public static function getLopHoc(string $giaSuId): array
    {
        return Database::query(
            "SELECT * FROM lop_hoc WHERE gia_su_id = ? AND trang_thai = 'dang_hoc'",
            [$giaSuId]
        );
    }

    public static function create(array $data): int
    {
        $hashedPassword = password_hash($data['mat_khau'], PASSWORD_DEFAULT);

        Database::execute(
            "INSERT INTO gia_su (ho_ten, email, so_dien_thoai, mat_khau, bang_cap, kinh_nghiem, trang_thai)
             VALUES (?, ?, ?, ?, ?, ?, 'cho_duyet')",
            [
                $data['ho_ten'],
                $data['email'],
                $data['so_dien_thoai'] ?? '',
                $hashedPassword,
                $data['bang_cap'] ?? '',
                $data['kinh_nghiem'] ?? ''
            ]
        );

        return Database::lastInsertId();
    }

    public static function update(string $id, array $data): bool
    {
        $allowedFields = [
            'ho_ten', 'so_dien_thoai', 'dia_chi', 'bang_cap', 'kinh_nghiem', 
            'gioi_thieu', 'trang_thai', 'ngay_sinh', 'gioi_tinh', 'anh_dai_dien', 'so_tai_khoan_ngan_hang'
        ];
        $fields = [];
        $params = [];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = ?";
                $params[] = $data[$field];
            }
        }

        if (empty($fields)) {
            return false;
        }

        $params[] = $id;
        $sql = "UPDATE gia_su SET " . implode(', ', $fields) . " WHERE gia_su_id = ?";
        Database::execute($sql, $params);

        return true;
    }

    public static function delete(string $id): int
    {
        return Database::execute("DELETE FROM gia_su WHERE gia_su_id = ?", [$id]);
    }

    public static function updateStatus(string $id, string $trangThai): int
    {
        return Database::execute(
            "UPDATE gia_su SET trang_thai = ? WHERE gia_su_id = ?",
            [$trangThai, $id]
        );
    }

    public static function getDetails(int $userId): ?array
    {
        return Database::queryOne(
            "SELECT gia_su_id, ho_ten, email, so_dien_thoai, dia_chi, bang_cap, trang_thai, ngay_dang_ky
             FROM gia_su WHERE gia_su_id = ?",
            [$userId]
        );
    }

    public static function getDashboardStats(string $giaSuId): array
    {
        // 1. Số lớp (Tính cả những lớp vừa bấm nhận xong 'sap_mo' và đang dạy 'dang_hoc')
        $lopCount = Database::queryOne(
            "SELECT COUNT(*) as count FROM lop_hoc 
             WHERE gia_su_id = ? AND trang_thai IN ('dang_hoc', 'sap_mo')", 
            [$giaSuId]
        )['count'] ?? 0;

        // 2. Số học sinh (Đếm học sinh đã duyệt trong các lớp gia sư đang phụ trách)
        $hsCount = Database::queryOne(
            "SELECT COUNT(DISTINCT dk.hoc_sinh_id) as count 
             FROM dang_ky_lop dk 
             JOIN lop_hoc l ON dk.lop_hoc_id = l.lop_hoc_id 
             WHERE l.gia_su_id = ? AND dk.trang_thai = 'da_duyet' AND l.trang_thai IN ('dang_hoc', 'sap_mo')", 
            [$giaSuId]
        )['count'] ?? 0;

        // 3. Điểm đánh giá trung bình
        $rating = Database::queryOne(
            "SELECT diem_danh_gia_trung_binh FROM gia_su WHERE gia_su_id = ?", 
            [$giaSuId]
        )['diem_danh_gia_trung_binh'] ?? 0;

        // 4. Số lượng Yêu cầu mới (SỬA LẠI: Đếm chính xác từ bảng yeu_cau với trạng thái chờ)
        $yeuCauCount = Database::queryOne(
            "SELECT COUNT(*) as count 
             FROM yeu_cau 
             WHERE gia_su_id = ? AND trang_thai IN ('cho_duyet', 'dang_xu_ly')", 
            [$giaSuId]
        )['count'] ?? 0;

        // 5. Thu nhập tháng này (Đã thanh toán)
        $currentMonth = (int)date('m');
        $currentYear = (int)date('Y');
        $thuNhapThangNay = Database::queryOne(
            "SELECT SUM(tien_tra_gia_su) as total FROM luong_gia_su 
             WHERE gia_su_id = ? AND thang = ? AND nam = ? AND trang_thai_thanh_toan = 'da_thanh_toan'",
            [$giaSuId, $currentMonth, $currentYear]
        )['total'] ?? 0;

        // 6. Thu nhập đang chờ thanh toán
        $thuNhapCho = Database::queryOne(
            "SELECT SUM(tien_tra_gia_su) as total FROM luong_gia_su 
             WHERE gia_su_id = ? AND trang_thai_thanh_toan = 'chua_thanh_toan'",
            [$giaSuId]
        )['total'] ?? 0;

        // 7. Dữ liệu biểu đồ thu nhập 6 tháng
        $thuNhapChart = Database::query(
            "SELECT thang, nam, SUM(tien_tra_gia_su) as total 
             FROM luong_gia_su 
             WHERE gia_su_id = ? AND trang_thai_thanh_toan = 'da_thanh_toan' 
             GROUP BY nam, thang 
             ORDER BY nam DESC, thang DESC 
             LIMIT 6",
            [$giaSuId]
        ) ?: [];

        // 8. Lịch dạy ngày hôm nay
        date_default_timezone_set('Asia/Ho_Chi_Minh');
        $today = date('Y-m-d');
        
        $lichHomNay = Database::query(
            "SELECT lh.lich_hoc_id, lh.gio_bat_dau, lh.gio_ket_thuc, lh.trang_thai, 
                    l.ten_lop, mh.ten_mon_hoc, 
                    -- Gom tên các học sinh trong cùng 1 lớp lại thành chuỗi (Ví dụ: Kim Long, Học sinh 2)
                    GROUP_CONCAT(hs.ho_ten SEPARATOR ', ') as ten_hoc_sinh
             FROM lich_hoc lh
             JOIN lop_hoc l ON lh.lop_hoc_id = l.lop_hoc_id
             LEFT JOIN mon_hoc mh ON l.mon_hoc_id = mh.mon_hoc_id
             LEFT JOIN dang_ky_lop dk ON l.lop_hoc_id = dk.lop_hoc_id AND dk.trang_thai = 'da_duyet'
             LEFT JOIN hoc_sinh hs ON dk.hoc_sinh_id = hs.hoc_sinh_id
             WHERE l.gia_su_id = ? 
               AND lh.ngay_hoc = ? 
               AND l.trang_thai IN ('dang_hoc', 'sap_mo')
               AND lh.trang_thai != 'da_huy' -- Lọc bỏ những buổi đã bị hủy
             GROUP BY lh.lich_hoc_id, lh.gio_bat_dau, lh.gio_ket_thuc, lh.trang_thai, l.ten_lop, mh.ten_mon_hoc
             ORDER BY lh.gio_bat_dau ASC",
            [$giaSuId, $today]
        ) ?: [];
        
        return [
            'total_lop' => (int)$lopCount,
            'total_hoc_sinh' => (int)$hsCount,
            'avg_rating' => (float)$rating,
            'total_yeu_cau_moi' => (int)$yeuCauCount,
            'thu_nhap_thang_nay' => (float)$thuNhapThangNay,
            'thu_nhap_cho' => (float)$thuNhapCho,
            'lich_hom_nay' => $lichHomNay,
            'thu_nhap_chart' => $thuNhapChart
        ];
    }
}
