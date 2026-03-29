<?php
require_once __DIR__ . '/base.php';

class HocPhiModel extends BaseModel {
    protected $table = 'hoc_phi';
    protected $primaryKey = 'hoc_phi_id';

    public function findAll() {
        $sql = "SELECT hp.hoc_phi_id,
                       hp.dang_ky_id,
                       hp.so_tien,
                       hp.so_buoi_da_hoc,
                       hp.trang_thai_thanh_toan as trang_thai,
                       hp.ngay_tao,
                       hp.ngay_den_han,
                       hp.ngay_thanh_toan,
                       DATE_FORMAT(hp.ngay_tao, '%m/%Y') as thang,
                       hs.ho_ten as ten_hocsinh,
                       lh.ten_lop,
                       mh.ten_mon_hoc,
                       ph.ho_ten as ten_phu_huynh
                FROM {$this->table} hp
                LEFT JOIN dang_ky_lop dkl ON hp.dang_ky_id = dkl.dang_ky_id
                LEFT JOIN hoc_sinh hs ON dkl.hoc_sinh_id = hs.hoc_sinh_id
                LEFT JOIN lop_hoc lh ON dkl.lop_hoc_id = lh.lop_hoc_id
                LEFT JOIN mon_hoc mh ON lh.mon_hoc_id = mh.mon_hoc_id
                LEFT JOIN phu_huynh ph ON hs.phu_huynh_id = ph.phu_huynh_id
                ORDER BY hp.ngay_tao DESC";
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $sql = "INSERT INTO {$this->table} (dang_ky_id, so_tien, so_buoi_da_hoc, trang_thai_thanh_toan, ngay_den_han, ngay_tao) 
                VALUES (:dang_ky_id, :so_tien, :so_buoi_da_hoc, :trang_thai, :ngay_den_han, NOW())";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':dang_ky_id' => $data['dang_ky_id'],
            ':so_tien' => $data['so_tien'],
            ':so_buoi_da_hoc' => $data['so_buoi_da_hoc'] ?? 0,
            ':trang_thai' => $data['trang_thai_thanh_toan'] ?? 'chua_thanh_toan',
            ':ngay_den_han' => $data['ngay_den_han'] ?? null
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
