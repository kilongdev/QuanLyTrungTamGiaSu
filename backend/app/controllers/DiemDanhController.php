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
                
                // Lấy trạng thái cũ trước khi lưu
                $oldStatus = Database::queryOne(
                    "SELECT tinh_trang FROM diem_danh WHERE lich_hoc_id = ? AND hoc_sinh_id = ?",
                    [$lich_hoc_id, $hoc_sinh['hoc_sinh_id']]
                );
                $oldTinhTrang = $oldStatus ? $oldStatus['tinh_trang'] : null;
                $newTinhTrang = $hoc_sinh['tinh_trang'];
                
                // Lưu điểm danh
                DiemDanh::save($hoc_sinh);
                
                // Chỉ cập nhật lương khi có thay đổi trạng thái liên quan đến có mặt
                $wasPresent = ($oldTinhTrang === 'co_mat');
                $isPresent = ($newTinhTrang === 'co_mat');
                
                if ($wasPresent !== $isPresent && !empty($lichHoc['lop_hoc_id'])) {
                    $thang = date('n', strtotime($lichHoc['ngay_hoc']));
                    $nam = date('Y', strtotime($lichHoc['ngay_hoc']));
                    
                    // Lấy thông tin lớp học để tính lương
                    $lopHoc = Database::queryOne(
                        "SELECT gia_su_id, gia_moi_buoi, so_buoi_hoc, loai_chi_tra, gia_tri_chi_tra FROM lop_hoc WHERE lop_hoc_id = ?",
                        [$lichHoc['lop_hoc_id']]
                    );
                    
                    if ($lopHoc) {
                        // Kiểm tra xem đã có bản ghi lương cho tháng này chưa
                        $luongHienTai = Database::queryOne(
                            "SELECT luong_id, so_buoi_day FROM luong_gia_su 
                             WHERE lop_hoc_id = ? AND thang = ? AND nam = ?",
                            [$lichHoc['lop_hoc_id'], $thang, $nam]
                        );
                        
                        $giaMoiBuoi = (float)($lopHoc['gia_moi_buoi'] ?? 0);
                        $soBuoiHoc = (int)($lopHoc['so_buoi_hoc'] ?? 1);
                        $loaiChiTra = $lopHoc['loai_chi_tra'] ?? 'tien_cu_the';
                        $giaTriApDung = (float)($lopHoc['gia_tri_chi_tra'] ?? 0);
                        
                        // Công thức tính đơn giá buổi cho gia sư
                        if ($loaiChiTra === 'phan_tram') {
                            $donGiaBuoiGiaSu = $giaMoiBuoi * ($giaTriApDung / 100);
                        } else {
                            // tien_cu_the: giá mỗi buổi = giá trị chi trả / số buổi học
                            $donGiaBuoiGiaSu = $soBuoiHoc > 0 ? ($giaTriApDung / $soBuoiHoc) : 0;
                        }
                        
                        if ($luongHienTai) {
                            // +1 nếu mới có mặt, -1 nếu từ có mặt thành vắng
                            $soBuoiMoi = $luongHienTai['so_buoi_day'] + ($isPresent ? 1 : -1);
                            $soBuoiMoi = max(0, $soBuoiMoi); // Không cho âm
                            $tienTraGiaSu = $soBuoiMoi * $donGiaBuoiGiaSu;
                            
                            // Cập nhật số buổi dạy và tiền lương
                            Database::execute(
                                "UPDATE luong_gia_su SET so_buoi_day = ?, tien_tra_gia_su = ? WHERE luong_id = ?",
                                [$soBuoiMoi, $tienTraGiaSu, $luongHienTai['luong_id']]
                            );
                        } else if ($isPresent) {
                            // Chỉ tạo mới nếu học sinh có mặt
                            $tienTraGiaSu = $donGiaBuoiGiaSu;
                            
                            Database::execute(
                                "INSERT INTO luong_gia_su (gia_su_id, lop_hoc_id, thang, nam, so_buoi_day, tien_tra_gia_su, loai_chi_tra, gia_tri_ap_dung, trang_thai_thanh_toan)
                                 VALUES (?, ?, ?, ?, 1, ?, ?, ?, 'chua_thanh_toan')",
                                [$lopHoc['gia_su_id'], $lichHoc['lop_hoc_id'], $thang, $nam, $tienTraGiaSu, $loaiChiTra, $giaTriApDung]
                            );
                        }
                    }
                }
                
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