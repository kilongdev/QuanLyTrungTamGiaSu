<?php
require_once __DIR__ . '/../core/Database.php';

class DiemDanh {
    
    public static function getByLichHoc($lich_hoc_id) {
        $sql = "SELECT 
                    hs.hoc_sinh_id, 
                    hs.ho_ten as ten_hoc_sinh, 
                    dd.diem_danh_id,
                    dd.tinh_trang, 
                    dd.ghi_chu
                FROM lich_hoc lh
                JOIN dang_ky_lop dkl ON lh.lop_hoc_id = dkl.lop_hoc_id AND dkl.trang_thai = 'da_duyet'
                JOIN hoc_sinh hs ON dkl.hoc_sinh_id = hs.hoc_sinh_id
                LEFT JOIN diem_danh dd ON dd.lich_hoc_id = lh.lich_hoc_id AND dd.hoc_sinh_id = hs.hoc_sinh_id
                WHERE lh.lich_hoc_id = :lich_hoc_id";
                
        return Database::query($sql, [':lich_hoc_id' => $lich_hoc_id]);
    }

    public static function save($data) {
        $sqlCheck = "SELECT * FROM diem_danh WHERE lich_hoc_id = :lich_hoc_id AND hoc_sinh_id = :hoc_sinh_id";
        $exists = Database::query($sqlCheck, [
            ':lich_hoc_id' => $data['lich_hoc_id'],
            ':hoc_sinh_id' => $data['hoc_sinh_id']
        ]);

        if ($exists) {
            $sql = "UPDATE diem_danh SET tinh_trang = :tinh_trang, ghi_chu = :ghi_chu 
                    WHERE lich_hoc_id = :lich_hoc_id AND hoc_sinh_id = :hoc_sinh_id";
        } else {
            $sql = "INSERT INTO diem_danh (lich_hoc_id, hoc_sinh_id, tinh_trang, ghi_chu) 
                    VALUES (:lich_hoc_id, :hoc_sinh_id, :tinh_trang, :ghi_chu)";
        }

        return Database::execute($sql, [
            ':lich_hoc_id' => $data['lich_hoc_id'],
            ':hoc_sinh_id' => $data['hoc_sinh_id'],
            ':tinh_trang'  => $data['tinh_trang'],
            ':ghi_chu'     => $data['ghi_chu'] ?? null
        ]);
    }
}