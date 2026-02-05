<?php
require_once __DIR__ . '/base.php';

class LuongGiaSuModel extends BaseModel {
    protected $table = 'luong_gia_su';
    protected $primaryKey = 'luong_id';

    public function create($data) {
        $sql = "INSERT INTO {$this->table} (gia_su_id, lop_hoc_id, thang, nam, so_buoi_day, tong_tien_thu, tien_tra_gia_su, loai_chi_tra, gia_tri_ap_dung, trang_thai_thanh_toan, ngay_tao) 
                VALUES (:gs_id, :lop_id, :thang, :nam, :so_buoi, :tong_thu, :tien_tra, :loai, :gia_tri, 'chua_thanh_toan', NOW())";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':gs_id' => $data['gia_su_id'],
            ':lop_id' => $data['lop_hoc_id'],
            ':thang' => $data['thang'],
            ':nam' => $data['nam'],
            ':so_buoi' => $data['so_buoi_day'],
            ':tong_thu' => $data['tong_tien_thu'],
            ':tien_tra' => $data['tien_tra_gia_su'],
            ':loai' => $data['loai_chi_tra'],
            ':gia_tri' => $data['gia_tri_ap_dung']
        ]);
        return $this->conn->lastInsertId();
    }

    public function getByGiaSu($giaSuId) {
        $sql = "SELECT * FROM {$this->table} WHERE gia_su_id = ? ORDER BY nam DESC, thang DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$giaSuId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>
