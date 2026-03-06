<?php
require_once __DIR__ . '/base.php';

class DoanhThuModel extends BaseModel {
    protected $table = 'doanh_thu_thang';
    protected $primaryKey = 'doanh_thu_id';

    public function getBaoCaoNam($nam) {
        $sql = "SELECT * FROM {$this->table} WHERE nam = ? ORDER BY thang ASC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$nam]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function taoBaoCaoThang($data) {
        $sql = "INSERT INTO {$this->table} (thang, nam, tong_thu_hoc_phi, tong_tra_gia_su, loi_nhuan, so_luong_lop, so_luong_hoc_sinh, ngay_cap_nhat) 
                VALUES (:thang, :nam, :thu, :chi, :loi_nhuan, :so_lop, :so_hs, NOW())";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':thang' => $data['thang'],
            ':nam' => $data['nam'],
            ':thu' => $data['tong_thu_hoc_phi'],
            ':chi' => $data['tong_tra_gia_su'],
            ':loi_nhuan' => $data['loi_nhuan'],
            ':so_lop' => $data['so_luong_lop'],
            ':so_hs' => $data['so_luong_hoc_sinh']
        ]);
        return $this->conn->lastInsertId();
    }

    public function themChiTietLop($data) {
        $sql = "INSERT INTO chi_tiet_doanh_thu_lop (lop_hoc_id, doanh_thu_id, thang, nam, so_hoc_sinh, so_buoi_hoc, tong_thu, tien_tra_gia_su, loi_nhuan_lop, ngay_tao) 
                VALUES (:lop_id, :dt_id, :thang, :nam, :so_hs, :so_buoi, :thu, :chi, :loi_nhuan, NOW())";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([
            ':lop_id' => $data['lop_hoc_id'],
            ':dt_id' => $data['doanh_thu_id'],
            ':thang' => $data['thang'],
            ':nam' => $data['nam'],
            ':so_hs' => $data['so_hoc_sinh'],
            ':so_buoi' => $data['so_buoi_hoc'],
            ':thu' => $data['tong_thu'],
            ':chi' => $data['tien_tra_gia_su'],
            ':loi_nhuan' => $data['loi_nhuan_lop']
        ]);
    }

    public function getChiTietByDoanhThuId($doanhThuId) {
        $sql = "SELECT * FROM chi_tiet_doanh_thu_lop WHERE doanh_thu_id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$doanhThuId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>
