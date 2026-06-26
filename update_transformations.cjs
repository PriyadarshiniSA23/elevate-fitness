const fs = require('fs');
const https = require('https');
const path = require('path');

const images = {
  'david_before.jpg': 'https://images.unsplash.com/photo-1542282811-943ef1a647a5?q=80&w=600&auto=format&fit=crop',
  'david_after.jpg': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop',
  'marcus_before.jpg': 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=600&auto=format&fit=crop',
  'marcus_after.jpg': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop',
  'sarah_before.jpg': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600&auto=format&fit=crop',
  'sarah_after.jpg': 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=600&auto=format&fit=crop'
};

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
         download(res.headers.location, dest).then(resolve).catch(reject);
         return;
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => { file.close(resolve); });
    }).on('error', reject);
  });
}

(async () => {
  for (let [filename, url] of Object.entries(images)) {
    console.log(`Downloading ${filename}...`);
    await download(url, path.join('public/images', filename));
  }
  console.log('All transformation images downloaded!');
})();
