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
                    mat_khau as password, 'phu_huynh' as role, trang_thai
             FROM phu_huynh WHERE email = ?",
            [$email]
        );
    }

    public static function findByPhone(string $phone): ?array
    {
        return Database::queryOne(
            "SELECT phu_huynh_id as id, ho_ten as name, email, so_dien_thoai as phone, 
                    mat_khau as password, 'phu_huynh' as role, trang_thai
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
        $allowedFields = ['ho_ten', 'so_dien_thoai', 'dia_chi', 'email', 'trang_thai'];
        $fields = [];
        $params = [];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = ?";
                $params[] = $data[$field];
            }
        }

        if (isset($data['mat_khau'])) {
            $newPassword = trim((string)$data['mat_khau']);
            if ($newPassword !== '') {
                $fields[] = "mat_khau = ?";
                $params[] = password_hash($newPassword, PASSWORD_DEFAULT);
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
        return Database::execute("UPDATE phu_huynh SET trang_thai = 'khoa' WHERE phu_huynh_id = ?", [$id]);
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
                "SELECT hoc_sinh_id, ho_ten, ngay_sinh, khoi_lop FROM hoc_sinh WHERE phu_huynh_id = ?",
                [$userId]
            );
        }

        return $parent;
    }

    public static function getDashboardStats(int $parentId): array
    {
        $totalChildren = Database::queryOne(
            "SELECT COUNT(*) AS total FROM hoc_sinh WHERE phu_huynh_id = ?",
            [$parentId]
        )['total'] ?? 0;

        $totalClasses = Database::queryOne(
            "SELECT COUNT(DISTINCT dkl.lop_hoc_id) AS total
             FROM dang_ky_lop dkl
             INNER JOIN hoc_sinh hs ON dkl.hoc_sinh_id = hs.hoc_sinh_id
                         INNER JOIN lop_hoc l ON dkl.lop_hoc_id = l.lop_hoc_id
             WHERE hs.phu_huynh_id = ?
                             AND dkl.trang_thai IN ('da_duyet', 'da_duyet_truc_tiep')
                             AND l.trang_thai <> 'dong'",
            [$parentId]
        )['total'] ?? 0;

        $totalTutors = Database::queryOne(
            "SELECT COUNT(DISTINCT lh.gia_su_id) AS total
             FROM dang_ky_lop dkl
             INNER JOIN hoc_sinh hs ON dkl.hoc_sinh_id = hs.hoc_sinh_id
             INNER JOIN lop_hoc lh ON dkl.lop_hoc_id = lh.lop_hoc_id
             WHERE hs.phu_huynh_id = ?
               AND dkl.trang_thai IN ('da_duyet', 'da_duyet_truc_tiep')
                             AND lh.trang_thai <> 'dong'
               AND lh.gia_su_id IS NOT NULL",
            [$parentId]
        )['total'] ?? 0;

        $unpaidCount = Database::queryOne(
            "SELECT COUNT(*) AS total
             FROM hoc_phi hp
             INNER JOIN dang_ky_lop dkl ON hp.dang_ky_id = dkl.dang_ky_id
             INNER JOIN hoc_sinh hs ON dkl.hoc_sinh_id = hs.hoc_sinh_id
             WHERE hs.phu_huynh_id = ?
               AND hp.trang_thai_thanh_toan IN ('chua_thanh_toan', 'qua_han')",
            [$parentId]
        )['total'] ?? 0;

        $upcomingSchedule = Database::query(
            "SELECT lh.ngay_hoc, lh.gio_bat_dau, lh.gio_ket_thuc,
                    hs.ho_ten AS ten_hoc_sinh,
                    l.ten_lop,
                    COALESCE(gs.ho_ten, 'Chua phan cong') AS ten_gia_su,
                    COALESCE(mh.ten_mon_hoc, 'Chua cap nhat') AS ten_mon_hoc
             FROM lich_hoc lh
             INNER JOIN lop_hoc l ON lh.lop_hoc_id = l.lop_hoc_id
             INNER JOIN dang_ky_lop dkl ON dkl.lop_hoc_id = l.lop_hoc_id
             INNER JOIN hoc_sinh hs ON dkl.hoc_sinh_id = hs.hoc_sinh_id
             LEFT JOIN gia_su gs ON l.gia_su_id = gs.gia_su_id
             LEFT JOIN mon_hoc mh ON l.mon_hoc_id = mh.mon_hoc_id
             WHERE hs.phu_huynh_id = ?
               AND dkl.trang_thai IN ('da_duyet', 'da_duyet_truc_tiep')
                             AND l.trang_thai <> 'dong'
               AND lh.ngay_hoc >= CURDATE()
               AND lh.trang_thai != 'da_huy'
             ORDER BY lh.ngay_hoc ASC, lh.gio_bat_dau ASC
             LIMIT 6",
            [$parentId]
        );

        return [
            'total_children' => (int)$totalChildren,
            'total_classes' => (int)$totalClasses,
            'total_tutors' => (int)$totalTutors,
            'unpaid_count' => (int)$unpaidCount,
            'upcoming_schedule' => $upcomingSchedule ?: []
        ];
    }

    public static function getChildrenLearningData(int $parentId): array
    {
        return Database::query(
            "SELECT hs.hoc_sinh_id,
                    hs.ho_ten,
                    hs.ngay_sinh,
                    hs.khoi_lop,
                    COUNT(DISTINCT CASE WHEN dkl.trang_thai IN ('da_duyet', 'da_duyet_truc_tiep') THEN dkl.lop_hoc_id END) AS so_lop,
                    COUNT(DISTINCT CASE WHEN dkl.trang_thai IN ('da_duyet', 'da_duyet_truc_tiep') THEN lh.lich_hoc_id END) AS so_buoi_hoc,
                    GROUP_CONCAT(DISTINCT mh.ten_mon_hoc ORDER BY mh.ten_mon_hoc ASC SEPARATOR ', ') AS mon_hoc
             FROM hoc_sinh hs
             LEFT JOIN dang_ky_lop dkl ON hs.hoc_sinh_id = dkl.hoc_sinh_id
             LEFT JOIN lop_hoc l ON dkl.lop_hoc_id = l.lop_hoc_id
             LEFT JOIN lich_hoc lh ON lh.lop_hoc_id = l.lop_hoc_id
             LEFT JOIN mon_hoc mh ON l.mon_hoc_id = mh.mon_hoc_id
             WHERE hs.phu_huynh_id = ?
                             AND (l.lop_hoc_id IS NULL OR l.trang_thai <> 'dong')
             GROUP BY hs.hoc_sinh_id, hs.ho_ten, hs.ngay_sinh, hs.khoi_lop
             ORDER BY hs.ngay_tao DESC",
            [$parentId]
        ) ?: [];
    }

    public static function getTutorsByParent(int $parentId): array
    {
        return Database::query(
            "SELECT gs.gia_su_id,
                    gs.ho_ten,
                    gs.so_dien_thoai,
                    gs.email,
                    gs.bang_cap,
                    gs.kinh_nghiem,
                    gs.diem_danh_gia_trung_binh,
                    GROUP_CONCAT(DISTINCT hs.ho_ten ORDER BY hs.ho_ten ASC SEPARATOR ', ') AS hoc_sinh_phu_trach,
                    GROUP_CONCAT(DISTINCT mh.ten_mon_hoc ORDER BY mh.ten_mon_hoc ASC SEPARATOR ', ') AS mon_hoc_giang_day,
                    COUNT(DISTINCT l.lop_hoc_id) AS so_lop
             FROM dang_ky_lop dkl
             INNER JOIN hoc_sinh hs ON dkl.hoc_sinh_id = hs.hoc_sinh_id
             INNER JOIN lop_hoc l ON dkl.lop_hoc_id = l.lop_hoc_id
             INNER JOIN gia_su gs ON l.gia_su_id = gs.gia_su_id
             LEFT JOIN mon_hoc mh ON l.mon_hoc_id = mh.mon_hoc_id
             WHERE hs.phu_huynh_id = ?
               AND dkl.trang_thai IN ('da_duyet', 'da_duyet_truc_tiep')
                             AND l.trang_thai <> 'dong'
             GROUP BY gs.gia_su_id, gs.ho_ten, gs.so_dien_thoai, gs.email, gs.bang_cap, gs.kinh_nghiem, gs.diem_danh_gia_trung_binh
             ORDER BY gs.ho_ten ASC",
            [$parentId]
        ) ?: [];
    }

    public static function getPaymentsByParent(int $parentId): array
    {
        return Database::query(
            "SELECT hp.hoc_phi_id,
                    hp.so_tien,
                    hp.so_buoi_da_hoc,
                    hp.trang_thai_thanh_toan,
                    hp.ngay_den_han,
                    hp.ngay_thanh_toan,
                    hp.ngay_tao,
                    hs.ho_ten AS ten_hoc_sinh,
                    l.ten_lop,
                    COALESCE(mh.ten_mon_hoc, 'Chua cap nhat') AS ten_mon_hoc
             FROM hoc_phi hp
             INNER JOIN dang_ky_lop dkl ON hp.dang_ky_id = dkl.dang_ky_id
             INNER JOIN hoc_sinh hs ON dkl.hoc_sinh_id = hs.hoc_sinh_id
             INNER JOIN lop_hoc l ON dkl.lop_hoc_id = l.lop_hoc_id
             LEFT JOIN mon_hoc mh ON l.mon_hoc_id = mh.mon_hoc_id
             WHERE hs.phu_huynh_id = ?
                             AND l.trang_thai <> 'dong'
             ORDER BY hp.ngay_tao DESC",
            [$parentId]
        ) ?: [];
    }
}
