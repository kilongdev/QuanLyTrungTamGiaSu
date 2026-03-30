<?php
class HocSinh
{
    public static function getAll(string $search = '', int $limit = 10, int $offset = 0): array
    {
        $where = "WHERE 1=1";
        $params = [];

        if (!empty($search)) {
            $where .= " AND hs.ho_ten LIKE ?";
            $params[] = "%$search%";
        }

        $countParams = $params;
        
        // Sử dụng biến trực tiếp trong SQL cho LIMIT/OFFSET để tránh lỗi ép kiểu PDO
        $sql = "SELECT hs.*, ph.ho_ten as phu_huynh_ten, ph.so_dien_thoai as phu_huynh_sdt
                FROM hoc_sinh hs
                LEFT JOIN phu_huynh ph ON hs.phu_huynh_id = ph.phu_huynh_id
                $where 
                ORDER BY hs.ngay_tao DESC 
                LIMIT $limit OFFSET $offset";

        $data = Database::query($sql, $countParams);

        $total = Database::queryOne(
            "SELECT COUNT(*) as count FROM hoc_sinh hs $where",
            $countParams
        )['count'];

        return [
            'data' => $data,
            'total' => (int)$total
        ];
    }

    public static function findById(string $id): ?array
    {
        return Database::queryOne(
            "SELECT hs.*, ph.ho_ten as phu_huynh_ten, ph.so_dien_thoai as phu_huynh_sdt, ph.email as phu_huynh_email
             FROM hoc_sinh hs
             LEFT JOIN phu_huynh ph ON hs.phu_huynh_id = ph.phu_huynh_id
             WHERE hs.hoc_sinh_id = ?",
            [$id]
        );
    }

    public static function getLopHoc(string $hocSinhId): array
    {
        return Database::query(
            "SELECT lh.*, gs.ho_ten as gia_su_ten, mh.ten_mon_hoc
             FROM dang_ky_lop dkl
             INNER JOIN lop_hoc lh ON dkl.lop_hoc_id = lh.lop_hoc_id
             LEFT JOIN gia_su gs ON lh.gia_su_id = gs.gia_su_id
             LEFT JOIN mon_hoc mh ON lh.mon_hoc_id = mh.mon_hoc_id
             WHERE dkl.hoc_sinh_id = ? AND dkl.trang_thai = 'da_duyet'",
            [$hocSinhId]
        );
    }

    public static function getByPhuHuynhId(string $phuHuynhId): array
    {
        return Database::query(
            "SELECT hs.*,
                (SELECT COUNT(*) FROM dang_ky_lop dkl WHERE dkl.hoc_sinh_id = hs.hoc_sinh_id AND dkl.trang_thai = 'da_duyet') as subjects_count,
                (SELECT COUNT(*) FROM diem_danh dd WHERE dd.hoc_sinh_id = hs.hoc_sinh_id AND dd.tinh_trang = 'co_mat') as sessions_count,
                (SELECT GROUP_CONCAT(DISTINCT mh.ten_mon_hoc SEPARATOR ', ')
                 FROM dang_ky_lop dkl
                 JOIN lop_hoc lh ON dkl.lop_hoc_id = lh.lop_hoc_id
                 JOIN mon_hoc mh ON lh.mon_hoc_id = mh.mon_hoc_id
                 WHERE dkl.hoc_sinh_id = hs.hoc_sinh_id AND dkl.trang_thai = 'da_duyet') as subjects_list
             FROM hoc_sinh hs 
             WHERE hs.phu_huynh_id = ? ORDER BY hs.ngay_tao DESC",
            [$phuHuynhId]
        );
    }

    public static function create(array $data): int
    {
        Database::execute(
            "INSERT INTO hoc_sinh (phu_huynh_id, ho_ten, ngay_sinh, khoi_lop)
             VALUES (?, ?, ?, ?)",
            [
                $data['phu_huynh_id'] ?? null,
                $data['ho_ten'],
                $data['ngay_sinh'] ?? null,
                $data['khoi_lop'] ?? 6
            ]
        );

        return Database::lastInsertId();
    }

    public static function update(string $id, array $data): bool
    {
        $allowedFields = ['ho_ten', 'ngay_sinh', 'khoi_lop'];
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
        $sql = "UPDATE hoc_sinh SET " . implode(', ', $fields) . " WHERE hoc_sinh_id = ?";
        Database::execute($sql, $params);

        return true;
    }

    public static function delete(string $id): int
    {
        return Database::execute("DELETE FROM hoc_sinh WHERE hoc_sinh_id = ?", [$id]);
    }

    /**
     * Kiểm tra xem học sinh có dữ liệu ràng buộc không
     */
    public static function hasRelatedRecords(string $id): bool
    {
        $check1 = Database::queryOne("SELECT dang_ky_id FROM dang_ky_lop WHERE hoc_sinh_id = ?", [$id]);
        $check2 = Database::queryOne("SELECT diem_danh_id FROM diem_danh WHERE hoc_sinh_id = ?", [$id]);
        return $check1 !== null || $check2 !== null;
    }
}
