<?php
/**
 * OTP Controller
 * Xử lý gửi và xác minh OTP
 */

require_once __DIR__ . '/../services/OTPService.php';

class OTPController
{
    /**
     * Gửi OTP qua Email
     * POST /otp/send
     * Body: { email }
     */
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
            $otp = OTPService::generate($email);
            $sent = OTPService::sendEmail($email, $otp);
            
            if ($sent) {
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Đã gửi mã OTP đến email của bạn'
                ], JSON_UNESCAPED_UNICODE);
            } else {
                http_response_code(500);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Không thể gửi email. Vui lòng thử lại sau.'
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

    /**
     * Xác minh OTP
     * POST /otp/verify
     * Body: { email, otp }
     */
    public static function verify(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $email = trim($input['email'] ?? '');
        $otp = trim($input['otp'] ?? '');
        
        if (empty($email) || empty($otp)) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Email và mã OTP không được để trống'
            ], JSON_UNESCAPED_UNICODE);
            return;
        }
        
        try {
            $valid = OTPService::verify($email, $otp);
            
            if ($valid) {
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Xác minh OTP thành công'
                ], JSON_UNESCAPED_UNICODE);
            } else {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Mã OTP không đúng hoặc đã hết hạn'
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
