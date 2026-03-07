<?php
require_once __DIR__ . '/../services/OTPService.php';

class OTPController
{
    public static function sendEmail(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $email = trim($input['email'] ?? '');
        
        if (empty($email)) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Email không được để trống'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }
        
        try {
            $result = OTPService::generate($email);
            $sent = OTPService::sendEmail($email, $result['otp']);
            
            if (!$sent) {
                http_response_code(500);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Không thể gửi email. Vui lòng kiểm tra lại địa chỉ email hoặc thử lại sau.'
                ], JSON_UNESCAPED_UNICODE);
                return;
            }
            
            echo json_encode([
                'status' => 'success',
                'message' => 'Đã gửi mã OTP đến email của bạn',
                'data' => [
                    'token' => $result['token']
                ]
            ], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Lỗi: ' . $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
    }

    public static function verify(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $token = trim($input['token'] ?? '');
        $otp = trim($input['otp'] ?? '');
        
        if (empty($token) || empty($otp)) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Token và mã OTP không được để trống'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }
        
        try {
            $result = OTPService::verify($token, $otp);
            
            if ($result['valid']) {
                echo json_encode([
                    'status' => 'success',
                    'message' => $result['message'],
                    'data' => [
                        'email' => $result['email']
                    ]
                ], JSON_UNESCAPED_UNICODE);
            } else {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => $result['message']
                ], JSON_UNESCAPED_UNICODE);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Lỗi: ' . $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
    }
}
