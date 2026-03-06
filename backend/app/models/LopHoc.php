<?php
require_once __DIR__ . '/../core/Database.php';

class LopHoc {
    
    public static function create($data) {
        $sql = "INSERT INTO lop_hoc 
                (gia_su_id, mon_hoc_id, khoi_lop, gia_toan_khoa, so_buoi_hoc, gia_moi_buoi, so_luong_toi_da, loai_chi_tra, gia_tri_chi_tra, chu_ky_thanh_toan, trang_thai) 
                VALUES 
                (:gia_su_id, :mon_hoc_id, :khoi_lop, :gia_toan_khoa, :so_buoi_hoc, :gia_moi_buoi, :so_luong_toi_da, :loai_chi_tra, :gia_tri_chi_tra, :chu_ky_thanh_toan, :trang_thai)";
        
        $params = [
            ':gia_su_id' => $data['gia_su_id'] ?? null,
            ':mon_hoc_id' => $data['mon_hoc_id'],
            ':khoi_lop' => $data['khoi_lop'] ?? null,
            ':gia_toan_khoa' => $data['gia_toan_khoa'] ?? null,
            ':so_buoi_hoc' => $data['so_buoi_hoc'] ?? null,
            ':gia_moi_buoi' => $data['gia_moi_buoi'] ?? null,
            ':so_luong_toi_da' => $data['so_luong_toi_da'] ?? 1,
            ':loai_chi_tra' => $data['loai_chi_tra'] ?? 'phan_tram',
            ':gia_tri_chi_tra' => $data['gia_tri_chi_tra'] ?? null,
            ':chu_ky_thanh_toan' => $data['chu_ky_thanh_toan'] ?? 'theo_thang',
            ':trang_thai' => $data['trang_thai'] ?? 'sap_mo'
        ];

        return Database::execute($sql, $params);
    }

    public static function getAll() {
        $sql = "SELECT * FROM lop_hoc ORDER BY ngay_tao DESC";
        return Database::query($sql);
    }

    public static function update($id, $data) {
        $sql = "UPDATE lop_hoc SET 
                gia_su_id = :gia_su_id, 
                mon_hoc_id = :mon_hoc_id, 
                khoi_lop = :khoi_lop, 
                gia_toan_khoa = :gia_toan_khoa, 
                so_buoi_hoc = :so_buoi_hoc, 
                gia_moi_buoi = :gia_moi_buoi, 
                so_luong_toi_da = :so_luong_toi_da,
                loai_chi_tra = :loai_chi_tra,
                gia_tri_chi_tra = :gia_tri_chi_tra,
                chu_ky_thanh_toan = :chu_ky_thanh_toan,
                trang_thai = :trang_thai
                WHERE lop_hoc_id = :id";
                
        $params = [
            ':id' => $id,
            ':gia_su_id' => $data['gia_su_id'] ?? null,
            ':mon_hoc_id' => $data['mon_hoc_id'],
            ':khoi_lop' => $data['khoi_lop'] ?? null,
            ':gia_toan_khoa' => $data['gia_toan_khoa'] ?? null,
            ':so_buoi_hoc' => $data['so_buoi_hoc'] ?? null,
            ':gia_moi_buoi' => $data['gia_moi_buoi'] ?? null,
            ':so_luong_toi_da' => $data['so_luong_toi_da'] ?? 1,
            ':loai_chi_tra' => $data['loai_chi_tra'] ?? 'phan_tram',
            ':gia_tri_chi_tra' => $data['gia_tri_chi_tra'] ?? null,
            ':chu_ky_thanh_toan' => $data['chu_ky_thanh_toan'] ?? 'theo_thang',
            ':trang_thai' => $data['trang_thai'] ?? 'sap_mo'
        ];

        return Database::execute($sql, $params);
    }

    public static function delete($id) {
        $sql = "DELETE FROM lop_hoc WHERE lop_hoc_id = :id";
        return Database::execute($sql, [':id' => $id]);
    }

    public static function getById($id) {
        $sql = "SELECT * FROM lop_hoc WHERE lop_hoc_id = :id";
        $result = Database::query($sql, [':id' => $id]);
        return $result ? $result[0] : null;
    }
}