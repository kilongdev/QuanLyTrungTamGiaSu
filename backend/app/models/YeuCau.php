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
}