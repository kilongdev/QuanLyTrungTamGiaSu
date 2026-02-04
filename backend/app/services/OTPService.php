<?php
require_once __DIR__ . '/../core/JWT.php';
require_once __DIR__ . '/EmailService.php';

class OTPService
{
    private static $expireMinutes = 5;
    private static $otpLength = 6;

    public static function generate(string $email): array
    {
        $otp = str_pad(random_int(0, 999999), self::$otpLength, '0', STR_PAD_LEFT);
        
        $token = JWT::encode([
            'email' => $email,
            'otp' => $otp,
            'exp' => time() + (self::$expireMinutes * 60)
        ]);
        
        return [
            'otp' => $otp,
            'token' => $token
        ];
    }

    public static function sendEmail(string $email, string $otp): bool
    {
        return EmailService::sendOTP($email, $otp);
    }

    public static function verify(string $token, string $inputOtp): array
    {
        $decoded = JWT::decode($token);
        
        if (!$decoded) {
            return ['valid' => false, 'message' => 'Token không hợp lệ'];
        }
        
        if ($decoded['exp'] < time()) {
            return ['valid' => false, 'message' => 'Mã OTP đã hết hạn'];
        }
        
        if ($decoded['otp'] !== $inputOtp) {
            return ['valid' => false, 'message' => 'Mã OTP không đúng'];
        }
        
        return [
            'valid' => true,
            'email' => $decoded['email'],
            'message' => 'Xác minh thành công'
        ];
    }
}
