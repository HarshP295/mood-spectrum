const fs = require('fs');
const path = require('path');

// Create .env file from config.env
const configPath = path.join(__dirname, 'config.env');
const envPath = path.join(__dirname, '.env');

try {
  if (fs.existsSync(configPath)) {
    fs.copyFileSync(configPath, envPath);
    console.log('✅ Environment file created successfully!');
    console.log('📝 You can now edit .env file if needed');
  } else {
    console.log('❌ config.env file not found');
  }
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
}
