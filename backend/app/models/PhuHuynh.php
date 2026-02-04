<?php
/**
 * Model Phụ Huynh
 * Xử lý các truy vấn database liên quan đến phụ huynh
 */

class PhuHuynh
{
    /**
     * Lấy danh sách phụ huynh với phân trang và tìm kiếm
     */
    public static function getAll(string $search = '', int $limit = 10, int $offset = 0): array
    {
        $where = "WHERE 1=1";
        $params = [];

        if (!empty($search)) {
            $where .= " AND (ho_ten LIKE ? OR email LIKE ? OR so_dien_thoai LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }

        $countParams = $params;
        $params[] = $limit;
        $params[] = $offset;

        $data = Database::query(
            "SELECT phu_huynh_id, ho_ten, so_dien_thoai, email, dia_chi, trang_thai, ngay_dang_ky
             FROM phu_huynh $where 
             ORDER BY ngay_dang_ky DESC 
             LIMIT ? OFFSET ?",
            $params
        );

        $total = Database::queryOne("SELECT COUNT(*) as count FROM phu_huynh $where", $countParams)['count'];

        return [
            'data' => $data,
            'total' => (int)$total
        ];
    }

    /**
     * Tìm phụ huynh theo ID
     */
    public static function findById(string $id): ?array
    {
        return Database::queryOne(
            "SELECT phu_huynh_id, ho_ten, so_dien_thoai, email, dia_chi, trang_thai, ngay_dang_ky
             FROM phu_huynh WHERE phu_huynh_id = ?",
            [$id]
        );
    }

    /**
     * Tìm phụ huynh theo email
     */
    public static function findByEmail(string $email): ?array
    {
        return Database::queryOne(
            "SELECT phu_huynh_id FROM phu_huynh WHERE email = ?",
            [$email]
        );
    }

    /**
     * Tìm phụ huynh theo email để đăng nhập (trả về đầy đủ thông tin)
     */
    public static function findByEmailForLogin(string $email): ?array
    {
        return Database::queryOne(
            "SELECT phu_huynh_id as id, ho_ten as name, email, so_dien_thoai as phone, 
                    mat_khau as password, 'phu_huynh' as role
             FROM phu_huynh WHERE email = ?",
            [$email]
        );
    }

    /**
     * Tìm phụ huynh theo số điện thoại
     */
    public static function findByPhone(string $phone): ?array
    {
        return Database::queryOne(
            "SELECT phu_huynh_id as id, ho_ten as name, email, so_dien_thoai as phone, 
                    mat_khau as password, 'phu_huynh' as role
             FROM phu_huynh WHERE so_dien_thoai = ?",
            [$phone]
        );
    }

    /**
     * Tạo phụ huynh mới
     */
    public static function create(array $data): int
    {
        $hashedPassword = password_hash($data['mat_khau'], PASSWORD_DEFAULT);

        Database::execute(
            "INSERT INTO phu_huynh (ho_ten, so_dien_thoai, email, mat_khau, dia_chi, trang_thai)
             VALUES (?, ?, ?, ?, ?, 'da_duyet')",
            [
                $data['ho_ten'],
                $data['so_dien_thoai'] ?? '',
                $data['email'],
                $hashedPassword,
                $data['dia_chi'] ?? ''
            ]
        );

        return Database::lastInsertId();
    }

    /**
     * Cập nhật phụ huynh
     */
    public static function update(string $id, array $data): bool
    {
        $allowedFields = ['ho_ten', 'so_dien_thoai', 'dia_chi'];
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
        $sql = "UPDATE phu_huynh SET " . implode(', ', $fields) . " WHERE phu_huynh_id = ?";
        Database::execute($sql, $params);

        return true;
    }

    /**
     * Xóa phụ huynh
     */
    public static function delete(string $id): int
    {
        return Database::execute("DELETE FROM phu_huynh WHERE phu_huynh_id = ?", [$id]);
    }

    /**
     * Lấy thông tin chi tiết phụ huynh (cho Auth)
     */
    public static function getDetails(int $userId): ?array
    {
        $parent = Database::queryOne(
            "SELECT phu_huynh_id, ho_ten, email, so_dien_thoai, dia_chi, trang_thai, ngay_dang_ky
             FROM phu_huynh WHERE phu_huynh_id = ?",
            [$userId]
        );

        if ($parent) {
            $parent['hoc_sinh'] = Database::query(
                "SELECT hoc_sinh_id, ho_ten, ngay_sinh, khoi_lop FROM hoc_sinh WHERE phu_huynh_id = ?",
                [$userId]
            );
        }

        return $parent;
    }
}
