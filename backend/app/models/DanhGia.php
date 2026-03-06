<?php
require_once __DIR__ . '/../core/Database.php';

class DanhGia {
    
    public static function save($data) {
        $sqlCheck = "SELECT * FROM danh_gia WHERE phu_huynh_id = :phu_huynh_id AND gia_su_id = :gia_su_id";
        $exists = Database::query($sqlCheck, [
            ':phu_huynh_id' => $data['phu_huynh_id'],
            ':gia_su_id'    => $data['gia_su_id']
        ]);

        if ($exists) {
            $sql = "UPDATE danh_gia 
                    SET diem_so = :diem_so, noi_dung = :noi_dung, ngay_danh_gia = NOW() 
                    WHERE phu_huynh_id = :phu_huynh_id AND gia_su_id = :gia_su_id";
        } else {
            $sql = "INSERT INTO danh_gia (phu_huynh_id, gia_su_id, diem_so, noi_dung, ngay_danh_gia) 
                    VALUES (:phu_huynh_id, :gia_su_id, :diem_so, :noi_dung, NOW())";
        }

        return Database::execute($sql, [
            ':phu_huynh_id' => $data['phu_huynh_id'],
            ':gia_su_id'    => $data['gia_su_id'],
            ':diem_so'      => $data['diem_so'],
            ':noi_dung'     => $data['noi_dung'] ?? null
        ]);
    }

    public static function getByGiaSu($gia_su_id) {
        $sql = "SELECT * FROM danh_gia WHERE gia_su_id = :gia_su_id ORDER BY ngay_danh_gia DESC";
        return Database::query($sql, [':gia_su_id' => $gia_su_id]);
    }

    public static function getAverageScore($gia_su_id) {
        $sql = "SELECT AVG(diem_so) as diem_trung_binh, COUNT(danh_gia_id) as tong_luot_danh_gia 
                FROM danh_gia WHERE gia_su_id = :gia_su_id";
        $result = Database::query($sql, [':gia_su_id' => $gia_su_id]);
        return $result[0] ?? ['diem_trung_binh' => 0, 'tong_luot_danh_gia' => 0];
    }

    public static function delete($id) {
        $sql = "DELETE FROM danh_gia WHERE danh_gia_id = :id";
        return Database::execute($sql, [':id' => $id]);
    }
}