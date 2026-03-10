<?php
require_once __DIR__ . '/../core/Database.php';

class LopHoc {

    private static function buildTenLop($data) {
        $tenLop = isset($data['ten_lop']) ? trim((string)$data['ten_lop']) : '';
        if ($tenLop !== '') {
            return $tenLop;
        }

        $tenMonHoc = 'Mon';
        if (!empty($data['mon_hoc_id'])) {
            $monHoc = Database::query(
                "SELECT ten_mon_hoc FROM mon_hoc WHERE mon_hoc_id = :id LIMIT 1",
                [':id' => $data['mon_hoc_id']]
            );
            if (!empty($monHoc[0]['ten_mon_hoc'])) {
                $tenMonHoc = $monHoc[0]['ten_mon_hoc'];
            }
        }

        $khoiLop = isset($data['khoi_lop']) ? trim((string)$data['khoi_lop']) : '';
        $khoiLop = $khoiLop !== '' ? $khoiLop : '...';

        return $tenMonHoc . ' - Lop ' . $khoiLop;
    }

    private static function normalizeNgayKetThuc($value) {
        if ($value === null) {
            return null;
        }

        $ngayKetThuc = trim((string)$value);
        return $ngayKetThuc === '' ? null : $ngayKetThuc;
    }
    
    public static function create($data) {
        $sql = "INSERT INTO lop_hoc 
                (mon_hoc_id, ten_lop, gia_su_id, khoi_lop, gia_toan_khoa, so_buoi_hoc, gia_moi_buoi, so_luong_toi_da, loai_chi_tra, gia_tri_chi_tra, chu_ky_thanh_toan, trang_thai, ngay_ket_thuc) 
                VALUES 
                (:mon_hoc_id, :ten_lop, :gia_su_id, :khoi_lop, :gia_toan_khoa, :so_buoi_hoc, :gia_moi_buoi, :so_luong_toi_da, :loai_chi_tra, :gia_tri_chi_tra, :chu_ky_thanh_toan, :trang_thai, :ngay_ket_thuc)";
        
        $params = [
            ':mon_hoc_id' => $data['mon_hoc_id'],
            ':ten_lop' => self::buildTenLop($data),
            ':gia_su_id' => $data['gia_su_id'] ?? null,
            ':khoi_lop' => $data['khoi_lop'] ?? null,
            ':gia_toan_khoa' => $data['gia_toan_khoa'] ?? null,
            ':so_buoi_hoc' => $data['so_buoi_hoc'] ?? null,
            ':gia_moi_buoi' => $data['gia_moi_buoi'] ?? null,
            ':so_luong_toi_da' => $data['so_luong_toi_da'] ?? 1,
            ':loai_chi_tra' => $data['loai_chi_tra'] ?? 'phan_tram',
            ':gia_tri_chi_tra' => $data['gia_tri_chi_tra'] ?? null,
            ':chu_ky_thanh_toan' => $data['chu_ky_thanh_toan'] ?? 'theo_thang',
            ':trang_thai' => $data['trang_thai'] ?? 'sap_mo',
            ':ngay_ket_thuc' => self::normalizeNgayKetThuc($data['ngay_ket_thuc'] ?? null)
        ];

        return Database::execute($sql, $params);
    }

    public static function getAll() {
        $sql = "SELECT lh.*, gs.ho_ten as ten_gia_su, gs.bang_cap, mh.ten_mon_hoc 
                FROM lop_hoc lh 
                LEFT JOIN gia_su gs ON lh.gia_su_id = gs.gia_su_id 
                LEFT JOIN mon_hoc mh ON lh.mon_hoc_id = mh.mon_hoc_id 
                ORDER BY lh.ngay_tao DESC";
        return Database::query($sql);
    }

    public static function update($id, $data) {
        $sql = "UPDATE lop_hoc SET 
                mon_hoc_id = :mon_hoc_id,
                ten_lop = :ten_lop,
                gia_su_id = :gia_su_id, 
                khoi_lop = :khoi_lop, 
                gia_toan_khoa = :gia_toan_khoa, 
                so_buoi_hoc = :so_buoi_hoc, 
                gia_moi_buoi = :gia_moi_buoi, 
                so_luong_toi_da = :so_luong_toi_da,
                loai_chi_tra = :loai_chi_tra,
                gia_tri_chi_tra = :gia_tri_chi_tra,
                chu_ky_thanh_toan = :chu_ky_thanh_toan,
                trang_thai = :trang_thai,
                ngay_ket_thuc = :ngay_ket_thuc
                WHERE lop_hoc_id = :id";
                
        $params = [
            ':id' => $id,
            ':mon_hoc_id' => $data['mon_hoc_id'],
            ':ten_lop' => self::buildTenLop($data),
            ':gia_su_id' => $data['gia_su_id'] ?? null,
            ':khoi_lop' => $data['khoi_lop'] ?? null,
            ':gia_toan_khoa' => $data['gia_toan_khoa'] ?? null,
            ':so_buoi_hoc' => $data['so_buoi_hoc'] ?? null,
            ':gia_moi_buoi' => $data['gia_moi_buoi'] ?? null,
            ':so_luong_toi_da' => $data['so_luong_toi_da'] ?? 1,
            ':loai_chi_tra' => $data['loai_chi_tra'] ?? 'phan_tram',
            ':gia_tri_chi_tra' => $data['gia_tri_chi_tra'] ?? null,
            ':chu_ky_thanh_toan' => $data['chu_ky_thanh_toan'] ?? 'theo_thang',
            ':trang_thai' => $data['trang_thai'] ?? 'sap_mo',
            ':ngay_ket_thuc' => self::normalizeNgayKetThuc($data['ngay_ket_thuc'] ?? null)
        ];

        return Database::execute($sql, $params);
    }

    public static function delete($id) {
        $sql = "DELETE FROM lop_hoc WHERE lop_hoc_id = :id";
        return Database::execute($sql, [':id' => $id]);
    }

    public static function getById($id) {
        $sql = "SELECT lh.*, gs.ho_ten as ten_gia_su, gs.bang_cap, mh.ten_mon_hoc 
                FROM lop_hoc lh 
                LEFT JOIN gia_su gs ON lh.gia_su_id = gs.gia_su_id 
                LEFT JOIN mon_hoc mh ON lh.mon_hoc_id = mh.mon_hoc_id 
                WHERE lh.lop_hoc_id = :id";
        $result = Database::query($sql, [':id' => $id]);
        return $result ? $result[0] : null;
    }
}