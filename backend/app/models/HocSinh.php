<?php
/**
 * Model Học Sinh
 * Xử lý các truy vấn database liên quan đến học sinh
 */

class HocSinh
{
    /**
     * Lấy danh sách học sinh với phân trang và tìm kiếm
     */
    public static function getAll(string $search = '', int $limit = 10, int $offset = 0): array
    {
        $where = "WHERE 1=1";
        $params = [];

        if (!empty($search)) {
            $where .= " AND hs.ho_ten LIKE ?";
            $params[] = "%$search%";
        }

        $countParams = $params;
        $params[] = $limit;
        $params[] = $offset;

        $data = Database::query(
            "SELECT hs.*, ph.ho_ten as phu_huynh_ten, ph.so_dien_thoai as phu_huynh_sdt
             FROM hoc_sinh hs
             LEFT JOIN phu_huynh ph ON hs.phu_huynh_id = ph.phu_huynh_id
             $where 
             ORDER BY hs.ngay_tao DESC 
             LIMIT ? OFFSET ?",
            $params
        );

        $total = Database::queryOne(
            "SELECT COUNT(*) as count FROM hoc_sinh hs $where",
            $countParams
        )['count'];

        return [
            'data' => $data,
            'total' => (int)$total
        ];
    }

    /**
     * Tìm học sinh theo ID
     */
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

    /**
     * Lấy lớp học của học sinh
     */
    public static function getLopHoc(string $hocSinhId): array
    {
        return Database::query(
            "SELECT lh.*, gs.ho_ten as gia_su_ten
             FROM dang_ky_lop dkl
             INNER JOIN lop_hoc lh ON dkl.lop_hoc_id = lh.lop_hoc_id
             LEFT JOIN gia_su gs ON lh.gia_su_id = gs.gia_su_id
             WHERE dkl.hoc_sinh_id = ? AND dkl.trang_thai = 'da_duyet'",
            [$hocSinhId]
        );
    }

    /**
     * Lấy học sinh theo phụ huynh ID
     */
    public static function getByPhuHuynhId(string $phuHuynhId): array
    {
        return Database::query(
            "SELECT * FROM hoc_sinh WHERE phu_huynh_id = ? ORDER BY ngay_tao DESC",
            [$phuHuynhId]
        );
    }

    /**
     * Tạo học sinh mới
     */
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

    /**
     * Cập nhật học sinh
     */
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

    /**
     * Xóa học sinh
     */
    public static function delete(string $id): int
    {
        return Database::execute("DELETE FROM hoc_sinh WHERE hoc_sinh_id = ?", [$id]);
    }
}
