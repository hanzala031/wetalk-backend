const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 1. Check and install Jimp (pure JS image library) programmatically
try {
  require.resolve('jimp');
  console.log('Jimp library is already available.');
} catch (e) {
  console.log('Jimp library is not installed. Installing jimp...');
  try {
    execSync('npm install jimp@0.16.13', { stdio: 'inherit' });
    console.log('Jimp installed successfully.');
  } catch (err) {
    console.error('Failed to install jimp automatically:', err.message);
    console.log('Please run "npm install jimp" manually in your terminal, then run this script again.');
    process.exit(1);
  }
}

const Jimp = require('jimp');

async function fixImages() {
  const imagesDir = path.join(__dirname, 'assets', 'images');
  if (!fs.existsSync(imagesDir)) {
    console.error('Images directory not found:', imagesDir);
    return;
  }

  const files = fs.readdirSync(imagesDir);
  console.log('\nScanning and fixing image extensions in:', imagesDir);
  
  for (const file of files) {
    if (file.toLowerCase().endsWith('.png')) {
      const filePath = path.join(imagesDir, file);
      try {
        // Jimp reads the image content (JPEG, WebP, PNG) and re-saves it based on the .png extension
        const image = await Jimp.read(filePath);
        await image.writeAsync(filePath);
        console.log(`✅ Formatted & verified: ${file}`);
      } catch (err) {
        console.error(`❌ Error fixing ${file}:`, err.message);
      }
    }
  }
  
  console.log('\n🎉 Done! All images are now true PNG files.');
}

fixImages();
