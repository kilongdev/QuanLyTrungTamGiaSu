<?php
require_once __DIR__ . '/../core/Database.php';

class DangKyLop {

    public static function create($data) {
        $sqlCheck = "SELECT so_luong_hien_tai, so_luong_toi_da FROM lop_hoc WHERE lop_hoc_id = :lop_hoc_id";
        $lop = Database::query($sqlCheck, [':lop_hoc_id' => $data['lop_hoc_id']]);

        if (!$lop) {
            throw new Exception("Không tìm thấy lớp học này!");
        }
        if ($lop[0]['so_luong_hien_tai'] >= $lop[0]['so_luong_toi_da']) {
            throw new Exception("Từ chối: Lớp học này đã đủ số lượng tối đa!");
        }

        $sql = "INSERT INTO dang_ky_lop (hoc_sinh_id, lop_hoc_id, trang_thai) 
                VALUES (:hoc_sinh_id, :lop_hoc_id, 'cho_duyet')";
        
        return Database::execute($sql, [
            ':hoc_sinh_id' => $data['hoc_sinh_id'],
            ':lop_hoc_id' => $data['lop_hoc_id']
        ]);
    }

    public static function updateStatus($id, $trang_thai_moi) {
        $sqlGet = "SELECT trang_thai, lop_hoc_id FROM dang_ky_lop WHERE dang_ky_id = :id";
        $dangKy = Database::query($sqlGet, [':id' => $id]);
        if (!$dangKy) throw new Exception("Không tìm thấy đơn đăng ký!");
        $trang_thai_cu = $dangKy[0]['trang_thai'];
        $lop_hoc_id = $dangKy[0]['lop_hoc_id'];
        if ($trang_thai_cu === $trang_thai_moi) return true; 
        $sql = "UPDATE dang_ky_lop SET trang_thai = :trang_thai";
        if ($trang_thai_moi === 'da_duyet') {
            $sql .= ", ngay_duyet = CURRENT_TIMESTAMP";
        }
        $sql .= " WHERE dang_ky_id = :id";
        
        $result = Database::execute($sql, [
            ':trang_thai' => $trang_thai_moi,
            ':id' => $id
        ]);

        if ($result) {
            if ($trang_thai_cu !== 'da_duyet' && $trang_thai_moi === 'da_duyet') {
                Database::execute("UPDATE lop_hoc SET so_luong_hien_tai = so_luong_hien_tai + 1 WHERE lop_hoc_id = :lop_id", [':lop_id' => $lop_hoc_id]);
            } elseif ($trang_thai_cu === 'da_duyet' && in_array($trang_thai_moi, ['tu_choi', 'da_huy'])) {
                Database::execute("UPDATE lop_hoc SET so_luong_hien_tai = so_luong_hien_tai - 1 WHERE lop_hoc_id = :lop_id", [':lop_id' => $lop_hoc_id]);
            }
        }
        return $result;
    }
    
    public static function getByLop($lop_hoc_id) {
        $sql = "SELECT * FROM dang_ky_lop WHERE lop_hoc_id = :lop_hoc_id";
        return Database::query($sql, [':lop_hoc_id' => $lop_hoc_id]);
    }
}