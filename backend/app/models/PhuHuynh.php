<?php
class PhuHuynh
{
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

        $sql = "SELECT phu_huynh_id, ho_ten, so_dien_thoai, email, dia_chi, trang_thai, ngay_dang_ky
                FROM phu_huynh $where 
                ORDER BY ngay_dang_ky DESC 
                LIMIT $limit OFFSET $offset";

        $data = Database::query($sql, $countParams);

        $total = Database::queryOne("SELECT COUNT(*) as count FROM phu_huynh $where", $countParams)['count'];

        return [
            'data' => $data,
            'total' => (int)$total
        ];
    }

    public static function findById(string $id): ?array
    {
        return Database::queryOne(
            "SELECT phu_huynh_id, ho_ten, so_dien_thoai, email, dia_chi, trang_thai, ngay_dang_ky
             FROM phu_huynh WHERE phu_huynh_id = ?",
            [$id]
        );
    }

    public static function findByEmail(string $email): ?array
    {
        return Database::queryOne(
            "SELECT phu_huynh_id FROM phu_huynh WHERE email = ?",
            [$email]
        );
    }

    public static function findByEmailForLogin(string $email): ?array
    {
        return Database::queryOne(
            "SELECT phu_huynh_id as id, ho_ten as name, email, so_dien_thoai as phone, 
                    mat_khau as password, 'phu_huynh' as role
             FROM phu_huynh WHERE email = ?",
            [$email]
        );
    }

    public static function findByPhone(string $phone): ?array
    {
        return Database::queryOne(
            "SELECT phu_huynh_id as id, ho_ten as name, email, so_dien_thoai as phone, 
                    mat_khau as password, 'phu_huynh' as role
             FROM phu_huynh WHERE so_dien_thoai = ?",
            [$phone]
        );
    }

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

    public static function update(string $id, array $data): bool
    {
        $allowedFields = ['ho_ten', 'so_dien_thoai', 'dia_chi', 'email'];
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

    public static function delete(string $id): int
    {
        return Database::execute("DELETE FROM phu_huynh WHERE phu_huynh_id = ?", [$id]);
    }

    public static function getDetails(int $userId): ?array
    {
        $parent = Database::queryOne(
            "SELECT phu_huynh_id, ho_ten, email, so_dien_thoai, dia_chi, trang_thai, ngay_dang_ky
             FROM phu_huynh WHERE phu_huynh_id = ?",
            [$userId]
        );

        if ($parent) {
            $parent['hoc_sinh'] = Database::query(
                "SELECT hs.hoc_sinh_id, hs.ho_ten, hs.ngay_sinh, hs.khoi_lop,
                    (SELECT COUNT(*) FROM dang_ky_lop dkl WHERE dkl.hoc_sinh_id = hs.hoc_sinh_id AND dkl.trang_thai = 'da_duyet') as subjects_count,
                    (SELECT COUNT(*) FROM diem_danh dd WHERE dd.hoc_sinh_id = hs.hoc_sinh_id AND dd.tinh_trang = 'co_mat') as sessions_count,
                    (SELECT GROUP_CONCAT(DISTINCT mh.ten_mon_hoc SEPARATOR ', ')
                     FROM dang_ky_lop dkl
                     JOIN lop_hoc lh ON dkl.lop_hoc_id = lh.lop_hoc_id
                     JOIN mon_hoc mh ON lh.mon_hoc_id = mh.mon_hoc_id
                     WHERE dkl.hoc_sinh_id = hs.hoc_sinh_id AND dkl.trang_thai = 'da_duyet') as subjects_list
                 FROM hoc_sinh hs WHERE hs.phu_huynh_id = ?",
                [$userId]
            );
        }

        return $parent;
    }

    public static function getCurrentTutors(int $phuHuynhId): array
    {
        $sql = "SELECT DISTINCT gs.gia_su_id, gs.ho_ten, gs.chuyen_mon, gs.diem_danh_gia_trung_binh, gs.kinh_nghiem
                FROM gia_su gs
                JOIN lop_hoc lh ON gs.gia_su_id = lh.gia_su_id
                JOIN dang_ky_lop dkl ON lh.lop_hoc_id = dkl.lop_hoc_id
                JOIN hoc_sinh hs ON dkl.hoc_sinh_id = hs.hoc_sinh_id
                WHERE hs.phu_huynh_id = ? AND lh.trang_thai = 'dang_hoc' AND dkl.trang_thai = 'da_duyet'";
        
        return Database::query($sql, [$phuHuynhId]);
    }

    public static function getUpcomingClasses(int $phuHuynhId, int $limit = 5): array
    {
        $sql = "SELECT lh_chi_tiet.lich_hoc_id, mh.ten_mon_hoc, gs.ho_ten AS ten_gia_su, lh.khoi_lop,
                       lh_chi_tiet.ngay_hoc, lh_chi_tiet.gio_bat_dau, lh_chi_tiet.gio_ket_thuc, hs.ho_ten AS ten_hoc_sinh
                FROM lich_hoc lh_chi_tiet
                JOIN lop_hoc lh ON lh_chi_tiet.lop_hoc_id = lh.lop_hoc_id
                JOIN dang_ky_lop dkl ON lh.lop_hoc_id = dkl.lop_hoc_id
                JOIN hoc_sinh hs ON dkl.hoc_sinh_id = hs.hoc_sinh_id
                JOIN gia_su gs ON lh.gia_su_id = gs.gia_su_id
                LEFT JOIN mon_hoc mh ON lh.mon_hoc_id = mh.mon_hoc_id
                WHERE hs.phu_huynh_id = ? 
                AND lh_chi_tiet.ngay_hoc >= CURDATE()
                AND dkl.trang_thai = 'da_duyet'
                ORDER BY lh_chi_tiet.ngay_hoc ASC, lh_chi_tiet.gio_bat_dau ASC
                LIMIT $limit";
        
        return Database::query($sql, [$phuHuynhId]);
    }
}
