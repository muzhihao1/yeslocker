// 创建占位图片的Node.js脚本
const fs = require('fs');
const path = require('path');

// Base64编码的1x1透明PNG
const transparentPNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

// Base64编码的占位图片（灰色背景）
const placeholderPNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

// 需要创建的图片列表
const images = [
  'default-avatar.png',
  'empty-locker.png',
  'storage-intro.png',
  'ad-banner-1.jpg',
  'logo.png'
];

// 创建图片文件
images.forEach(filename => {
  const buffer = Buffer.from(transparentPNG, 'base64');
  const filePath = path.join(__dirname, filename);
  
  fs.writeFileSync(filePath, buffer);
  console.log(`Created: ${filename}`);
});

console.log('All placeholder images created!');