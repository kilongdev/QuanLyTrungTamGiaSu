<?php
require_once __DIR__ . '/base.php';

class LuongGiaSuModel extends BaseModel {
    protected $table = 'luong_gia_su';
    protected $primaryKey = 'luong_id';

    public function findAll() {
        $sql = "SELECT 
                       lgs.gia_su_id,
                       lgs.thang,
                       lgs.nam,
                       gs.ho_ten as ten_giasu,
                       COUNT(lgs.luong_id) as so_lop,
              SUM(CASE WHEN lgs.trang_thai_thanh_toan = 'da_thanh_toan' THEN lgs.tien_tra_gia_su ELSE 0 END) as tong_luong_da_thanh_toan,
              SUM(CASE WHEN lgs.trang_thai_thanh_toan IN ('chua_thanh_toan', 'qua_han') THEN lgs.tien_tra_gia_su ELSE 0 END) as tong_luong_chua_thanh_toan,
              SUM(lgs.tien_tra_gia_su) as tong_luong_tat_ca,
              SUM(CASE WHEN lgs.trang_thai_thanh_toan IN ('chua_thanh_toan', 'qua_han') THEN lgs.tien_tra_gia_su ELSE 0 END) as tong_luong,
                       GROUP_CONCAT(lgs.luong_id) as luong_ids,
                       GROUP_CONCAT(DISTINCT lh.ten_lop SEPARATOR ', ') as cac_lop,
                       MAX(lgs.trang_thai_thanh_toan) as trang_thai_thanh_toan,
                       SUM(CASE WHEN lgs.trang_thai_thanh_toan = 'chua_thanh_toan' THEN 1 ELSE 0 END) as so_lop_chua_thanh_toan,
                       SUM(CASE WHEN lgs.trang_thai_thanh_toan = 'qua_han' THEN 1 ELSE 0 END) as so_lop_qua_han,
                       SUM(CASE WHEN lgs.trang_thai_thanh_toan = 'da_thanh_toan' THEN 1 ELSE 0 END) as so_lop_da_thanh_toan,
                       MAX(lgs.ngay_tao) as ngay_tao,
                       CONCAT(LPAD(lgs.thang, 2, '0'), '/', lgs.nam) as thang_nam
                FROM {$this->table} lgs
                LEFT JOIN gia_su gs ON lgs.gia_su_id = gs.gia_su_id
                LEFT JOIN lop_hoc lh ON lgs.lop_hoc_id = lh.lop_hoc_id
                GROUP BY lgs.gia_su_id, lgs.thang, lgs.nam
                ORDER BY lgs.nam DESC, lgs.thang DESC";
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getDetailByGiaSuMonthYear($giaSuId, $thang, $nam) {
        $sql = "SELECT lgs.*, 
                       gs.ho_ten as ten_giasu, gs.so_dien_thoai, gs.email,
                       lh.ten_lop, mh.ten_mon_hoc
                FROM {$this->table} lgs
                JOIN gia_su gs ON lgs.gia_su_id = gs.gia_su_id
                LEFT JOIN lop_hoc lh ON lgs.lop_hoc_id = lh.lop_hoc_id
                LEFT JOIN mon_hoc mh ON lh.mon_hoc_id = mh.mon_hoc_id
                WHERE lgs.gia_su_id = ? AND lgs.thang = ? AND lgs.nam = ?
                ORDER BY lh.ten_lop";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$giaSuId, $thang, $nam]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $sql = "INSERT INTO {$this->table} (gia_su_id, lop_hoc_id, thang, nam, so_buoi_day, tong_tien_thu, tien_tra_gia_su, loai_chi_tra, gia_tri_ap_dung, trang_thai_thanh_toan, ngay_den_han, ngay_tao) 
                VALUES (:gs_id, :lop_id, :thang, :nam, :so_buoi, :tong_thu, :tien_tra, :loai, :gia_tri, 'chua_thanh_toan', :ngay_den_han, NOW())";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':gs_id' => $data['gia_su_id'],
            ':lop_id' => $data['lop_hoc_id'],
            ':thang' => $data['thang'],
            ':nam' => $data['nam'],
            ':so_buoi' => $data['so_buoi_day'] ?? 0,
            ':tong_thu' => $data['tong_tien_thu'] ?? 0,
            ':tien_tra' => $data['tien_tra_gia_su'] ?? 0,
            ':loai' => $data['loai_chi_tra'] ?? 'co_dinh',
            ':gia_tri' => $data['gia_tri_ap_dung'] ?? 0,
            ':ngay_den_han' => $data['ngay_den_han'] ?? null
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
