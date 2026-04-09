import fs from 'fs';
import path from 'path';
import YTDlpWrapClass from 'yt-dlp-wrap';

const YTDlpWrap: any = (YTDlpWrapClass as any).default || YTDlpWrapClass;

export class VideoDownloader {
  private ytDlpWrap: any;
  private cookiesPath: string;

  constructor(ytDlpPath: string) {
    this.ytDlpWrap = new YTDlpWrap();
    this.ytDlpWrap.setBinaryPath(ytDlpPath);
    this.cookiesPath = path.join(process.cwd(), 'cookies.txt');
  }

  private buildCommand(url: string): string[] {
    const args = [
      url,
      '--dump-json',
      '--no-check-certificate',
      '--extractor-args', 'youtube:player_client=android,web',
      '--force-ipv4',
      '--geo-bypass',
      '--sleep-interval', '2',
      '--max-sleep-interval', '5',
      '--rm-cache-dir'
    ];

    // Support Cookies
    if (fs.existsSync(this.cookiesPath)) {
      args.push('--cookies', this.cookiesPath);
    }

    // Optional Proxy
    if (process.env.PROXY_URL) {
      args.push('--proxy', process.env.PROXY_URL);
    }

    return args;
  }

  private async executeCommand(args: string[]): Promise<any> {
    const output = await this.ytDlpWrap.execPromise(args);
    return JSON.parse(output);
  }

  private async retryLogic(url: string, maxRetries: number = 3): Promise<any> {
    let attempt = 0;
    const args = this.buildCommand(url);

    while (attempt < maxRetries) {
      try {
        console.log(`[Worker] Attempt ${attempt + 1}/${maxRetries} for URL: ${url}`);
        const result = await this.executeCommand(args);
        return result;
      } catch (error: any) {
        const errorMessage = error.message || String(error);
        console.error(`[Worker] Error on attempt ${attempt + 1}:`, errorMessage);

        const isRateLimited = errorMessage.includes('HTTP Error 429') || errorMessage.includes('Sign in to confirm you’re not a bot');
        
        if (isRateLimited && attempt < maxRetries - 1) {
          attempt++;
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
          console.log(`[Worker] Rate limited. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }
  }

  public async getVideoInfo(url: string): Promise<any> {
    console.log(`[Worker] Incoming request to parse URL: ${url}`);
    return this.retryLogic(url);
  }
}
