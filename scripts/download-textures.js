const https = require('https');
const fs = require('fs');
const path = require('path');

const textureUrls = {
  'earth-map.png': 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
  'earth-bump.png': 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg',
  'earth-specular.png': 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg',
};

const texturesDir = path.join(process.cwd(), 'public', 'textures');

// Create textures directory if it doesn't exist
if (!fs.existsSync(texturesDir)) {
  fs.mkdirSync(texturesDir, { recursive: true });
}

// Download each texture
Object.entries(textureUrls).forEach(([filename, url]) => {
  const filePath = path.join(texturesDir, filename);
  
  https.get(url, (response) => {
    const fileStream = fs.createWriteStream(filePath);
    response.pipe(fileStream);

    fileStream.on('finish', () => {
      console.log(`Downloaded ${filename}`);
      fileStream.close();
    });
  }).on('error', (err) => {
    console.error(`Error downloading ${filename}:`, err.message);
  });
}); 