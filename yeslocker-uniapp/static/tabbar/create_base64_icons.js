// Base64 encoded 1x1 transparent PNG as placeholder
const base64png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

// Create placeholder PNG files
const fs = require('fs');
const path = require('path');

const icons = ['home.png', 'home-active.png', 'storage.png', 'storage-active.png', 'shop.png', 'shop-active.png', 'user.png', 'user-active.png'];

icons.forEach(icon => {
  const buffer = Buffer.from(base64png, 'base64');
  fs.writeFileSync(path.join(__dirname, icon), buffer);
});

console.log('Placeholder icons created!');