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

    public static function delete($id) {
        $sql = "DELETE FROM lich_hoc WHERE lich_hoc_id = :id";
        return Database::execute($sql, [':id' => $id]);
    }
}