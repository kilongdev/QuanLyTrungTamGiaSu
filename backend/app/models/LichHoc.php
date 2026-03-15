<?php
require_once __DIR__ . '/../core/Database.php';

class LichHoc {
    
    public static function create($data) {
        $sql = "INSERT INTO lich_hoc (lop_hoc_id, ngay_hoc, gio_bat_dau, gio_ket_thuc, trang_thai) 
                VALUES (:lop_hoc_id, :ngay_hoc, :gio_bat_dau, :gio_ket_thuc, :trang_thai)";
        
        $params = [
            ':lop_hoc_id' => $data['lop_hoc_id'],
            ':ngay_hoc' => $data['ngay_hoc'],
            ':gio_bat_dau' => $data['gio_bat_dau'],
            ':gio_ket_thuc' => $data['gio_ket_thuc'],
            ':trang_thai' => $data['trang_thai'] ?? 'chua_hoc'
        ];
        return Database::execute($sql, $params);
    }

    public static function getByLopHocId($lop_hoc_id) {
        $sql = "SELECT * FROM lich_hoc WHERE lop_hoc_id = :lop_hoc_id ORDER BY ngay_hoc ASC";
        return Database::query($sql, [':lop_hoc_id' => $lop_hoc_id]);
    }

    public static function getAll() {
        $sql = "SELECT * FROM lich_hoc ORDER BY ngay_hoc DESC, gio_bat_dau ASC";
        return Database::query($sql);
    }

    public static function getByGiaSuId($gia_su_id) {
        $sql = "SELECT lh.*, lh.trang_thai as trang_thai_buoi_hoc,
                       lh_c.ten_lop, lh_c.mon_hoc_id
                FROM lich_hoc lh
                JOIN lop_hoc lh_c ON lh.lop_hoc_id = lh_c.lop_hoc_id
                WHERE lh_c.gia_su_id = :gia_su_id 
                ORDER BY lh.ngay_hoc ASC, lh.gio_bat_dau ASC";
        return Database::query($sql, [':gia_su_id' => $gia_su_id]);
    }

    public static function getByPhuHuynhId($phu_huynh_id) {
        $sql = "SELECT lh.*, lh.trang_thai as trang_thai_buoi_hoc,
                       lh_c.ten_lop, lh_c.mon_hoc_id,
                       hs.ho_ten as ten_hoc_sinh
                FROM lich_hoc lh
                JOIN lop_hoc lh_c ON lh.lop_hoc_id = lh_c.lop_hoc_id
                JOIN dang_ky_lop dkl ON lh_c.lop_hoc_id = dkl.lop_hoc_id
                JOIN hoc_sinh hs ON dkl.hoc_sinh_id = hs.hoc_sinh_id
                WHERE hs.phu_huynh_id = :phu_huynh_id 
                  AND dkl.trang_thai = 'da_duyet'
                ORDER BY lh.ngay_hoc ASC, lh.gio_bat_dau ASC";
        
        return Database::query($sql, [':phu_huynh_id' => $phu_huynh_id]);
    }

    public static function updateStatus($id, $trang_thai) {
        $sql = "UPDATE lich_hoc SET trang_thai = :trang_thai WHERE lich_hoc_id = :id";
        return Database::execute($sql, [
            ':id' => $id,
            ':trang_thai' => $trang_thai
        ]);
    }
    
    public static function update($id, $data) {
        $sql = "UPDATE lich_hoc 
                SET lop_hoc_id = :lop_hoc_id, ngay_hoc = :ngay_hoc, 
                    gio_bat_dau = :gio_bat_dau, gio_ket_thuc = :gio_ket_thuc 
                WHERE lich_hoc_id = :id";
        
        $params = [
            ':id' => $id,
            ':lop_hoc_id' => $data['lop_hoc_id'],
            ':ngay_hoc' => $data['ngay_hoc'],
            ':gio_bat_dau' => $data['gio_bat_dau'],
            ':gio_ket_thuc' => $data['gio_ket_thuc']
        ];
        return Database::execute($sql, $params);
    }

    public static function checkConflict($lop_hoc_id, $ngay_hoc, $gio_bat_dau, $gio_ket_thuc, $lich_hoc_id_tru_ra = null) {
        $sqlGiaSu = "SELECT gia_su_id FROM lop_hoc WHERE lop_hoc_id = :lop_hoc_id";
        $lop = Database::query($sqlGiaSu, [':lop_hoc_id' => $lop_hoc_id]);
        
        if (!$lop || empty($lop)) return false; 
        $gia_su_id = $lop[0]['gia_su_id'];
        $sql = "SELECT lh.lich_hoc_id 
                FROM lich_hoc lh
                JOIN lop_hoc lh_c ON lh.lop_hoc_id = lh_c.lop_hoc_id
                WHERE lh_c.gia_su_id = :gia_su_id 
                  AND lh.ngay_hoc = :ngay_hoc
                  AND (
                      (lh.gio_bat_dau < :gio_ket_thuc AND lh.gio_ket_thuc > :gio_bat_dau)
                  )";
        
        $params = [
            ':gia_su_id' => $gia_su_id,
            ':ngay_hoc' => $ngay_hoc,
            ':gio_bat_dau' => $gio_bat_dau,
            ':gio_ket_thuc' => $gio_ket_thuc
        ];

        if ($lich_hoc_id_tru_ra) {
            $sql .= " AND lh.lich_hoc_id != :lich_hoc_id_tru_ra";
            $params[':lich_hoc_id_tru_ra'] = $lich_hoc_id_tru_ra;
        }

        $result = Database::query($sql, $params);
        return count($result) > 0; 
    }

    public static function delete($id) {
        $sql = "DELETE FROM lich_hoc WHERE lich_hoc_id = :id";
        return Database::execute($sql, [':id' => $id]);
    }
}