<?php
require_once __DIR__ . '/../core/Database.php';

class YeuCau {

    public static function create($data) {
        $sql = "INSERT INTO yeu_cau 
                (nguoi_tao_id, loai_nguoi_tao, phan_loai, tieu_de, noi_dung, lop_hoc_id, dang_ky_id, gia_su_id, trang_thai, ngay_tao) 
                VALUES 
                (:nguoi_tao_id, :loai_nguoi_tao, :phan_loai, :tieu_de, :noi_dung, :lop_hoc_id, :dang_ky_id, :gia_su_id, 'cho_duyet', NOW())";
        
        $params = [
            ':nguoi_tao_id'   => $data['nguoi_tao_id'],
            ':loai_nguoi_tao' => $data['loai_nguoi_tao'],
            ':phan_loai'      => $data['phan_loai'],
            ':tieu_de'        => $data['tieu_de'],
            ':noi_dung'       => $data['noi_dung'],
            ':lop_hoc_id'     => $data['lop_hoc_id'] ?? null,
            ':dang_ky_id'     => $data['dang_ky_id'] ?? null,
            ':gia_su_id'      => $data['gia_su_id'] ?? null
        ];
        
        return Database::execute($sql, $params);
    }

    public static function getAll() {
        $sql = "SELECT * FROM yeu_cau ORDER BY ngay_tao DESC";
        return Database::query($sql);
    }

    public static function getByNguoiTao($nguoi_tao_id, $loai_nguoi_tao) {
        $sql = "SELECT * FROM yeu_cau WHERE nguoi_tao_id = :nguoi_tao_id AND loai_nguoi_tao = :loai_nguoi_tao ORDER BY ngay_tao DESC";
        return Database::query($sql, [
            ':nguoi_tao_id' => $nguoi_tao_id,
            ':loai_nguoi_tao' => $loai_nguoi_tao
        ]);
    }

    public static function updateStatus($id, $data) {
        $sql = "UPDATE yeu_cau 
                SET trang_thai = :trang_thai, 
                    nguoi_xu_ly_id = :nguoi_xu_ly_id, 
                    ghi_chu_xu_ly = :ghi_chu_xu_ly, 
                    ngay_xu_ly = NOW() 
                WHERE yeu_cau_id = :id";
        
        $params = [
            ':id'             => $id,
            ':trang_thai'     => $data['trang_thai'],
            ':nguoi_xu_ly_id' => $data['nguoi_xu_ly_id'],
            ':ghi_chu_xu_ly'  => $data['ghi_chu_xu_ly'] ?? null
        ];
        
        return Database::execute($sql, $params);
    }

    public static function update($id, $data) {
        $sql = "UPDATE yeu_cau 
                SET phan_loai = :phan_loai, 
                    tieu_de = :tieu_de, 
                    noi_dung = :noi_dung 
                WHERE yeu_cau_id = :id AND trang_thai = 'cho_duyet'";
        
        $params = [
            ':id'        => $id,
            ':phan_loai' => $data['phan_loai'],
            ':tieu_de'   => $data['tieu_de'],
            ':noi_dung'  => $data['noi_dung']
        ];
        
        return Database::execute($sql, $params);
    }

    public static function delete($id) {
        $sql = "DELETE FROM yeu_cau WHERE yeu_cau_id = :id";
        return Database::execute($sql, [':id' => $id]);
    }

    public static function getById($id) {
        $sql = "SELECT * FROM yeu_cau WHERE yeu_cau_id = :id";
        $result = Database::query($sql, [':id' => $id]);
        return $result ? $result[0] : null;
    }

    public static function getYeuCauMoiGiaSu($giaSuId) {
        // CẬP NHẬT: Kéo theo Lịch dự kiến, Ngày bắt đầu, Ngày kết thúc và Sĩ số
        $sql = "SELECT yc.*, lh.ten_lop, lh.so_buoi_hoc, lh.gia_toan_khoa, lh.gia_moi_buoi, 
                       lh.loai_chi_tra, lh.khoi_lop, lh.ngay_ket_thuc, lh.so_luong_toi_da, mh.ten_mon_hoc,
                       (SELECT GROUP_CONCAT(DISTINCT CONCAT(
                            CASE DAYOFWEEK(ngay_hoc)
                                WHEN 1 THEN 'CN' WHEN 2 THEN 'T2' WHEN 3 THEN 'T3' 
                                WHEN 4 THEN 'T4' WHEN 5 THEN 'T5' WHEN 6 THEN 'T6' WHEN 7 THEN 'T7'
                            END,
                            ' (', TIME_FORMAT(gio_bat_dau, '%H:%i'), '-', TIME_FORMAT(gio_ket_thuc, '%H:%i'), ')'
                       ) SEPARATOR ', ') 
                       FROM lich_hoc sub_lh WHERE sub_lh.lop_hoc_id = lh.lop_hoc_id) AS lich_hoc_du_kien,
                       (SELECT MIN(ngay_hoc) FROM lich_hoc sub_lh WHERE sub_lh.lop_hoc_id = lh.lop_hoc_id) AS ngay_bat_dau
                FROM yeu_cau yc 
                JOIN lop_hoc lh ON yc.lop_hoc_id = lh.lop_hoc_id 
                LEFT JOIN mon_hoc mh ON lh.mon_hoc_id = mh.mon_hoc_id 
                WHERE yc.gia_su_id = :gia_su_id 
                  AND yc.trang_thai IN ('cho_duyet', 'dang_xu_ly')
                ORDER BY yc.ngay_tao DESC";
        return Database::query($sql, [':gia_su_id' => $giaSuId]);
    }
}