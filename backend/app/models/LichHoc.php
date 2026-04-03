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

    // ======================================================================
    // CỖ MÁY ĐỒNG BỘ: TÍCH HỢP "KHÓA DATABASE" CHỐNG TRÙNG LẶP LỊCH
    // ======================================================================
    public static function syncLichDinhKy($lop_hoc_id, $ngay_bat_dau, $ngay_trong_tuan, $thoi_gian_tung_ngay, $tong_so_buoi) {
        $lockName = "sync_lich_" . $lop_hoc_id;
        $lock = Database::queryOne("SELECT GET_LOCK(?, 10) as lk", [$lockName]);
        
        if (!$lock || $lock['lk'] != 1) return 0; 

        try {
            date_default_timezone_set('Asia/Ho_Chi_Minh'); 
            $today = date('Y-m-d');
            
            // 1. Bảo vệ lịch sử (Giữ lại các buổi đã học hoặc ở quá khứ)
            Database::execute(
                "UPDATE lich_hoc SET lich_dinh_ky_id = NULL 
                 WHERE lop_hoc_id = ? AND (trang_thai = 'da_hoc' OR ngay_hoc < ?)", 
                [$lop_hoc_id, $today]
            );
            
            // 2. Dọn dẹp tương lai
            Database::execute(
                "DELETE FROM lich_hoc 
                 WHERE lop_hoc_id = ? AND (trang_thai IS NULL OR trang_thai != 'da_hoc') AND ngay_hoc >= ?", 
                [$lop_hoc_id, $today]
            );
            
            // 3. Xóa định kỳ cũ và cập nhật cái mới
            Database::execute("DELETE FROM lich_dinh_ky WHERE lop_hoc_id = ?", [$lop_hoc_id]);
            
            $mapThuDinhKy = [];
            foreach ($ngay_trong_tuan as $thu) {
                if (isset($thoi_gian_tung_ngay[$thu]['gio_bat_dau']) && isset($thoi_gian_tung_ngay[$thu]['gio_ket_thuc'])) {
                    $gio_bat_dau = $thoi_gian_tung_ngay[$thu]['gio_bat_dau'];
                    $gio_ket_thuc = $thoi_gian_tung_ngay[$thu]['gio_ket_thuc'];
                    Database::execute(
                        "INSERT INTO lich_dinh_ky (lop_hoc_id, thu_trong_tuan, gio_bat_dau, gio_ket_thuc, ngay_bat_dau, trang_thai) 
                         VALUES (?, ?, ?, ?, ?, 'hoat_dong')", 
                        [$lop_hoc_id, $thu, $gio_bat_dau, $gio_ket_thuc, $ngay_bat_dau]
                    );
                    $mapThuDinhKy[$thu] = Database::lastInsertId();
                }
            }

            // 4. Kiểm đếm lịch sử để bù trừ
            $existingDates = [];
            $keptSessions = Database::query("SELECT ngay_hoc FROM lich_hoc WHERE lop_hoc_id = ?", [$lop_hoc_id]);
            if ($keptSessions) {
                foreach ($keptSessions as $ss) {
                    $existingDates[] = $ss['ngay_hoc'];
                }
            }
            
            $so_buoi_da_giu = count($existingDates);
            $so_buoi_can_tao = $tong_so_buoi - $so_buoi_da_giu;
            $count_created = 0;

            // 5. Rải bù đắp số buổi còn thiếu
            if ($so_buoi_can_tao > 0) {
                $current_date = $ngay_bat_dau;
                if ($current_date < $today) $current_date = $today; 
                
                $loop_guard = 0;
                while ($count_created < $so_buoi_can_tao && $loop_guard < 365) {
                    $loop_guard++;
                    $day_w = (int)date('w', strtotime($current_date));
                    $thu = ($day_w === 0) ? 8 : $day_w + 1; 

                    if (in_array($thu, $ngay_trong_tuan) && !in_array($current_date, $existingDates) && isset($mapThuDinhKy[$thu])) {
                        $gio_bat_dau = $thoi_gian_tung_ngay[$thu]['gio_bat_dau'];
                        $gio_ket_thuc = $thoi_gian_tung_ngay[$thu]['gio_ket_thuc'];

                        Database::execute(
                            "INSERT INTO lich_hoc (lop_hoc_id, lich_dinh_ky_id, ngay_hoc, gio_bat_dau, gio_ket_thuc, trang_thai) 
                             VALUES (?, ?, ?, ?, ?, 'chua_hoc')",
                            [$lop_hoc_id, $mapThuDinhKy[$thu], $current_date, $gio_bat_dau, $gio_ket_thuc]
                        );
                        $count_created++;
                        $existingDates[] = $current_date; 
                    }
                    $current_date = date('Y-m-d', strtotime($current_date . ' + 1 day'));
                }
            }
            return $count_created;
            
        } finally {
            Database::execute("SELECT RELEASE_LOCK(?)", [$lockName]);
        }
    }

    public static function getByLopHocId($lop_hoc_id) {
        $sql = "SELECT * FROM lich_hoc WHERE lop_hoc_id = :lop_hoc_id ORDER BY ngay_hoc ASC";
        return Database::query($sql, [':lop_hoc_id' => $lop_hoc_id]);
    }

    public static function getAll() {
        $sql = "SELECT lh.*, lh_c.ten_lop, gs.ho_ten as ten_gia_su
                FROM lich_hoc lh
                LEFT JOIN lop_hoc lh_c ON lh.lop_hoc_id = lh_c.lop_hoc_id
                LEFT JOIN gia_su gs ON lh_c.gia_su_id = gs.gia_su_id
                ORDER BY lh.ngay_hoc DESC, lh.gio_bat_dau ASC";
        return Database::query($sql);
    }

    public static function getByGiaSuId($gia_su_id) {
        $sql = "SELECT lh.*, lh.trang_thai as trang_thai_buoi_hoc,
                       lh_c.ten_lop, lh_c.mon_hoc_id,
                       ldk_min.ngay_khai_giang,
                       CASE 
                            WHEN ldk_min.ngay_khai_giang IS NOT NULL AND lh.ngay_hoc >= ldk_min.ngay_khai_giang 
                            THEN CEIL((DATEDIFF(lh.ngay_hoc, ldk_min.ngay_khai_giang) + 1) / 7)
                            ELSE NULL 
                       END as tuan_hoc_thu
                FROM lich_hoc lh
                JOIN lop_hoc lh_c ON lh.lop_hoc_id = lh_c.lop_hoc_id
                LEFT JOIN (
                    SELECT lop_hoc_id, MIN(ngay_bat_dau) as ngay_khai_giang
                    FROM lich_dinh_ky
                    WHERE trang_thai = 'hoat_dong'
                    GROUP BY lop_hoc_id
                ) ldk_min ON lh.lop_hoc_id = ldk_min.lop_hoc_id
                WHERE lh_c.gia_su_id = :gia_su_id 
                  AND lh_c.trang_thai != 'dong' 
                ORDER BY lh.ngay_hoc ASC, lh.gio_bat_dau ASC";
        
        return Database::query($sql, [':gia_su_id' => $gia_su_id]);
    }

    public static function getByPhuHuynhId($phu_huynh_id) {
        $sql = "SELECT lh.*, lh.trang_thai as trang_thai_buoi_hoc,
                       lh_c.ten_lop, lh_c.mon_hoc_id,
                       hs.ho_ten as ten_hoc_sinh,
                       gs.ho_ten as ten_gia_su,
                       ldk_min.ngay_khai_giang,
                       CASE
                            WHEN ldk_min.ngay_khai_giang IS NOT NULL AND lh.ngay_hoc >= ldk_min.ngay_khai_giang
                            THEN CEIL((DATEDIFF(lh.ngay_hoc, ldk_min.ngay_khai_giang) + 1) / 7)
                            ELSE NULL
                       END as tuan_hoc_thu
                FROM lich_hoc lh
                JOIN lop_hoc lh_c ON lh.lop_hoc_id = lh_c.lop_hoc_id
                JOIN dang_ky_lop dkl ON dkl.lop_hoc_id = lh_c.lop_hoc_id
                JOIN hoc_sinh hs ON dkl.hoc_sinh_id = hs.hoc_sinh_id
                LEFT JOIN gia_su gs ON lh_c.gia_su_id = gs.gia_su_id
                LEFT JOIN (
                    SELECT lop_hoc_id, MIN(ngay_bat_dau) as ngay_khai_giang
                    FROM lich_dinh_ky
                    WHERE trang_thai = 'hoat_dong'
                    GROUP BY lop_hoc_id
                ) ldk_min ON lh.lop_hoc_id = ldk_min.lop_hoc_id
                WHERE hs.phu_huynh_id = :phu_huynh_id
                  AND dkl.trang_thai IN ('da_duyet', 'da_duyet_truc_tiep')
                  AND lh_c.trang_thai != 'dong'
                  AND lh.trang_thai != 'da_huy'
                ORDER BY lh.ngay_hoc ASC, lh.gio_bat_dau ASC";

        return Database::query($sql, [':phu_huynh_id' => $phu_huynh_id]);
    }

    public static function updateStatus($id, $trang_thai) {
        $sql = "UPDATE lich_hoc SET trang_thai = :trang_thai WHERE lich_hoc_id = :id";
        return Database::execute($sql, [
            ':id' => $id,
            ':trang_thai' => $trang_thai
        ]);
    }
    
    public static function update($id, $data) {
        $sql = "UPDATE lich_hoc 
                SET lop_hoc_id = :lop_hoc_id, ngay_hoc = :ngay_hoc, 
                    gio_bat_dau = :gio_bat_dau, gio_ket_thuc = :gio_ket_thuc 
                WHERE lich_hoc_id = :id";
        
        $params = [
            ':id' => $id,
            ':lop_hoc_id' => $data['lop_hoc_id'],
            ':ngay_hoc' => $data['ngay_hoc'],
            ':gio_bat_dau' => $data['gio_bat_dau'],
            ':gio_ket_thuc' => $data['gio_ket_thuc']
        ];
        return Database::execute($sql, $params);
    }

    public static function checkConflict($lop_hoc_id, $ngay_hoc, $gio_bat_dau, $gio_ket_thuc, $lich_hoc_id_tru_ra = null) {
        $sqlGiaSu = "SELECT gia_su_id FROM lop_hoc WHERE lop_hoc_id = :lop_hoc_id";
        $lop = Database::query($sqlGiaSu, [':lop_hoc_id' => $lop_hoc_id]);
        $gia_su_id = ($lop && !empty($lop)) ? $lop[0]['gia_su_id'] : null;

        $sql = "SELECT lh.lich_hoc_id 
                FROM lich_hoc lh
                JOIN lop_hoc lh_c ON lh.lop_hoc_id = lh_c.lop_hoc_id
                WHERE lh.ngay_hoc = :ngay_hoc
                  AND (lh.gio_bat_dau < :gio_ket_thuc AND lh.gio_ket_thuc > :gio_bat_dau)
                  AND (lh.lop_hoc_id = :lop_hoc_id " . ($gia_su_id ? " OR lh_c.gia_su_id = :gia_su_id" : "") . ")";
        
        $params = [
            ':ngay_hoc' => $ngay_hoc,
            ':gio_bat_dau' => $gio_bat_dau,
            ':gio_ket_thuc' => $gio_ket_thuc,
            ':lop_hoc_id' => $lop_hoc_id
        ];

        if ($gia_su_id) $params[':gia_su_id'] = $gia_su_id;

        if ($lich_hoc_id_tru_ra) {
            $sql .= " AND lh.lich_hoc_id != :lich_hoc_id_tru_ra";
            $params[':lich_hoc_id_tru_ra'] = $lich_hoc_id_tru_ra;
        }

        $result = Database::query($sql, $params);
        return count($result) > 0; 
    }

    public static function delete($id) {
        $sql = "DELETE FROM lich_hoc WHERE lich_hoc_id = :id";
        return Database::execute($sql, [':id' => $id]);
    }
}