<?php
require_once __DIR__ . '/../models/LuongGiaSuModel.php';
require_once __DIR__ . '/../models/ThongBaoModel.php';
require_once __DIR__ . '/../core/Database.php';

class LuongGiaSuController {
    private $model;

    public function __construct() {
        $this->model = new LuongGiaSuModel();
    }

    public function getAll() {
        $data = $this->model->findAll();
        $this->sendResponse(true, 'Danh sách lương', $data);
    }

    public function getByGiaSu($id) {
        $data = $this->model->getByGiaSu($id);
        $this->sendResponse(true, 'Danh sách lương của gia sư', $data);
    }

    public function getDetail($id) {
        try {
            $luong = Database::queryOne(
                "SELECT lg.*, 
                        CONCAT(LPAD(lg.thang, 2, '0'), '/', lg.nam) as thang_nam,
                        gs.ho_ten as ten_giasu, gs.gia_su_id, gs.so_dien_thoai, gs.email,
                        lh.ten_lop, mh.ten_mon_hoc
                 FROM luong_gia_su lg
                 JOIN gia_su gs ON lg.gia_su_id = gs.gia_su_id
                 LEFT JOIN lop_hoc lh ON lg.lop_hoc_id = lh.lop_hoc_id
                 LEFT JOIN mon_hoc mh ON lh.mon_hoc_id = mh.mon_hoc_id
                 WHERE lg.luong_id = ?",
                [$id]
            );
            
            if (!$luong) {
                $this->sendResponse(false, 'Không tìm thấy lương', null, 404);
                return;
            }
            
            $this->sendResponse(true, 'Chi tiết lương', $luong);
        } catch (Exception $e) {
            $this->sendResponse(false, 'Lỗi: ' . $e->getMessage(), null, 500);
        }
    }

    public function getDetailByGroup($giaSuId, $thang, $nam) {
        header('Content-Type: application/json; charset=utf-8');
        
        try {
            $luongList = $this->model->getDetailByGiaSuMonthYear($giaSuId, $thang, $nam);
            
            if (empty($luongList)) {
                echo json_encode(['success' => false, 'message' => 'Không tìm thấy lương', 'data' => null], JSON_UNESCAPED_UNICODE);
                exit;
            }
            
            $tongLuong = array_sum(array_column($luongList, 'tien_tra_gia_su'));
            
            echo json_encode([
                'success' => true,
                'message' => 'Chi tiết lương theo nhóm',
                'data' => [
                    'gia_su_id' => $giaSuId,
                    'thang' => $thang,
                    'nam' => $nam,
                    'ten_giasu' => $luongList[0]['ten_giasu'] ?? '',
                    'so_dien_thoai' => $luongList[0]['so_dien_thoai'] ?? '',
                    'email' => $luongList[0]['email'] ?? '',
                    'tong_luong' => $tongLuong,
                    'so_lop' => count($luongList),
                    'danh_sach_lop' => $luongList
                ]
            ], JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage(), 'data' => null], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    public function create() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (empty($data['gia_su_id']) || empty($data['lop_hoc_id'])) {
            $this->sendResponse(false, 'Thiếu thông tin bắt buộc', null, 400);
            return;
        }
        
        if (empty($data['thang']) || empty($data['nam'])) {
            $this->sendResponse(false, 'Vui lòng nhập tháng và năm', null, 400);
            return;
        }
        
        $lopHocId = (int)$data['lop_hoc_id'];
        $thang = (int)$data['thang'];
        $nam = (int)$data['nam'];
        
        $lopHoc = Database::queryOne(
            "SELECT lop_hoc_id, ten_lop, gia_su_id, gia_toan_khoa, gia_moi_buoi, loai_chi_tra, gia_tri_chi_tra
             FROM lop_hoc WHERE lop_hoc_id = ?",
            [$lopHocId]
        );
        
        if (!$lopHoc) {
            $this->sendResponse(false, 'Không tìm thấy lớp học', null, 404);
            return;
        }
        
        $soBuoiDay = (int)($data['so_buoi_day'] ?? 0);
        $tongTienThu = (int)($data['tong_tien_thu'] ?? 0);
        $tienTraGiaSu = 0;
        $loaiChiTra = $lopHoc['loai_chi_tra'] ?? 'co_dinh';
        $giaTriApDung = (float)($lopHoc['gia_tri_chi_tra'] ?? 0);
        $giaToanKhoa = (float)($lopHoc['gia_toan_khoa'] ?? 0);
        
        if ($loaiChiTra === 'phan_tram') {
            $tienTraGiaSu = $giaToanKhoa * ($giaTriApDung / 100);
        } else {
            $tienTraGiaSu = $giaTriApDung;
        }
        
        $salaryData = [
            'gia_su_id' => $data['gia_su_id'],
            'lop_hoc_id' => $lopHocId,
            'thang' => $thang,
            'nam' => $nam,
            'so_buoi_day' => $soBuoiDay,
            'tong_tien_thu' => $tongTienThu,
            'tien_tra_gia_su' => $tienTraGiaSu,
            'loai_chi_tra' => $loaiChiTra,
            'gia_tri_ap_dung' => $giaTriApDung,
            'trang_thai_thanh_toan' => $data['trang_thai_thanh_toan'] ?? 'chua_thanh_toan'
        ];
        
        $id = $this->model->create($salaryData);
        
        // Gửi thông báo cho gia sư
        $giaSuInfo = Database::queryOne(
            "SELECT ho_ten FROM gia_su WHERE gia_su_id = ?",
            [$data['gia_su_id']]
        );
        
        if ($giaSuInfo) {
            ThongBaoModel::guiThongBao(
                $data['gia_su_id'],
                'gia_su',
                'Lương mới được tạo',
                "Bạn có lương {$this->formatCurrency($tienTraGiaSu)}đ cho lớp {$lopHoc['ten_lop']} - Tháng {$thang}/{$nam}.",
                'luong'
            );
            
            // Thông báo cho admin
            ThongBaoModel::guiThongBao(
                1,
                'admin',
                'Lương gia sư mới được tạo',
                "Lương {$this->formatCurrency($tienTraGiaSu)}đ cho gia sư {$giaSuInfo['ho_ten']} - Lớp {$lopHoc['ten_lop']} - Tháng {$thang}/{$nam}.",
                'luong'
            );
        }
        
        $this->sendResponse(true, 'Tính lương thành công', [
            'id' => $id,
            'tien_tra_gia_su' => $tienTraGiaSu,
            'loai_chi_tra' => $loaiChiTra,
            'gia_tri_ap_dung' => $giaTriApDung
        ]);
    }

    public function update($id) {
        $data = json_decode(file_get_contents('php://input'), true);
        
        try {
            $existing = Database::queryOne("SELECT * FROM luong_gia_su WHERE luong_id = ?", [$id]);
            if (!$existing) {
                $this->sendResponse(false, 'Không tìm thấy lương', null, 404);
                return;
            }
            
            $updateFields = [];
            $params = [];
            
            if (isset($data['tien_tra_gia_su'])) {
                $updateFields[] = "tien_tra_gia_su = ?";
                $params[] = $data['tien_tra_gia_su'];
            }
            if (isset($data['so_buoi_day'])) {
                $updateFields[] = "so_buoi_day = ?";
                $params[] = $data['so_buoi_day'];
            }
            if (isset($data['trang_thai_thanh_toan'])) {
                $updateFields[] = "trang_thai_thanh_toan = ?";
                $params[] = $data['trang_thai_thanh_toan'];
                
                // Gửi thông báo khi thanh toán thành công
                if ($data['trang_thai_thanh_toan'] === 'da_thanh_toan') {
                    $luongInfo = Database::queryOne(
                        "SELECT lg.*, gs.ho_ten as ten_giasu, gs.gia_su_id, lh.ten_lop
                         FROM luong_gia_su lg
                         JOIN gia_su gs ON lg.gia_su_id = gs.gia_su_id
                         LEFT JOIN lop_hoc lh ON lg.lop_hoc_id = lh.lop_hoc_id
                         WHERE lg.luong_id = ?",
                        [$id]
                    );
                    
                    if ($luongInfo) {
                        // Thông báo cho gia sư
                        ThongBaoModel::guiThongBao(
                            $luongInfo['gia_su_id'],
                            'gia_su',
                            'Đã nhận lương',
                            "Bạn đã nhận lương {$this->formatCurrency($luongInfo['tien_tra_gia_su'])}đ cho lớp {$luongInfo['ten_lop']} - Tháng {$luongInfo['thang']}/{$luongInfo['nam']}.",
                            'thanh_toan'
                        );
                        
                        // Thông báo cho admin
                        ThongBaoModel::guiThongBao(
                            1,
                            'admin',
                            'Đã thanh toán lương gia sư',
                            "Đã thanh toán lương {$this->formatCurrency($luongInfo['tien_tra_gia_su'])}đ cho gia sư {$luongInfo['ten_giasu']} - Lớp {$luongInfo['ten_lop']} - Tháng {$luongInfo['thang']}/{$luongInfo['nam']}.",
                            'thanh_toan'
                        );
                    }
                }
            }
            if (isset($data['thang'])) {
                $updateFields[] = "thang = ?";
                $params[] = $data['thang'];
            }
            
            if (!empty($updateFields)) {
                $params[] = $id;
                $sql = "UPDATE luong_gia_su SET " . implode(', ', $updateFields) . " WHERE luong_id = ?";
                Database::execute($sql, $params);
            }
            
            $this->sendResponse(true, 'Cập nhật lương thành công');
        } catch (Exception $e) {
            $this->sendResponse(false, 'Lỗi: ' . $e->getMessage(), null, 500);
        }
    }

    public function delete($id) {
        try {
            $existing = Database::queryOne("SELECT * FROM luong_gia_su WHERE luong_id = ?", [$id]);
            if (!$existing) {
                $this->sendResponse(false, 'Không tìm thấy lương', null, 404);
                return;
            }
            
            Database::execute("DELETE FROM luong_gia_su WHERE luong_id = ?", [$id]);
            $this->sendResponse(true, 'Xóa lương thành công');
        } catch (Exception $e) {
            $this->sendResponse(false, 'Lỗi: ' . $e->getMessage(), null, 500);
        }
    }

    private function sendResponse($success, $message, $data = null, $code = 200) {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => $success, 'message' => $message, 'data' => $data], JSON_UNESCAPED_UNICODE);
        exit;
    }

    private function formatCurrency($amount) {
        return number_format($amount, 0, ',', '.');
    }
}
