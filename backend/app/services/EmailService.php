<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

class EmailService
{
    private static $smtpHost = 'smtp.gmail.com';
    private static $smtpPort = 587;
    private static $smtpUsername = 'n.kimlong205@gmail.com';
    private static $smtpPassword = 'xtsr aaox xbmc xias';
    private static $fromEmail = 'n.kimlong205@gmail.com';
    private static $fromName = 'Trung Tâm Gia Sư';

    public static function sendOTP(string $toEmail, string $otp, string $type = 'register'): bool
    {
        $subject = self::getSubject($type);
        $body = self::getOTPTemplate($otp, $type);
        
        return self::send($toEmail, $subject, $body);
    }

    public static function send(string $to, string $subject, string $body): bool
    {
        $autoloadPath = __DIR__ . '/../../vendor/autoload.php';
        if (!file_exists($autoloadPath)) {
            error_log("PHPMailer chưa được cài đặt. Chạy: composer require phpmailer/phpmailer");
            return false;
        }
        
        require_once $autoloadPath;

        $mail = new PHPMailer(true);

        try {
            $mail->isSMTP();
            $mail->Host = self::$smtpHost;
            $mail->SMTPAuth = true;
            $mail->Username = self::$smtpUsername;
            $mail->Password = self::$smtpPassword;
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = self::$smtpPort;
            $mail->CharSet = 'UTF-8';

            $mail->setFrom(self::$fromEmail, self::$fromName);
            $mail->addAddress($to);

            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body = $body;

            $mail->send();
            return true;

        } catch (Exception $e) {
            error_log("Lỗi gửi email: " . $mail->ErrorInfo);
            return false;
        }
    }

    private static function getSubject(string $type): string
    {
        switch ($type) {
            case 'register':
                return 'Mã xác nhận đăng ký - Trung Tâm Gia Sư';
            case 'login':
                return 'Mã xác nhận đăng nhập - Trung Tâm Gia Sư';
            case 'reset_password':
                return 'Mã đặt lại mật khẩu - Trung Tâm Gia Sư';
            default:
                return 'Mã xác nhận - Trung Tâm Gia Sư';
        }
    }

    private static function getOTPTemplate(string $otp, string $type): string
    {
        $typeText = match($type) {
            'register' => 'đăng ký tài khoản',
            'login' => 'đăng nhập',
            'reset_password' => 'đặt lại mật khẩu',
            default => 'xác minh'
        };

        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #3b82f6; text-align: center; margin-bottom: 20px;">
            Trung Tâm Gia Sư
        </h2>
        
        <p style="color: #333; font-size: 16px;">Xin chào,</p>
        
        <p style="color: #333; font-size: 16px;">
            Mã OTP để {$typeText} của bạn là:
        </p>
        
        <div style="background: #3b82f6; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; letter-spacing: 8px; margin: 20px 0;">
            {$otp}
        </div>
        
        <p style="color: #666; font-size: 14px;">
            ⏰ Mã này có hiệu lực trong <strong>5 phút</strong>.
        </p>
        
        <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.
        </p>
    </div>
</body>
</html>
HTML;
    }
}
