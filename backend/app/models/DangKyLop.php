<?php
require_once __DIR__ . '/../core/Database.php';

class DangKyLop {

    public static function create($data) {
        $sqlCheckExist = "SELECT trang_thai FROM dang_ky_lop WHERE hoc_sinh_id = :hs_id AND lop_hoc_id = :lop_id";
        $exist = Database::query($sqlCheckExist, [
            ':hs_id' => $data['hoc_sinh_id'], 
            ':lop_id' => $data['lop_hoc_id']
        ]);
        
        if ($exist && in_array($exist[0]['trang_thai'], ['cho_duyet', 'da_duyet'])) {
            throw new Exception("Học sinh này đã đăng ký hoặc đang chờ duyệt cho lớp này rồi!");
        }

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
        if ($trang_thai_cu !== 'da_duyet' && $trang_thai_moi === 'da_duyet') {
            $sqlCheckCap = "SELECT so_luong_hien_tai, so_luong_toi_da FROM lop_hoc WHERE lop_hoc_id = :lop_hoc_id";
            $lop = Database::query($sqlCheckCap, [':lop_hoc_id' => $lop_hoc_id]);
            
            if ($lop[0]['so_luong_hien_tai'] >= $lop[0]['so_luong_toi_da']) {
                throw new Exception("Không thể duyệt đơn! Lớp học này đã đạt sĩ số tối đa.");
            }
        }

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
        $sql = "SELECT dkl.*, hs.ho_ten AS ten_hoc_sinh 
                FROM dang_ky_lop dkl
                JOIN hoc_sinh hs ON dkl.hoc_sinh_id = hs.hoc_sinh_id
                WHERE dkl.lop_hoc_id = :lop_hoc_id
                ORDER BY dkl.ngay_dang_ky DESC";
        return Database::query($sql, [':lop_hoc_id' => $lop_hoc_id]);
    }

    public static function getAll() {
        $sql = "SELECT dkl.*, hs.ho_ten AS ten_hoc_sinh, lh.ten_lop 
                FROM dang_ky_lop dkl
                JOIN hoc_sinh hs ON dkl.hoc_sinh_id = hs.hoc_sinh_id
                JOIN lop_hoc lh ON dkl.lop_hoc_id = lh.lop_hoc_id
                ORDER BY dkl.trang_thai = 'cho_duyet' DESC, dkl.ngay_dang_ky DESC";
        return Database::query($sql);
    }

    public static function getByPhuHuynh($phu_huynh_id) {
        $sql = "SELECT dkl.*, hs.ho_ten AS ten_hoc_sinh, lh.ten_lop 
                FROM dang_ky_lop dkl
                JOIN hoc_sinh hs ON dkl.hoc_sinh_id = hs.hoc_sinh_id
                JOIN lop_hoc lh ON dkl.lop_hoc_id = lh.lop_hoc_id
                WHERE hs.phu_huynh_id = :phu_huynh_id
                ORDER BY dkl.ngay_dang_ky DESC";
        return Database::query($sql, [':phu_huynh_id' => $phu_huynh_id]);
    }
}