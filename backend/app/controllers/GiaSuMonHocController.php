<?php
require_once __DIR__ . '/../models/GiaSuMonHoc.php';
require_once __DIR__ . '/../models/ThongBaoModel.php';

class GiaSuMonHocController
{
    public static function getAll(): void
    {
        $page = (int)($_GET['page'] ?? 1);
        $limit = (int)($_GET['limit'] ?? 10);
        $offset = ($page - 1) * $limit;
        $giaSuId = isset($_GET['gia_su_id']) ? (int)$_GET['gia_su_id'] : null;
        $monHocId = isset($_GET['mon_hoc_id']) ? (int)$_GET['mon_hoc_id'] : null;

        $result = GiaSuMonHoc::getAll($giaSuId, $monHocId, $limit, $offset);

        echo json_encode([
            'status' => 'success',
            'data' => $result['data'],
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $result['total'],
                'total_pages' => ceil($result['total'] / $limit)
            ]
        ], JSON_UNESCAPED_UNICODE);
    }

    public static function getById(string $id): void
    {
        $giaSuMonHoc = GiaSuMonHoc::findById($id);

        if (!$giaSuMonHoc) {
            http_response_code(404);
            echo json_encode([
                'status' => 'error',
                'message' => 'Không tìm thấy liên kết gia sư - môn học'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }

        echo json_encode([
            'status' => 'success',
            'data' => $giaSuMonHoc
        ], JSON_UNESCAPED_UNICODE);
    }

    public static function create(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        if (empty($input['gia_su_id']) || empty($input['mon_hoc_id'])) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'gia_su_id và mon_hoc_id là bắt buộc'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }

        try {
            $id = GiaSuMonHoc::create($input);

            // Thông báo cho Admin về gia sư đăng k môn học
            ThongBaoModel::guiThongBao(
                1, // Admin ID
                'admin',
                'Gia sư đăng k dạy môn học',
                "Một gia sư vừa đăng k dạy môn học mới. Vui lòng kiểm tra và duyệt.",
                'gia_su'
            );

            http_response_code(201);
            echo json_encode([
                'status' => 'success',
                'message' => 'Tạo liên kết gia sư - môn học thành công',
                'data' => ['gia_su_mon_hoc_id' => $id]
            ], JSON_UNESCAPED_UNICODE);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Lỗi: ' . $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
    }

    public static function update(string $id): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        try {
            $updated = GiaSuMonHoc::update($id, $input);

            if (!$updated) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Không có dữ liệu để cập nhật hoặc liên kết không tồn tại'
                ], JSON_UNESCAPED_UNICODE);
                return;
            }

            echo json_encode([
                'status' => 'success',
                'message' => 'Cập nhật thành công'
            ], JSON_UNESCAPED_UNICODE);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Lỗi: ' . $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
    }

    public static function delete(string $id): void
    {
        try {
            $affected = GiaSuMonHoc::delete($id);
            
            if ($affected === 0) {
                http_response_code(404);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Không tìm thấy liên kết gia sư - môn học'
                ], JSON_UNESCAPED_UNICODE);
                return;
            }

            echo json_encode([
                'status' => 'success',
                'message' => 'Xóa liên kết thành công'
            ], JSON_UNESCAPED_UNICODE);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Lỗi: ' . $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
    }
}
