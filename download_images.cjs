const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

const srcDir = path.join(__dirname, 'src');
const publicImagesDir = path.join(__dirname, 'public', 'images');

if (!fs.existsSync(publicImagesDir)) {
  fs.mkdirSync(publicImagesDir, { recursive: true });
}

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });
  return arrayOfFiles;
}

const allFiles = getAllFiles(srcDir);
const urlRegex = /https:\/\/lh3\.googleusercontent\.com\/(aida|aida-public)\/[a-zA-Z0-9_-]+/g;

let urlMap = {};

async function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      // Handle redirects if any (usually not for these googleusercontent URLs but just in case)
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
         return downloadImage(response.headers.location, destPath).then(resolve).catch(reject);
      }
      if (response.statusCode === 200) {
        const contentType = response.headers['content-type'] || '';
        let ext = '.jpg';
        if (contentType.includes('image/png')) ext = '.png';
        else if (contentType.includes('image/webp')) ext = '.webp';
        else if (contentType.includes('image/gif')) ext = '.gif';
        else if (contentType.includes('image/svg+xml')) ext = '.svg';
        else if (contentType.includes('image/jpeg')) ext = '.jpg';
        
        const finalDest = destPath + ext;
        const file = fs.createWriteStream(finalDest);
        response.pipe(file);
        file.on('finish', () => {
          file.close(() => resolve(ext));
        });
      } else {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function processFiles() {
  const fileContents = {};
  const uniqueUrls = new Set();

  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf8');
    fileContents[file] = content;
    const matches = content.match(urlRegex);
    if (matches) {
      matches.forEach(m => uniqueUrls.add(m));
    }
  }

  console.log(`Found ${uniqueUrls.size} unique URLs.`);

  let index = 1;
  for (const url of uniqueUrls) {
    const hash = crypto.createHash('md5').update(url).digest('hex').substring(0, 8);
    const destPath = path.join(publicImagesDir, `img_${hash}`);
    try {
      const ext = await downloadImage(url, destPath);
      urlMap[url] = `/images/img_${hash}${ext}`;
      console.log(`[${index}/${uniqueUrls.size}] Downloaded ${url} -> ${urlMap[url]}`);
    } catch (e) {
      console.error(`Error downloading ${url}:`, e);
    }
    index++;
  }

  for (const file of allFiles) {
    let content = fileContents[file];
    let changed = false;
    for (const [url, localPath] of Object.entries(urlMap)) {
      if (content.includes(url)) {
        // Use split/join for global replace to avoid regex special char issues
        content = content.split(url).join(localPath);
        changed = true;
      }
    }
    if (changed) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Updated references in ${file}`);
    }
  }
}

processFiles().then(() => console.log('Done!')).catch(console.error);
