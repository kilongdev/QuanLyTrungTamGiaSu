<?php
class GiaSuMonHoc
{
    public static function getAll(int $giaSuId = null, int $monHocId = null, int $limit = 10, int $offset = 0): array
    {
        $where = "WHERE 1=1";
        $params = [];

        if ($giaSuId !== null) {
            $where .= " AND gsm.gia_su_id = ?";
            $params[] = $giaSuId;
        }

        if ($monHocId !== null) {
            $where .= " AND gsm.mon_hoc_id = ?";
            $params[] = $monHocId;
        }

        $countParams = $params;
        $params[] = $limit;
        $params[] = $offset;

        $data = Database::query(
            "SELECT gsm.*, gs.ho_ten as gia_su_name, mh.ten_mon_hoc 
             FROM gia_su_mon_hoc gsm
             LEFT JOIN gia_su gs ON gsm.gia_su_id = gs.gia_su_id
             LEFT JOIN mon_hoc mh ON gsm.mon_hoc_id = mh.mon_hoc_id
             $where 
             ORDER BY gsm.ngay_them DESC 
             LIMIT ? OFFSET ?",
            $params
        );

        $total = Database::queryOne("SELECT COUNT(*) as count FROM gia_su_mon_hoc gsm $where", $countParams)['count'];

        return [
            'data' => $data,
            'total' => (int)$total
        ];
    }

    public static function findById(string $id): ?array
    {
        return Database::queryOne(
            "SELECT gsm.*, gs.ho_ten as gia_su_name, mh.ten_mon_hoc 
             FROM gia_su_mon_hoc gsm
             LEFT JOIN gia_su gs ON gsm.gia_su_id = gs.gia_su_id
             LEFT JOIN mon_hoc mh ON gsm.mon_hoc_id = mh.mon_hoc_id
             WHERE gsm.gia_su_mon_hoc_id = ?",
            [$id]
        );
    }

    public static function create(array $data): int
    {
        $fields = [];
        $placeholders = [];
        $params = [];

        $allowedFields = ['gia_su_id', 'mon_hoc_id', 'trinh_do', 'kinh_nghiem_nam', 'ghi_chu'];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $fields[] = $field;
                $placeholders[] = '?';
                $params[] = $data[$field];
            }
        }

        if (empty($fields)) {
            return 0;
        }

        $sql = "INSERT INTO gia_su_mon_hoc (" . implode(', ', $fields) . ") VALUES (" . implode(', ', $placeholders) . ")";
        
        Database::execute($sql, $params);
        
        return (int)Database::lastInsertId();
    }

    public static function update(string $id, array $data): bool
    {
        $fields = [];
        $params = [];

        $allowedFields = ['gia_su_id', 'mon_hoc_id', 'trinh_do', 'kinh_nghiem_nam', 'ghi_chu'];

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
        $sql = "UPDATE gia_su_mon_hoc SET " . implode(', ', $fields) . " WHERE gia_su_mon_hoc_id = ?";
        
        return Database::execute($sql, $params) > 0;
    }

    public static function delete(string $id): int
    {
        return Database::execute("DELETE FROM gia_su_mon_hoc WHERE gia_su_mon_hoc_id = ?", [$id]);
    }
}
