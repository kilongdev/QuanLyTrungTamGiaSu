<?php
require_once __DIR__ . '/../models/DiemDanh.php';
require_once __DIR__ . '/../models/ThongBaoModel.php';
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
                DiemDanh::save($hoc_sinh);
                
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
}