<?php
require_once __DIR__ . '/base.php';

class HocPhiModel extends BaseModel {
    protected $table = 'hoc_phi';
    protected $primaryKey = 'hoc_phi_id';

    public function create($data) {
        $sql = "INSERT INTO {$this->table} (dang_ky_id, so_tien, so_buoi_da_hoc, trang_thai_thanh_toan, ngay_tao) 
                VALUES (:dang_ky_id, :so_tien, :so_buoi_da_hoc, :trang_thai, NOW())";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':dang_ky_id' => $data['dang_ky_id'],
            ':so_tien' => $data['so_tien'],
            ':so_buoi_da_hoc' => $data['so_buoi_da_hoc'] ?? 0,
            ':trang_thai' => $data['trang_thai_thanh_toan'] ?? 'chua_thanh_toan'
        ]);
        return $this->conn->lastInsertId();
    }

    public function updateStatus($id, $status) {
        $sql = "UPDATE {$this->table} SET trang_thai_thanh_toan = :status, ngay_thanh_toan = NOW() WHERE {$this->primaryKey} = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([':status' => $status, ':id' => $id]);
    }

    public function getByDangKy($dangKyId) {
        $sql = "SELECT * FROM {$this->table} WHERE dang_ky_id = ? ORDER BY ngay_tao DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$dangKyId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>
