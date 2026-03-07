#!/usr/bin/env node

/**
 * Setup script to install PHPMailer for backend
 * Runs automatically with: npm install
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
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

console.log('📥 Downloading PHPMailer v6.9.1...');

const zipPath = path.join(backendDir, 'phpmailer.zip');
const file = fs.createWriteStream(zipPath);

https.get('https://github.com/PHPMailer/PHPMailer/archive/refs/tags/v6.9.1.zip', (response) => {
  response.pipe(file);

  file.on('finish', () => {
    file.close();
    console.log('✅ Downloaded PHPMailer');

    try {
      // Extract zip file
      console.log('📦 Extracting PHPMailer...');
      const AdmZip = require('adm-zip');
      
      if (!isModuleAvailable('adm-zip')) {
        // Fallback: use system command
        console.log('📦 Using system extraction...');
        if (process.platform === 'win32') {
          execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${backendDir}' -Force"`, { 
            stdio: 'inherit',
            cwd: backendDir 
          });
          execSync(`powershell -Command "Move-Item -Path '${path.join(backendDir, 'PHPMailer-6.9.1')}' -Destination '${path.join(vendorDir, 'phpmailer-temp')}' -Force"`, { 
            stdio: 'inherit' 
          });
        } else {
          execSync(`cd ${backendDir} && unzip -q phpmailer.zip && mv PHPMailer-6.9.1 ${path.join(vendorDir, 'phpmailer-temp')}`);
        }
      } else {
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(backendDir, true);
        fs.renameSync(
          path.join(backendDir, 'PHPMailer-6.9.1'),
          path.join(vendorDir, 'phpmailer-temp')
        );
      }

      // Create proper directory structure
      if (!fs.existsSync(path.join(vendorDir, 'phpmailer'))) {
        fs.mkdirSync(path.join(vendorDir, 'phpmailer'), { recursive: true });
      }
      fs.renameSync(
        path.join(vendorDir, 'phpmailer-temp'),
        phpmailerDir
      );

      // Clean up
      fs.unlinkSync(zipPath);
      console.log('✅ Extracted PHPMailer');

      // Create autoloader if doesn't exist
      const autoloadPath = path.join(vendorDir, 'autoload.php');
      if (!fs.existsSync(autoloadPath)) {
        createAutoloader(autoloadPath);
      }

      console.log('\n✨ PHPMailer setup completed successfully!\n');
      console.log('Next steps:');
      console.log('1. Update EmailService.php with your SMTP credentials');
      console.log('2. Restart your web server');
      console.log('3. Test OTP sending functionality\n');

    } catch (err) {
      console.error('❌ Error extracting PHPMailer:', err.message);
      // Cleanup on error
      if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
      process.exit(1);
    }
  });
}).on('error', (err) => {
  console.error('❌ Download failed:', err.message);
  fs.unlinkSync(zipPath);
  process.exit(1);
});

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

/**
 * Check if a module is available
 */
function isModuleAvailable(name) {
  try {
    require.resolve(name);
    return true;
  } catch (e) {
    return false;
  }
}
