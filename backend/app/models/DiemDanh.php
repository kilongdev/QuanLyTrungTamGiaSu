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
            $sql = "UPDATE diem_danh
                    SET tinh_trang = :tinh_trang,
                        ghi_chu = :ghi_chu,
                        ngay_diem_danh = :ngay_diem_danh
                    WHERE lich_hoc_id = :lich_hoc_id AND hoc_sinh_id = :hoc_sinh_id";
        } else {
            $sql = "INSERT INTO diem_danh (lich_hoc_id, hoc_sinh_id, tinh_trang, ghi_chu, ngay_diem_danh)
                    VALUES (:lich_hoc_id, :hoc_sinh_id, :tinh_trang, :ghi_chu, :ngay_diem_danh)";
        }

        return Database::execute($sql, [
            ':lich_hoc_id' => $data['lich_hoc_id'],
            ':hoc_sinh_id' => $data['hoc_sinh_id'],
            ':tinh_trang'  => $data['tinh_trang'],
            ':ghi_chu'     => $data['ghi_chu'] ?? null,
            ':ngay_diem_danh' => $data['ngay_diem_danh'] ?? date('Y-m-d H:i:s')
        ]);
    }

    /**
     * Get or create a schedule for today for a class
     * @param int $lop_hoc_id - Class ID
     * @return array - Schedule record
     */
    public static function getOrCreateScheduleForToday($lop_hoc_id) {
        $today = date('Y-m-d');
        
        // Kiểm tra xem có lịch học cho hôm nay không
        $sql = "SELECT * FROM lich_hoc WHERE lop_hoc_id = :lop_hoc_id AND ngay_hoc = :ngay_hoc";
        $schedule = Database::queryOne($sql, [
            ':lop_hoc_id' => $lop_hoc_id,
            ':ngay_hoc' => $today
        ]);
        
        if ($schedule) {
            return $schedule;
        }
        
        // Nếu chưa có, tạo lịch học mới với giờ mặc định (18:00 - 19:30)
        $insertSql = "INSERT INTO lich_hoc (lop_hoc_id, ngay_hoc, gio_bat_dau, gio_ket_thuc, trang_thai) 
                      VALUES (:lop_hoc_id, :ngay_hoc, :gio_bat_dau, :gio_ket_thuc, :trang_thai)";
        
        Database::execute($insertSql, [
            ':lop_hoc_id' => $lop_hoc_id,
            ':ngay_hoc' => $today,
            ':gio_bat_dau' => '18:00:00',
            ':gio_ket_thuc' => '19:30:00',
            ':trang_thai' => 'chua_hoc'
        ]);
        
        // Lấy lại lịch học vừa tạo
        return Database::queryOne($sql, [
            ':lop_hoc_id' => $lop_hoc_id,
            ':ngay_hoc' => $today
        ]);
    }

    public static function getOrCreateScheduleByDate($lop_hoc_id, $ngay_hoc) {
        $targetDate = date('Y-m-d', strtotime($ngay_hoc));

        $sql = "SELECT * FROM lich_hoc WHERE lop_hoc_id = :lop_hoc_id AND ngay_hoc = :ngay_hoc ORDER BY lich_hoc_id ASC LIMIT 1";
        $schedule = Database::queryOne($sql, [
            ':lop_hoc_id' => $lop_hoc_id,
            ':ngay_hoc' => $targetDate
        ]);

        if ($schedule) {
            return $schedule;
        }

        $weekday = (int)date('w', strtotime($targetDate));
        $thuTrongTuan = $weekday === 0 ? 1 : ($weekday + 1);

        $recurring = Database::queryOne(
            "SELECT lich_dinh_ky_id, gio_bat_dau, gio_ket_thuc
             FROM lich_dinh_ky
             WHERE lop_hoc_id = :lop_hoc_id
               AND trang_thai = 'hoat_dong'
               AND thu_trong_tuan = :thu_trong_tuan
                             AND ngay_bat_dau <= :ngay_hoc_tu
                             AND (ngay_ket_thuc IS NULL OR ngay_ket_thuc >= :ngay_hoc_den)
             ORDER BY gio_bat_dau ASC
             LIMIT 1",
            [
                ':lop_hoc_id' => $lop_hoc_id,
                ':thu_trong_tuan' => $thuTrongTuan,
                                ':ngay_hoc_tu' => $targetDate,
                                ':ngay_hoc_den' => $targetDate
            ]
        );

        if (!$recurring) {
            $recurring = Database::queryOne(
                "SELECT lich_dinh_ky_id, gio_bat_dau, gio_ket_thuc
                 FROM lich_dinh_ky
                 WHERE lop_hoc_id = :lop_hoc_id
                   AND trang_thai = 'hoat_dong'
                 ORDER BY thu_trong_tuan ASC, gio_bat_dau ASC
                 LIMIT 1",
                [':lop_hoc_id' => $lop_hoc_id]
            );
        }

        $gioBatDau = $recurring['gio_bat_dau'] ?? '18:00:00';
        $gioKetThuc = $recurring['gio_ket_thuc'] ?? '19:30:00';
        $lichDinhKyId = $recurring['lich_dinh_ky_id'] ?? null;

        $insertSql = "INSERT INTO lich_hoc (lop_hoc_id, lich_dinh_ky_id, ngay_hoc, gio_bat_dau, gio_ket_thuc, trang_thai)
                      VALUES (:lop_hoc_id, :lich_dinh_ky_id, :ngay_hoc, :gio_bat_dau, :gio_ket_thuc, :trang_thai)";

        Database::execute($insertSql, [
            ':lop_hoc_id' => $lop_hoc_id,
            ':lich_dinh_ky_id' => $lichDinhKyId,
            ':ngay_hoc' => $targetDate,
            ':gio_bat_dau' => $gioBatDau,
            ':gio_ket_thuc' => $gioKetThuc,
            ':trang_thai' => 'chua_hoc'
        ]);

        return Database::queryOne($sql, [
            ':lop_hoc_id' => $lop_hoc_id,
            ':ngay_hoc' => $targetDate
        ]);
    }
}