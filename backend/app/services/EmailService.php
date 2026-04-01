<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../core/Env.php';

class EmailService
{
    private static function getConfig()
    {
        return [
            'host' => Env::get('SMTP_HOST', 'smtp.gmail.com'),
            'port' => Env::get('SMTP_PORT', 587),
            'username' => Env::get('SMTP_USERNAME', ''),
            'password' => Env::get('SMTP_PASSWORD', ''),
            'fromEmail' => Env::get('SMTP_FROM_EMAIL', 'no-reply@example.com'),
            'fromName' => Env::get('SMTP_FROM_NAME', 'Trung Tâm Gia Sư'),
        ];
    }

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

        $config = self::getConfig();
        $mail = new PHPMailer(true);

        try {
            $mail->isSMTP();
            $mail->Host = $config['host'];
            $mail->SMTPAuth = true;
            $mail->Username = $config['username'];
            $mail->Password = $config['password'];
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = $config['port'];
            $mail->CharSet = 'UTF-8';

            // Enable debug in development mode
            if (Env::isDevelopment()) {
                $mail->SMTPDebug = SMTP::DEBUG_OFF; // Change to DEBUG_SERVER for verbose logs
            }

            $mail->setFrom($config['fromEmail'], $config['fromName']);
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
