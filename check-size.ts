import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ytDlpPath = path.join(__dirname, 'bin', 'yt-dlp');
const stats = fs.statSync(ytDlpPath);
console.log('File size:', stats.size);
