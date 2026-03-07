<?php
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/app/services/EmailService.php';

echo "Testing email configuration...\n\n";

// Test send OTP
$testEmail = 'n.kimlong205@gmail.com'; // Thay bằng email của bạn để test
$testOTP = '123456';

echo "Sending test OTP to: {$testEmail}\n";
echo "OTP: {$testOTP}\n\n";

$result = EmailService::sendOTP($testEmail, $testOTP);

if ($result) {
    echo "✓ Email sent successfully!\n";
    echo "Please check your inbox/spam folder.\n";
} else {
    echo "✗ Failed to send email.\n";
    echo "Please check:\n";
    echo "1. SMTP credentials in EmailService.php\n";
    echo "2. Gmail App Password is still valid\n";
    echo "3. Internet connection\n";
    echo "4. PHP error logs for details\n";
}
