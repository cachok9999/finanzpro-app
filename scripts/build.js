// Build script to prepare web assets for Capacitor packaging into APK
const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '..');
const distDir = path.resolve(__dirname, '..', 'www');

console.log('📦 Generando carpeta www para compilación de APK Android...');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

function copyFolderRecursiveSync(source, target) {
  if (!fs.existsSync(source)) return;

  const files = fs.readdirSync(source);
  files.forEach(file => {
    const curSource = path.join(source, file);
    const curTarget = path.join(target, file);

    if (file === 'www' || file === 'node_modules' || file === '.git' || file === 'android') {
      return;
    }

    if (fs.lstatSync(curSource).isDirectory()) {
      if (!fs.existsSync(curTarget)) fs.mkdirSync(curTarget, { recursive: true });
      copyFolderRecursiveSync(curSource, curTarget);
    } else {
      fs.copyFileSync(curSource, curTarget);
    }
  });
}

copyFolderRecursiveSync(srcDir, distDir);

console.log('✅ Archivos empaquetados en carpeta www/');
console.log('\n📱 Para compilar tu APK Android ejecuta:');
console.log('   npx cap add android');
console.log('   npx cap sync android');
console.log('   npx cap open android');
console.log('   (O en consola: cd android && .\\gradlew.bat assembleDebug)\n');
