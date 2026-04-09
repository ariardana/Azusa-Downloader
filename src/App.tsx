import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Link as LinkIcon, Loader2, Play, AlertCircle, Github, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

interface VideoFormat {
  format_id: string;
  ext: string;
  resolution: string;
  filesize?: number;
  url: string;
  vcodec: string;
  acodec: string;
}

interface VideoMetadata {
  title: string;
  thumbnail: string;
  duration: number;
  uploader: string;
  view_count: number;
  formats: VideoFormat[];
  webpage_url: string;
  description: string;
}

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    setMetadata(null);

    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to parse video');
      }

      const data = await response.json();
      setMetadata(data);
      toast.success('Video metadata fetched!');
    } catch (err: any) {
      let msg = err.message;
      if (msg.includes('Sign in to confirm you’re not a bot')) {
        msg = "YouTube is temporarily blocking requests from our server. This is a common issue with cloud-based downloaders. Please try a different video or try again later.";
      }
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans selection:bg-orange-100 selection:text-orange-900">
      <Toaster position="top-center" />
      
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 p-1.5 rounded-lg">
              <Download className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">StreamSave</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2">
              <Info className="w-4 h-4" />
              How it works
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Github className="w-4 h-4" />
              Source
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-zinc-900"
          >
            Download Video from <span className="text-orange-500">Anywhere</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-zinc-500 text-lg max-w-2xl mx-auto"
          >
            Paste your link below to download high-quality videos from YouTube, TikTok, Instagram, and more. Fast, free, and secure.
          </motion.p>
        </div>

        {/* Input Section */}
        <Card className="mb-12 border-zinc-200 shadow-xl shadow-zinc-200/50 overflow-hidden">
          <CardContent className="p-6">
            <form onSubmit={handleParse} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <Input 
                  placeholder="Paste video link here (e.g. https://www.youtube.com/watch?...)" 
                  className="pl-10 h-12 border-zinc-200 focus-visible:ring-orange-500"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button 
                type="submit" 
                className="h-12 px-8 bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-all"
                disabled={loading || !url}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Download'
                )}
              </Button>
            </form>
          </CardContent>
          <div className="bg-zinc-50 px-6 py-3 border-t border-zinc-100 flex flex-wrap gap-4 justify-center">
            <Badge variant="secondary" className="bg-white border-zinc-200 text-zinc-600">YouTube</Badge>
            <Badge variant="secondary" className="bg-white border-zinc-200 text-zinc-600">TikTok</Badge>
            <Badge variant="secondary" className="bg-white border-zinc-200 text-zinc-600">Instagram</Badge>
            <Badge variant="secondary" className="bg-white border-zinc-200 text-zinc-600">Facebook</Badge>
            <Badge variant="secondary" className="bg-white border-zinc-200 text-zinc-600">Twitter/X</Badge>
          </div>
          <div className="bg-orange-50/30 px-6 py-2 border-t border-orange-100/50 flex items-center justify-center gap-2">
            <Info className="w-3 h-3 text-orange-500" />
            <p className="text-[10px] text-orange-600/80 font-medium uppercase tracking-wider">
              Note: YouTube may occasionally block requests due to high traffic.
            </p>
          </div>
        </Card>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-700">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Something went wrong</p>
                  <p className="text-sm opacity-90">{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result Section */}
        <AnimatePresence>
          {metadata && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {/* Preview */}
              <div className="md:col-span-1">
                <Card className="border-zinc-200 overflow-hidden sticky top-24">
                  <div className="aspect-video relative group">
                    <img 
                      src={metadata.thumbnail} 
                      alt={metadata.title} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30">
                        <Play className="w-8 h-8 text-white fill-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-mono">
                      {formatDuration(metadata.duration)}
                    </div>
                  </div>
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg leading-tight line-clamp-2">{metadata.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <span className="font-medium text-zinc-700">{metadata.uploader}</span>
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              {/* Download Options */}
              <div className="md:col-span-2">
                <Card className="border-zinc-200 h-full">
                  <CardHeader>
                    <CardTitle>Download Options</CardTitle>
                    <CardDescription>Select your preferred quality and format</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="video" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="video">Video (MP4)</TabsTrigger>
                        <TabsTrigger value="audio">Audio (MP3)</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="video" className="space-y-4">
                        {metadata.formats
                          .filter(f => f.vcodec !== 'none' && f.acodec !== 'none' && (f.ext === 'mp4' || f.ext === 'webm'))
                          .sort((a, b) => {
                            const resA = parseInt(a.resolution) || 0;
                            const resB = parseInt(b.resolution) || 0;
                            return resB - resA;
                          })
                          .slice(0, 6)
                          .map((format, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 hover:bg-zinc-50 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="bg-zinc-100 p-2 rounded text-zinc-500">
                                  <Download className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="font-semibold text-sm">{format.resolution || 'Auto'}</p>
                                  <p className="text-xs text-zinc-500 uppercase">{format.ext} • {formatSize(format.filesize)}</p>
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                                onClick={() => window.open(format.url, '_blank')}
                              >
                                Download
                              </Button>
                            </div>
                          ))}
                      </TabsContent>

                      <TabsContent value="audio" className="space-y-4">
                        {metadata.formats
                          .filter(f => f.vcodec === 'none' && (f.ext === 'm4a' || f.ext === 'mp3' || f.ext === 'webm'))
                          .slice(0, 4)
                          .map((format, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 hover:bg-zinc-50 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="bg-zinc-100 p-2 rounded text-zinc-500">
                                  <Download className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="font-semibold text-sm">Audio Only</p>
                                  <p className="text-xs text-zinc-500 uppercase">{format.ext} • {formatSize(format.filesize)}</p>
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                                onClick={() => window.open(format.url, '_blank')}
                              >
                                Download
                              </Button>
                            </div>
                          ))}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                  <CardFooter className="bg-zinc-50/50 p-4 text-xs text-zinc-400 border-t border-zinc-100">
                    <p>Note: Some videos might open in a new tab. Right-click and "Save video as..." if the download doesn't start automatically.</p>
                  </CardFooter>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features Section */}
        {!metadata && !loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-24">
            <div className="p-6 rounded-2xl bg-white border border-zinc-100 shadow-sm">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Loader2 className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="font-bold mb-2">High Speed</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">Fast processing and high-speed downloads for all supported platforms.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-zinc-100 shadow-sm">
              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <Play className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="font-bold mb-2">Multiple Formats</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">Download in various resolutions from 144p up to 4K, or convert to MP3.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-zinc-100 shadow-sm">
              <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-5 h-5 text-purple-500" />
              </div>
              <h3 className="font-bold mb-2">No Registration</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">Use our service without creating an account or providing personal info.</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-12 bg-white mt-24">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="bg-zinc-900 p-1 rounded">
              <Download className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">StreamSave</span>
          </div>
          <p className="text-zinc-500 text-sm max-w-md mx-auto mb-8">
            StreamSave is a free online tool to download videos from social media platforms. We do not host any copyrighted content on our servers.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm font-medium text-zinc-400">
            <a href="#" className="hover:text-zinc-900 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">Contact</a>
          </div>
          <Separator className="my-8 max-w-xs mx-auto" />
          <p className="text-zinc-400 text-xs">
            © 2026 StreamSave. Built with React & yt-dlp.
          </p>
        </div>
      </footer>
    </div>
  );
}
