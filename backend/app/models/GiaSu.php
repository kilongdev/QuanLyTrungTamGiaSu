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
            "INSERT INTO gia_su (
                ho_ten, email, so_dien_thoai, mat_khau, ngay_sinh, gioi_tinh, dia_chi,
                bang_cap, chung_chi, gioi_thieu, kinh_nghiem, so_tai_khoan_ngan_hang,
                anh_dai_dien, trang_thai
            )
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'cho_duyet')",
            [
                $data['ho_ten'],
                $data['email'],
                $data['so_dien_thoai'] ?? '',
                $hashedPassword,
                $data['ngay_sinh'] ?? null,
                $data['gioi_tinh'] ?? null,
                $data['dia_chi'] ?? null,
                $data['bang_cap'] ?? '',
                $data['chung_chi'] ?? null,
                $data['gioi_thieu'] ?? null,
                $data['kinh_nghiem'] ?? '',
                $data['so_tai_khoan_ngan_hang'] ?? null,
                $data['anh_dai_dien'] ?? null,
            ]
        );

        return Database::lastInsertId();
    }

    public static function update(string $id, array $data): bool
    {
        $allowedFields = [
            'ho_ten', 'so_dien_thoai', 'dia_chi', 'bang_cap', 'kinh_nghiem', 
            'gioi_thieu', 'trang_thai', 'ngay_sinh', 'gioi_tinh', 'anh_dai_dien', 'so_tai_khoan_ngan_hang', 'chung_chi'
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
        return Database::execute("UPDATE gia_su SET trang_thai = 'khoa' WHERE gia_su_id = ?", [$id]);
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
        $tutor = Database::queryOne(
            "SELECT gia_su_id, ho_ten, email, so_dien_thoai, ngay_sinh, gioi_tinh, dia_chi,
                    anh_dai_dien, bang_cap, chung_chi, gioi_thieu, kinh_nghiem,
                    so_tai_khoan_ngan_hang, diem_danh_gia_trung_binh, trang_thai, ngay_dang_ky
             FROM gia_su WHERE gia_su_id = ?",
            [$userId]
        );

        if (!$tutor) {
            return null;
        }

        if (!empty($tutor['chung_chi'])) {
            $decoded = json_decode($tutor['chung_chi'], true);
            $tutor['chung_chi'] = is_array($decoded) ? $decoded : [];
        } else {
            $tutor['chung_chi'] = [];
        }

        return $tutor;
    }
}
