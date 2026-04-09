import { execFile } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import util from 'util';

const execFileAsync = util.promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ytDlpPath = path.join(__dirname, 'bin', 'yt-dlp');

async function test() {
  try {
    const { stdout } = await execFileAsync(ytDlpPath, ['--version']);
    console.log('Version:', stdout.trim());
    
    const { stdout: out2 } = await execFileAsync(ytDlpPath, ['https://youtu.be/sIzRWqRQhi4?si=C9vDiedb0eBjkrAb', '--dump-json', '--no-check-certificate', '--extractor-args', 'youtube:player_client=ios,web']);
    console.log('Output length:', out2.length);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
