<?php
class MonHoc
{
    public static function getAll(string $search = '', int $limit = 10, int $offset = 0): array
    {
        $where = "WHERE 1=1";
        $params = [];

        if (!empty($search)) {
            $where .= " AND (ten_mon_hoc LIKE ? OR mo_ta LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }

        $countParams = $params;
        $params[] = $limit;
        $params[] = $offset;

        $data = Database::query(
            "SELECT mon_hoc_id, ten_mon_hoc, mo_ta, trang_thai, ngay_tao
             FROM mon_hoc $where 
             ORDER BY ngay_tao DESC 
             LIMIT ? OFFSET ?",
            $params
        );

        $total = Database::queryOne("SELECT COUNT(*) as count FROM mon_hoc $where", $countParams)['count'];

        return [
            'data' => $data,
            'total' => (int)$total
        ];
    }

    public static function findById(string $id): ?array
    {
        return Database::queryOne(
            "SELECT * FROM mon_hoc WHERE mon_hoc_id = ?",
            [$id]
        );
    }

    public static function create(array $data): int
    {
        $fields = [];
        $placeholders = [];
        $params = [];

        $allowedFields = ['ten_mon_hoc', 'mo_ta', 'trang_thai'];

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

        $sql = "INSERT INTO mon_hoc (" . implode(', ', $fields) . ") VALUES (" . implode(', ', $placeholders) . ")";
        
        Database::execute($sql, $params);
        
        return (int)Database::lastInsertId();
    }

    public static function update(string $id, array $data): bool
    {
        $fields = [];
        $params = [];

        $allowedFields = ['ten_mon_hoc', 'mo_ta', 'trang_thai'];

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
        $sql = "UPDATE mon_hoc SET " . implode(', ', $fields) . " WHERE mon_hoc_id = ?";
        
        return Database::execute($sql, $params) > 0;
    }

    public static function delete(string $id): int
    {
        return Database::execute("DELETE FROM mon_hoc WHERE mon_hoc_id = ?", [$id]);
    }
}
