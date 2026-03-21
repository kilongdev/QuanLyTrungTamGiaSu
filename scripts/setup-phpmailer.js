#!/usr/bin/env node

/**
 * Setup script to install PHPMailer for backend
 * Runs automatically with: npm install
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const backendDir = path.join(__dirname, '../backend');
const vendorDir = path.join(backendDir, 'vendor');
const phpmailerDir = path.join(vendorDir, 'phpmailer/phpmailer');

console.log('🔧 Setting up PHPMailer for backend...\n');

// Check if PHPMailer already exists
if (fs.existsSync(path.join(phpmailerDir, 'src/PHPMailer.php'))) {
  console.log('✅ PHPMailer is already installed\n');
  process.exit(0);
}

// Create vendor directory if it doesn't exist
if (!fs.existsSync(vendorDir)) {
  fs.mkdirSync(vendorDir, { recursive: true });
}

// Try to use composer if available (recommended approach)
try {
  console.log('📦 Attempting to install PHPMailer via Composer...');
  const composerPath = path.join(backendDir, 'composer.json');
  if (fs.existsSync(composerPath)) {
    execSync('composer require phpmailer/phpmailer', {
      cwd: backendDir,
      stdio: 'inherit'
    });
    console.log('✅ PHPMailer installed via Composer\n');
    
    // Create autoloader if doesn't exist
    const autoloadPath = path.join(vendorDir, 'autoload.php');
    if (!fs.existsSync(autoloadPath)) {
      createAutoloader(autoloadPath);
    }
    
    console.log('✨ PHPMailer setup completed successfully!\n');
    console.log('Next steps:');
    console.log('1. Update EmailService.php with your SMTP credentials');
    console.log('2. Restart your web server');
    console.log('3. Test OTP sending functionality\n');
    process.exit(0);
  }
} catch (err) {
  console.log('ℹ️  Composer not available or failed, skipping automatic setup');
  console.log('   You can install PHPMailer manually:');
  console.log('   1. Install Composer: https://getcomposer.org');
  console.log('   2. Run: composer require phpmailer/phpmailer\n');
  process.exit(0);
}

/**
 * Create PHP autoloader for PHPMailer
 */
function createAutoloader(filePath) {
  const content = `<?php
/**
 * Autoloader for PHPMailer
 */

spl_autoload_register(function ($class) {
    // PSR-4 namespace mapping
    $prefix = 'PHPMailer\\\\PHPMailer\\\\';
    $base_dir = __DIR__ . '/phpmailer/phpmailer/src/';

    // Check if the class uses the namespace prefix
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    // Get the relative class name
    $relative_class = substr($class, $len);

    // Replace namespace separators with directory separators
    $file = $base_dir . str_replace('\\\\', '/', $relative_class) . '.php';

    // If the file exists, require it
    if (file_exists($file)) {
        require $file;
    }
});
`;
  fs.writeFileSync(filePath, content);
}
