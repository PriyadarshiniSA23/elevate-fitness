const fs = require('fs');
const https = require('https');
const path = require('path');

const svgLogo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60" width="100%" height="100%">
  <text x="5" y="42" font-family="'Playfair Display', serif" font-size="34" font-style="italic" font-weight="700" fill="#D4AF37">ELEVATE</text>
  <text x="160" y="42" font-family="'Inter', sans-serif" font-size="12" font-weight="400" fill="#FFFFFF" letter-spacing="3">FITNESS</text>
</svg>`;

const imagesToDownload = {
  'david_vance.jpg': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=600&auto=format&fit=crop',
  'hero_bg.jpg': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920&auto=format&fit=crop'
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

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  for (const [oldStr, newStr] of Object.entries(replacements)) {
    content = content.replace(new RegExp(oldStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newStr);
  }
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
}

(async () => {
  // 1. Create Logo
  fs.writeFileSync('public/images/logo.svg', svgLogo);
  console.log('Created logo.svg');

  // 2. Download Images
  for (let [filename, url] of Object.entries(imagesToDownload)) {
    console.log(`Downloading ${filename}...`);
    await download(url, path.join('public/images', filename));
  }

  // 3. Replacements
  const replacements = {
    // Logo
    'https://lh3.googleusercontent.com/aida/AP1WRLu-UCZzkMlcNeOnDHG-vNiOBqh82_z8WRQqKEq3iwcPyaJtj0k-zPTC__zjzt3qsyJPvartpUtUwK4yFUr4sqHaalQ5N9tdJcb5v55bMv-Ar8wSo-oJVEpfSurT222tIpx1pYtMzxXOXU3yA7bHFlJBLGx25yGvo9q7NsM1BOb7ZOrklDhxhhXbtK9CoNm0XxSYZEDHwwtKXRtxVxBJWJHwDNzXDLAD-vg-P1NMfP4MEZTBqQsG6v2ydvc': '/images/logo.svg',
    // Hero Background
    'https://lh3.googleusercontent.com/aida/AP1WRLvbeeUwEULdOXR_sfp33-Wozfrc2WX5hTPLwnTxwBP2zE8QY172hGx-zI2Zxps5NOo-t66gvTlpms2zZRdymujAMaWPxgWk7_gjBnyZ4BF5uJP9auJH-lI2BzsZeSMqhFyRxg6Ukq_TktdIjLx1yz_a5mG9kIOJWDTfEq1AYDaWqupyObnJ2ovbpl6MFC4hqCDTrooSmw1c43I1tEGrjRzoEIZ8i3mkJyDuiT70NpNd-M36nc3vLGhc5KA': '/images/hero_bg.jpg',
    // Trainers Transformations
    'https://lh3.googleusercontent.com/aida/AP1WRLt-UaGwBRV_ykH102soeqX2t_BqRQeS0C7JxHl3r4mLtnBevbYe0219d3BiNzYtuEIqvNM_Nxfm-Dur9QR9wEsAb1iv-YOmjX6O_GCLNheGGFEreVzT7FiHVIm6xgnZAFUx2RqIVExRkCED_2fjV_FcMRvgDRQjO-uaRw42rbfc5X0c7TYFubk5dXiJQm0U1f4JQhlfuDEsgC3yaLEsqwBVDqhNtsAOlqgtKv29UjhVsDPnDLrvulpQ3nY': '/images/transformation_sarah.jpg',
    'https://lh3.googleusercontent.com/aida/AP1WRLtEHFfHxd6EzvAcG66OFA2qR10FcH6jN5j7dVQJH0H1tEYr3bsS65Sxxj31tB5og_QR6Bv35WYc2Q_cyDsz1FZ_s2rtbVk_Cmn7M8oHp8l1UQQmONo2kniKFQIANoXT1HSWWCKfHlb6zWT2z9fDiE_XEaqXv-Vqec0SpazXVbpfV169ZqrmuBJs6E4Acu4F8PhaTLxr_MGsdamaeq7kSPdHVmUZ_tdL_TOi6_9sbteN5hahbZBxJa35ptc': '/images/transformation_david.jpg',
    // api.js Transformation
    'https://lh3.googleusercontent.com/aida/AP1WRLuMcm0w7TwrgCdyHxDqg64tdvk-lDbH7ezqGK6ZA519zV2f3eK2rArbeZ71-8vHuZuEQOmpxOAhczKDLYztOgwY4pz5sqAP4AVMwZib3d3LTZ6Qdwc0B7XsTTToQdsJwAfUqxQHNqd21rHew7EfZYSE4cb1_SYWrqfLo9LvQy2PhZf_f6DqntrdbUxKGyCZe6HtW_R6JH5bL9WChcqf38KhrrzCzhOxRzv5_c6Es-43uKEakqaUgJuSlGw': '/images/transformation_david.jpg'
  };

  const dirsToSearch = ['src/components', 'src/pages', 'src/services'];
  
  function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
      file = path.join(dir, file);
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
        results = results.concat(walk(file));
      } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
        results.push(file);
      }
    });
    return results;
  }

  let allFiles = [];
  dirsToSearch.forEach(d => { allFiles = allFiles.concat(walk(d)); });

  allFiles.forEach(file => replaceInFile(file, replacements));

  console.log('All done!');
})();
