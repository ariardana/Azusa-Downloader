import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import YTDlpWrapClass from 'yt-dlp-wrap';
const YTDlpWrap: any = (YTDlpWrapClass as any).default || YTDlpWrapClass;
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security and Middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for development/iframe compatibility
  }));
  app.use(cors());
  app.use(express.json());

  // Setup yt-dlp
  const binDir = path.join(__dirname, 'bin');
  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir);
  }
  const ytDlpPath = path.join(binDir, 'yt-dlp');
  
  // Initialize yt-dlp-wrap
  const ytDlpWrap = new YTDlpWrap();
  
  if (!fs.existsSync(ytDlpPath)) {
    console.log('Downloading yt-dlp binary...');
    try {
      await YTDlpWrap.downloadFromGithub(ytDlpPath);
      console.log('yt-dlp binary downloaded successfully.');
      fs.chmodSync(ytDlpPath, '755');
      ytDlpWrap.setBinaryPath(ytDlpPath);
      const version = await ytDlpWrap.getVersion();
      console.log(`yt-dlp version: ${version}`);
    } catch (err) {
      console.error('Failed to download or run yt-dlp:', err);
    }
  } else {
    ytDlpWrap.setBinaryPath(ytDlpPath);
    try {
      const version = await ytDlpWrap.getVersion();
      console.log(`yt-dlp version: ${version}`);
    } catch (err) {
      console.error('Failed to run existing yt-dlp binary:', err);
    }
  }

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/parse', async (req, res) => {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    try {
      console.log(`Parsing URL: ${url}`);
      // Add arguments to help bypass bot detection and 429 errors
      const metadata = await ytDlpWrap.getVideoInfo([
        url,
        '--no-check-certificate',
        '--extractor-args', 'youtube:player_client=ios,web',
        '--force-ipv4',
        '--geo-bypass',
        '--user-agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1'
      ]);
      res.json(metadata);
    } catch (error: any) {
      console.error('Error parsing URL:', error);
      res.status(500).json({ error: error.message || 'Failed to parse video' });
    }
  });

  // Proxy download to avoid CORS issues if needed, 
  // but for now we'll just return the formats and let the client handle it if possible.
  // Some platforms require specific headers, so a proxy might be better.
  app.get('/api/download-proxy', async (req, res) => {
    const { url, filename } = req.query;
    if (!url) return res.status(400).send('URL required');

    try {
      const response = await fetch(url as string);
      const contentType = response.headers.get('content-type');
      if (contentType) res.setHeader('Content-Type', contentType);
      if (filename) res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No body');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    } catch (error) {
      res.status(500).send('Download failed');
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
