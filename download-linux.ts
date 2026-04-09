import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ytDlpPath = path.join(__dirname, 'bin', 'yt-dlp');

const file = fs.createWriteStream(ytDlpPath);
https.get('https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux', (response) => {
  if (response.statusCode === 302) {
    https.get(response.headers.location!, (res) => {
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        fs.chmodSync(ytDlpPath, '755');
        console.log('Downloaded yt-dlp_linux successfully');
      });
    });
  } else {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      fs.chmodSync(ytDlpPath, '755');
      console.log('Downloaded yt-dlp_linux successfully');
    });
  }
}).on('error', (err) => {
  fs.unlink(ytDlpPath, () => {});
  console.error('Error downloading:', err.message);
});
