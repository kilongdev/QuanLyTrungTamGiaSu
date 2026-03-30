<?php
require_once __DIR__ . '/../models/DiemDanh.php';
require_once __DIR__ . '/../models/ThongBaoModel.php';
require_once __DIR__ . '/../models/DoanhThuModel.php';
require_once __DIR__ . '/../core/Database.php';

class DiemDanhController {

    public function saveDanhSach() {
        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data['lich_hoc_id']) || empty($data['danh_sach'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Thiếu ID lịch học hoặc danh sách điểm danh"]);
            return;
        }

        try {
            $lich_hoc_id = $data['lich_hoc_id'];
            
            // Lấy thông tin lịch học
            $lichHoc = Database::queryOne(
                "SELECT lh.*, lo.ten_lop, gs.ho_ten as ten_gia_su 
                 FROM lich_hoc lh 
                 JOIN lop_hoc lo ON lh.lop_hoc_id = lo.lop_hoc_id
                 LEFT JOIN gia_su gs ON lo.gia_su_id = gs.gia_su_id
                 WHERE lh.lich_hoc_id = ?",
                [$lich_hoc_id]
            );
            
            foreach ($data['danh_sach'] as $hoc_sinh) {
                $hoc_sinh['lich_hoc_id'] = $lich_hoc_id;
                $hoc_sinh['ngay_diem_danh'] = $this->buildAttendanceDatetime($lichHoc);
                
                // Lưu điểm danh
                DiemDanh::save($hoc_sinh);
                
                // Luong/doanh thu se duoc tinh lai theo toan bo du lieu sau khi luu xong danh sach.
                
                // Gửi thông báo cho phụ huynh về tình trạng điểm danh
                if (!empty($hoc_sinh['hoc_sinh_id'])) {
                    $phuHuynh = Database::queryOne(
                        "SELECT ph.phu_huynh_id, ph.ho_ten FROM hoc_sinh hs 
                         JOIN phu_huynh ph ON hs.phu_huynh_id = ph.phu_huynh_id 
                         WHERE hs.hoc_sinh_id = ?",
                        [$hoc_sinh['hoc_sinh_id']]
                    );
                    
                    if ($phuHuynh) {
                        $tinhTrangText = [
                            'co_mat' => 'có mặt',
                            'vang' => 'vắng mặt',
                            'vang_co_phep' => 'vắng có phép'
                        ];
                        $trangThai = $tinhTrangText[$hoc_sinh['tinh_trang']] ?? $hoc_sinh['tinh_trang'];
                        $tenLop = $lichHoc['ten_lop'] ?? 'lớp học';
                        
                        ThongBaoModel::guiThongBao(
                            $phuHuynh['phu_huynh_id'],
                            'phu_huynh',
                            'Điểm danh học sinh',
                            "Học sinh {$phuHuynh['ho_ten']} đã {$trangThai} trong buổi học lớp {$tenLop} ngày {$lichHoc['ngay_hoc']}.",
                            'lich_hoc'
                        );
                    }
                }
            }

            if (!empty($lichHoc['lop_hoc_id']) && !empty($lichHoc['ngay_hoc'])) {
                $this->syncRevenueForClassMonth($lichHoc['lop_hoc_id'], $lichHoc['ngay_hoc']);
            }

            Database::execute("UPDATE lich_hoc SET trang_thai = 'da_hoc' WHERE lich_hoc_id = :id", [':id' => $lich_hoc_id]);
            echo json_encode(["status" => "success", "message" => "Đã lưu điểm danh thành công!"]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Lỗi: " . $e->getMessage()]);
        }
    }

    public function getByLich($lich_hoc_id) {
        $result = DiemDanh::getByLichHoc($lich_hoc_id);
        echo json_encode(["status" => "success", "data" => $result]);
    }

    public function getByClass($lopHocId) {
        if (empty($lopHocId)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Thiếu ID lớp học"]);
            return;
        }

        try {
            // Get all attendance records for schedules of this class
            $sql = "SELECT dd.*, lh.ngay_hoc, lh.gio_bat_dau, lh.gio_ket_thuc, hs.ho_ten as ten_hoc_sinh
                    FROM diem_danh dd
                    JOIN lich_hoc lh ON dd.lich_hoc_id = lh.lich_hoc_id
                    JOIN hoc_sinh hs ON dd.hoc_sinh_id = hs.hoc_sinh_id
                    WHERE lh.lop_hoc_id = :lop_hoc_id
                    ORDER BY lh.ngay_hoc DESC, hs.ho_ten";
            
            $result = Database::query($sql, [':lop_hoc_id' => $lopHocId]);
            
            if ($result) {
                echo json_encode(["status" => "success", "data" => $result]);
            } else {
                echo json_encode(["status" => "success", "data" => []]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }

    public function getClassOverview($lopHocId) {
        if (empty($lopHocId)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Thiếu ID lớp học"]);
            return;
        }

        try {
            $lopHoc = Database::queryOne(
                "SELECT lh.lop_hoc_id, lh.ten_lop, lh.khoi_lop, lh.so_buoi_hoc, lh.trang_thai,
                        mh.ten_mon_hoc, gs.ho_ten AS ten_gia_su
                 FROM lop_hoc lh
                 LEFT JOIN mon_hoc mh ON lh.mon_hoc_id = mh.mon_hoc_id
                 LEFT JOIN gia_su gs ON lh.gia_su_id = gs.gia_su_id
                 WHERE lh.lop_hoc_id = ?",
                [$lopHocId]
            );

            if (!$lopHoc) {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "Không tìm thấy lớp học"]);
                return;
            }

            $hocSinhs = Database::query(
                "SELECT hs.hoc_sinh_id, hs.ho_ten, hs.khoi_lop
                 FROM dang_ky_lop dkl
                 JOIN hoc_sinh hs ON dkl.hoc_sinh_id = hs.hoc_sinh_id
                 WHERE dkl.lop_hoc_id = ? AND dkl.trang_thai = 'da_duyet'
                 ORDER BY hs.ho_ten ASC",
                [$lopHocId]
            );

            $lichHocs = Database::query(
                "SELECT lh.lich_hoc_id, lh.ngay_hoc, lh.gio_bat_dau, lh.gio_ket_thuc, lh.trang_thai,
                        COALESCE(dd_stats.so_ban_ghi, 0) AS so_ban_ghi_diem_danh
                 FROM lich_hoc lh
                 LEFT JOIN (
                    SELECT lich_hoc_id, COUNT(*) AS so_ban_ghi
                    FROM diem_danh
                    GROUP BY lich_hoc_id
                 ) dd_stats ON dd_stats.lich_hoc_id = lh.lich_hoc_id
                 WHERE lh.lop_hoc_id = ?
                 ORDER BY lh.ngay_hoc ASC, lh.gio_bat_dau ASC",
                [$lopHocId]
            );

            $lichDinhKy = Database::query(
                "SELECT lich_dinh_ky_id, thu_trong_tuan, gio_bat_dau, gio_ket_thuc, ngay_bat_dau, ngay_ket_thuc, trang_thai
                 FROM lich_dinh_ky
                 WHERE lop_hoc_id = ?
                 ORDER BY thu_trong_tuan ASC, gio_bat_dau ASC",
                [$lopHocId]
            );

            $diemDanhRows = Database::query(
                "SELECT dd.lich_hoc_id, dd.hoc_sinh_id, dd.tinh_trang, dd.ghi_chu, dd.ngay_diem_danh
                 FROM diem_danh dd
                 JOIN lich_hoc lh ON lh.lich_hoc_id = dd.lich_hoc_id
                 WHERE lh.lop_hoc_id = ?",
                [$lopHocId]
            );

            $attendanceMap = [];
            foreach ($diemDanhRows as $row) {
                $lichHocId = (int)$row['lich_hoc_id'];
                $hocSinhId = (int)$row['hoc_sinh_id'];
                if (!isset($attendanceMap[$lichHocId])) {
                    $attendanceMap[$lichHocId] = [];
                }
                $attendanceMap[$lichHocId][$hocSinhId] = [
                    'tinh_trang' => $row['tinh_trang'],
                    'ghi_chu' => $row['ghi_chu']
                ];
            }

            echo json_encode([
                "status" => "success",
                "data" => [
                    "lop_hoc" => $lopHoc,
                    "hoc_sinh" => $hocSinhs,
                    "lich_hoc" => $lichHocs,
                    "lich_dinh_ky" => $lichDinhKy,
                    "attendance_map" => $attendanceMap
                ]
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Lỗi: " . $e->getMessage()]);
        }
    }

    /**
     * Save attendance for today for a class
     * Gets or creates a schedule for today, then saves attendance records
     */
    public function saveAttendanceForToday($id = null) {
        $data = json_decode(file_get_contents("php://input"), true);

        $lop_hoc_id = $id ?: ($data['lop_hoc_id'] ?? null);

        if (empty($lop_hoc_id) || empty($data['danh_sach'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Thiếu ID lớp học hoặc danh sách điểm danh"]);
            return;
        }

        try {
            // Get or create schedule for today
            $schedule = DiemDanh::getOrCreateScheduleForToday($lop_hoc_id);
            
            if (!$schedule) {
                throw new Exception("Không thể tạo lịch học cho hôm nay");
            }

            $lich_hoc_id = $schedule['lich_hoc_id'];
            
            // Get class and teacher info for notification
            $lichHoc = Database::queryOne(
                "SELECT lh.*, lo.ten_lop, gs.ho_ten as ten_gia_su 
                 FROM lich_hoc lh 
                 JOIN lop_hoc lo ON lh.lop_hoc_id = lo.lop_hoc_id
                 LEFT JOIN gia_su gs ON lo.gia_su_id = gs.gia_su_id
                 WHERE lh.lich_hoc_id = ?",
                [$lich_hoc_id]
            );
            
            // Save each attendance record
            foreach ($data['danh_sach'] as $hoc_sinh) {
                $hoc_sinh['lich_hoc_id'] = $lich_hoc_id;
                $hoc_sinh['ngay_diem_danh'] = $this->buildAttendanceDatetime($lichHoc ?: $schedule);
                DiemDanh::save($hoc_sinh);
                
                // Send notification to parents about attendance
                if (!empty($hoc_sinh['hoc_sinh_id'])) {
                    $phuHuynh = Database::queryOne(
                        "SELECT ph.phu_huynh_id, ph.ho_ten FROM hoc_sinh hs 
                         JOIN phu_huynh ph ON hs.phu_huynh_id = ph.phu_huynh_id 
                         WHERE hs.hoc_sinh_id = ?",
                        [$hoc_sinh['hoc_sinh_id']]
                    );
                    
                    if ($phuHuynh) {
                        $tinhTrangText = [
                            'co_mat' => 'có mặt',
                            'vang' => 'vắng mặt',
                            'vang_co_phep' => 'vắng có phép'
                        ];
                        $trangThai = $tinhTrangText[$hoc_sinh['tinh_trang']] ?? $hoc_sinh['tinh_trang'];
                        $tenLop = $lichHoc['ten_lop'] ?? 'lớp học';
                        
                        ThongBaoModel::guiThongBao(
                            $phuHuynh['phu_huynh_id'],
                            'phu_huynh',
                            'Điểm danh học sinh',
                            "Học sinh đã {$trangThai} trong buổi học lớp {$tenLop} ngày hôm nay.",
                            'lich_hoc'
                        );
                    }
                }
            }

            if (!empty($lop_hoc_id) && !empty($schedule['ngay_hoc'])) {
                $this->syncRevenueForClassMonth($lop_hoc_id, $schedule['ngay_hoc']);
            }

            // Update schedule status to 'da_hoc'
            Database::execute("UPDATE lich_hoc SET trang_thai = 'da_hoc' WHERE lich_hoc_id = :id", [':id' => $lich_hoc_id]);
            
            echo json_encode([
                "status" => "success",
                "message" => "Đã lưu điểm danh cho hôm nay thành công!",
                "data" => ["lich_hoc_id" => $lich_hoc_id, "ngay_hoc" => $schedule['ngay_hoc']]
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Lỗi: " . $e->getMessage()]);
        }
    }

    /**
     * Save attendance for a selected date for a class
     */
    public function saveAttendanceByDate($id = null) {
        $data = json_decode(file_get_contents("php://input"), true);

        $lop_hoc_id = $id ?: ($data['lop_hoc_id'] ?? null);
        $ngay_hoc = $data['ngay_hoc'] ?? null;

        if (empty($lop_hoc_id) || empty($ngay_hoc) || empty($data['danh_sach'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Thiếu ID lớp học, ngày học hoặc danh sách điểm danh"]);
            return;
        }

        try {
            $schedule = DiemDanh::getOrCreateScheduleByDate($lop_hoc_id, $ngay_hoc);

            if (!$schedule) {
                throw new Exception("Không thể tạo lịch học cho ngày đã chọn");
            }

            $lich_hoc_id = $schedule['lich_hoc_id'];

            $payload = [
                'lich_hoc_id' => $lich_hoc_id,
                'danh_sach' => $data['danh_sach']
            ];

            // Reuse existing save workflow by directly running the same persistence logic.
            foreach ($payload['danh_sach'] as $hoc_sinh) {
                $hoc_sinh['lich_hoc_id'] = $lich_hoc_id;
                $hoc_sinh['ngay_diem_danh'] = $this->buildAttendanceDatetime($schedule);

                DiemDanh::save($hoc_sinh);
            }

            if (!empty($lop_hoc_id) && !empty($schedule['ngay_hoc'])) {
                $this->syncRevenueForClassMonth($lop_hoc_id, $schedule['ngay_hoc']);
            }

            Database::execute("UPDATE lich_hoc SET trang_thai = 'da_hoc' WHERE lich_hoc_id = :id", [':id' => $lich_hoc_id]);

            echo json_encode([
                "status" => "success",
                "message" => "Đã lưu điểm danh cho ngày đã chọn thành công!",
                "data" => ["lich_hoc_id" => $lich_hoc_id, "ngay_hoc" => $schedule['ngay_hoc']]
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Lỗi: " . $e->getMessage()]);
        }
    }

    private function syncRevenueForClassMonth($lopHocId, $ngayHoc) {
        $thang = (int)date('n', strtotime($ngayHoc));
        $nam = (int)date('Y', strtotime($ngayHoc));

        $doanhThuModel = new DoanhThuModel();
        $doanhThuModel->syncClassRevenueFromAttendance((int)$lopHocId, $thang, $nam, true);
    }

    private function buildAttendanceDatetime($schedule) {
        $ngayHoc = $schedule['ngay_hoc'] ?? date('Y-m-d');
        $gioDiemDanh = $schedule['gio_bat_dau'] ?? '00:00:00';

        $timestamp = strtotime($ngayHoc . ' ' . $gioDiemDanh);
        if ($timestamp === false) {
            return date('Y-m-d H:i:s');
        }

        return date('Y-m-d H:i:s', $timestamp);
    }

}