import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Mic, Square, Upload, Volume2, SkipBack, SkipForward, FileText, Share2, Copy, Check } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';
import RecordRTC from 'recordrtc';
import { type ParsedLyric, getDemoLyrics } from '@/lib/lrclib';
import { fetchLyricsMultiSource, parseUserLRCFile, saveUserLyrics, getUserLyrics } from '@/lib/lyrics';
import { searchYouTubeMusic, loadYouTubeIFrameAPI, parseYouTubeDuration } from '@/lib/youtube';
import { uploadRecordingToIrys, type PerformanceMetadata } from '@/lib/arweave';

// Helper function to convert AudioBuffer to WAV
function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const length = buffer.length * buffer.numberOfChannels * 2 + 44;
  const arrayBuffer = new ArrayBuffer(length);
  const view = new DataView(arrayBuffer);
  const channels: Float32Array[] = [];
  let offset = 0;
  let pos = 0;

  // Write WAV header
  const setUint16 = (data: number) => {
    view.setUint16(pos, data, true);
    pos += 2;
  };
  const setUint32 = (data: number) => {
    view.setUint32(pos, data, true);
    pos += 4;
  };

  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"
  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(buffer.numberOfChannels);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels); // avg. bytes/sec
  setUint16(buffer.numberOfChannels * 2); // block-align
  setUint16(16); // 16-bit
  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  // Write interleaved data
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < length) {
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return arrayBuffer;
}

export default function KaraokePage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [volume, setVolume] = useState([80]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [lyricsSource, setLyricsSource] = useState<string>('Demo');
  const [showLyricsUpload, setShowLyricsUpload] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ id: string; url: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const recorderRef = useRef<RecordRTC | null>(null);
  const recordedBlobRef = useRef<Blob | null>(null);
  const youtubePlayerRef = useRef<any>(null);
  const youtubeContainerRef = useRef<HTMLDivElement>(null);
  const syncIntervalRef = useRef<number | null>(null);

  const [lyrics, setLyrics] = useState<ParsedLyric[]>([]);

  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const trackId = searchParams.get('track');
  const [isLoadingTrack, setIsLoadingTrack] = useState(false);
  
  const [trackInfo, setTrackInfo] = useState({
    name: 'Demo Track',
    artist: 'SingCity',
    album: 'Demo Album',
    duration: 60,
    previewUrl: null as string | null,
    youtubeVideoId: null as string | null
  });

  // Load persisted song state from localStorage on mount
  useEffect(() => {
    const savedTrackId = localStorage.getItem('currentTrackId');
    const savedTrackInfo = localStorage.getItem('currentTrackInfo');
    
    if (savedTrackId && savedTrackInfo && !trackId) {
      // Restore saved track if no new track is being loaded
      try {
        const parsed = JSON.parse(savedTrackInfo);
        setTrackInfo(parsed);
        // Update URL to reflect the loaded track
        window.history.replaceState(null, '', `/karaoke?track=${savedTrackId}`);
      } catch (e) {
        console.error('Failed to restore track state:', e);
      }
    }
  }, []);

  // Load track info from Spotify when trackId is available
  useEffect(() => {
    if (!trackId) return;

    async function loadTrackInfo(id: string) {
      try {
        setIsLoadingTrack(true);
        
        const { spotifyRequest } = await import('@/lib/supabase');
        const track = await spotifyRequest(`/tracks/${trackId}`);
        
        console.log('📀 Spotify track loaded:', track.name);
        
        const trackName = track.name;
        const artistName = track.artists.map((a: any) => a.name).join(', ');
        
        // Search YouTube for the track (karaoke/instrumental version)
        console.log('🔍 Searching YouTube for karaoke version:', trackName, '-', artistName);
        let youtubeVideo = await searchYouTubeMusic(trackName, artistName);
        
        // Fallback: Try with just track name if artist-specific search fails
        if (!youtubeVideo) {
          console.log('🔄 Retrying search with track name only...');
          youtubeVideo = await searchYouTubeMusic(trackName, '');
        }
        
        // Fallback: Try with simplified track name (remove features, parentheses)
        if (!youtubeVideo) {
          const simplifiedTrack = trackName.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').replace(/feat\..*$/i, '').trim();
          if (simplifiedTrack !== trackName) {
            console.log('🔄 Retrying with simplified track name:', simplifiedTrack);
            youtubeVideo = await searchYouTubeMusic(simplifiedTrack, artistName);
          }
        }
        
        if (youtubeVideo) {
          console.log('✅ YouTube video found:', youtubeVideo.videoId);
          const youtubeDuration = parseYouTubeDuration(youtubeVideo.duration);
          
          const newTrackInfo = {
            name: trackName,
            artist: artistName,
            album: track.album.name,
            duration: youtubeDuration,
            previewUrl: track.preview_url,
            youtubeVideoId: youtubeVideo.videoId
          };
          setTrackInfo(newTrackInfo);
          
          // Persist to localStorage
          localStorage.setItem('currentTrackId', id);
          localStorage.setItem('currentTrackInfo', JSON.stringify(newTrackInfo));
        } else {
          console.warn('⚠️ No YouTube karaoke video found after all attempts');
          // Show error message to user
          alert(`Could not find a karaoke version for "${trackName}" by ${artistName}. Please try another song.`);
          
          // Don't set track info - keep previous state or demo
          setIsLoadingTrack(false);
          return;
        }
      } catch (error) {
        console.error('Error loading track:', error);
      } finally {
        setIsLoadingTrack(false);
      }
    }

    loadTrackInfo(trackId);
  }, [trackId]);

  // Load lyrics when track info changes
  useEffect(() => {
    // Get current track ID from URL or localStorage
    const currentTrackId = trackId || localStorage.getItem('currentTrackId');
    
    if (!currentTrackId) {
      // No track selected, don't show demo lyrics
      setLyrics([]);
      setLyricsSource('Demo');
      setShowLyricsUpload(false);
      return;
    }

    // Don't fetch lyrics if track info hasn't loaded yet
    if (trackInfo.name === 'Demo Track') {
      return;
    }

    async function loadLyrics() {
      console.log('🎵 Loading lyrics for:', trackInfo.name, '-', trackInfo.artist);
      
      // Check for user-uploaded lyrics first
      const userLyrics = getUserLyrics(currentTrackId);
      if (userLyrics) {
        console.log('✅ Using user-uploaded lyrics');
        setLyrics(userLyrics);
        setLyricsSource('User Upload');
        setShowLyricsUpload(false);
        return;
      }

      // Try multi-source API
      const result = await fetchLyricsMultiSource(
        trackInfo.name,
        trackInfo.artist,
        trackInfo.album,
        trackInfo.duration,
        currentTrackId
      );

      if (result && result.lyrics && result.lyrics.length > 0) {
        console.log('✅ Setting lyrics, count:', result.lyrics.length);
        setLyrics(result.lyrics);
        setLyricsSource(result.source);
        setShowLyricsUpload(false);
      } else {
        // No lyrics found - show upload option but don't use demo
        console.log('⚠️ No lyrics found, showing upload option');
        setLyrics([]);
        setLyricsSource('Not Found');
        setShowLyricsUpload(true);
      }
    }

    loadLyrics();
  }, [trackInfo.name, trackInfo.artist, trackInfo.album, trackInfo.duration, trackId]);

  // Initialize WaveSurfer for visual display only
  useEffect(() => {
    if (waveformRef.current && !wavesurferRef.current) {
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#FF2E7E40',
        progressColor: '#FF2E7E',
        cursorColor: '#1E90FF',
        barWidth: 3,
        barRadius: 3,
        cursorWidth: 2,
        height: 128,
        barGap: 2,
        normalize: true,
        hideScrollbar: true,
        interact: true,
      });

      // Enable click-to-seek on waveform
      wavesurferRef.current.on('click', (relativeX: number) => {
        if (youtubePlayerRef.current && duration > 0) {
          const seekTime = relativeX * duration;
          youtubePlayerRef.current.seekTo(seekTime, true);
        }
      });

      console.log('WaveSurfer initialized for visual display');
    }

    return () => {
      wavesurferRef.current?.destroy();
      wavesurferRef.current = null;
    };
  }, [duration]);

  // Initialize YouTube Player
  useEffect(() => {
    if (!trackInfo.youtubeVideoId) return;

    async function initYouTubePlayer() {
      try {
        await loadYouTubeIFrameAPI();
        
        if (youtubeContainerRef.current && !youtubePlayerRef.current) {
          console.log('🎬 Initializing YouTube player with video:', trackInfo.youtubeVideoId);
          
          youtubePlayerRef.current = new window.YT.Player(youtubeContainerRef.current, {
            width: '100%',
            height: '0', // Hidden player, audio only
            videoId: trackInfo.youtubeVideoId,
            playerVars: {
              autoplay: 0,
              controls: 0,
              disablekb: 1,
              fs: 0,
              modestbranding: 1,
              playsinline: 1,
              enablejsapi: 1,
              origin: window.location.origin,
              rel: 0,
              iv_load_policy: 3,
              cc_load_policy: 0,
            },
            events: {
              onReady: onYouTubePlayerReady,
              onStateChange: onYouTubePlayerStateChange,
              onError: onYouTubePlayerError,
            },
          });
        }
      } catch (error) {
        console.error('Error initializing YouTube player:', error);
      }
    }

    initYouTubePlayer();

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
      if (youtubePlayerRef.current) {
        youtubePlayerRef.current.destroy();
        youtubePlayerRef.current = null;
      }
    };
  }, [trackInfo.youtubeVideoId]);

  // YouTube player ready callback
  const onYouTubePlayerReady = (event: any) => {
    console.log('✅ YouTube player ready');
    
    // Set volume immediately
    if (typeof event.target.setVolume === 'function') {
      event.target.setVolume(volume[0]);
      console.log('🔊 Set volume to:', volume[0]);
    }
    
    // Start sync interval
    syncIntervalRef.current = window.setInterval(() => {
      if (youtubePlayerRef.current && typeof youtubePlayerRef.current.getPlayerState === 'function') {
        const state = youtubePlayerRef.current.getPlayerState();
        if (state === 1) { // Playing
          const currentTime = youtubePlayerRef.current.getCurrentTime();
          setCurrentTime(currentTime);
          
          // Update WaveSurfer progress
          if (wavesurferRef.current) {
            const videoDuration = youtubePlayerRef.current.getDuration();
            if (videoDuration > 0) {
              const progress = currentTime / videoDuration;
              wavesurferRef.current.seekTo(progress);
            }
          }
        }
      }
    }, 100);
  };
  
  // YouTube player error callback
  const onYouTubePlayerError = (event: any) => {
    console.error('❌ YouTube player error:', event.data);
    // Error codes: 2 = invalid parameter, 5 = HTML5 player error, 100 = video not found, 101/150 = video not embeddable
  };

  // YouTube player state change callback
  const onYouTubePlayerStateChange = (event: any) => {
    const state = event.data;
    // -1: unstarted, 0: ended, 1: playing, 2: paused, 3: buffering, 5: cued
    
    console.log('🎬 YouTube player state changed to:', state);
    
    // Try to get duration on state changes
    if (event.target && typeof event.target.getDuration === 'function') {
      const videoDuration = event.target.getDuration();
      if (videoDuration > 0 && duration === 0) {
        console.log('📏 YouTube video duration (from state change):', videoDuration);
        setDuration(videoDuration);
        
        // Generate realistic waveform visualization
        if (wavesurferRef.current) {
          const peakCount = Math.floor(videoDuration * 20);
          const peaks = new Array(peakCount).fill(0).map((_, i) => {
            const baseWave = Math.sin(i / 20) * 0.5 + 0.5;
            const randomVariation = Math.random() * 0.4;
            const envelope = Math.min(1, i / 100) * Math.min(1, (peakCount - i) / 100);
            return (baseWave * 0.6 + randomVariation * 0.4) * envelope * 0.9 + 0.1;
          });
          const dualChannelPeaks = [peaks, peaks];
          wavesurferRef.current.load('', dualChannelPeaks, videoDuration);
        }
      }
    }
    
    if (state === 1) {
      setIsPlaying(true);
      console.log('▶️ YouTube playing');
    } else if (state === 2) {
      setIsPlaying(false);
      console.log('⏸️ YouTube paused');
    } else if (state === 0) {
      setIsPlaying(false);
      console.log('⏹️ YouTube ended');
    } else if (state === -1) {
      setIsPlaying(false);
      console.log('⏹️ YouTube unstarted');
    } else if (state === 3) {
      console.log('⏳ YouTube buffering');
    }
  };

  // Update lyrics based on current time with auto-scroll and timing offset
  useEffect(() => {
    // Add 0.3 second offset to sync lyrics better with audio
    const adjustedTime = currentTime + 0.3;
    
    const index = lyrics.findIndex((lyric, i) => {
      const nextLyric = lyrics[i + 1];
      return adjustedTime >= lyric.time && (!nextLyric || adjustedTime < nextLyric.time);
    });
    if (index !== -1 && index !== currentLyricIndex) {
      setCurrentLyricIndex(index);
      
      // Auto-scroll to current lyric
      const lyricElement = document.getElementById(`lyric-${index}`);
      if (lyricElement && lyricsContainerRef.current) {
        const container = lyricsContainerRef.current;
        const elementTop = lyricElement.offsetTop;
        const elementHeight = lyricElement.offsetHeight;
        const containerHeight = container.clientHeight;
        
        // Scroll to center the current lyric
        const scrollPosition = elementTop - (containerHeight / 2) + (elementHeight / 2);
        container.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [currentTime, lyrics, currentLyricIndex]);

  // Handle play/pause
  const togglePlayPause = async () => {
    if (!youtubePlayerRef.current) {
      console.error('YouTube player not initialized');
      return;
    }

    try {
      // Wait a bit for player to be fully ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check if player methods are available
      if (typeof youtubePlayerRef.current.getPlayerState !== 'function') {
        console.error('YouTube player methods not available');
        return;
      }

      const state = youtubePlayerRef.current.getPlayerState();
      console.log('Current player state:', state);
      
      if (state === 1) {
        // Currently playing, pause it
        console.log('Pausing video...');
        youtubePlayerRef.current.pauseVideo();
      } else {
        // Not playing - play it
        console.log('Playing video...');
        youtubePlayerRef.current.playVideo();
        
        // If still unstarted after play attempt, try loading explicitly
        setTimeout(() => {
          if (youtubePlayerRef.current && youtubePlayerRef.current.getPlayerState() === -1) {
            console.log('Video still unstarted, loading explicitly...');
            youtubePlayerRef.current.loadVideoById(trackInfo.youtubeVideoId);
          }
        }, 500);
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    setVolume(value);
    if (youtubePlayerRef.current && typeof youtubePlayerRef.current.setVolume === 'function') {
      try {
        youtubePlayerRef.current.setVolume(value[0]);
      } catch (error) {
        console.error('Error setting volume:', error);
      }
    }
  };

  // Handle recording
  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        recorderRef.current = new RecordRTC(stream, {
          type: 'audio',
          mimeType: 'audio/webm',
          recorderType: RecordRTC.StereoAudioRecorder,
        });
        recorderRef.current.startRecording();
        setIsRecording(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Could not access microphone. Please grant permission.');
      }
    } else {
      if (recorderRef.current) {
        recorderRef.current.stopRecording(() => {
          recordedBlobRef.current = recorderRef.current?.getBlob() || null;
          setHasRecording(true);
          setIsRecording(false);
          
          // Stop all tracks
          recorderRef.current?.getInternalRecorder()?.stream?.getTracks().forEach((track: MediaStreamTrack) => {
            track.stop();
          });
        });
      }
    }
  };

  // Skip forward/backward
  const skip = (seconds: number) => {
    if (youtubePlayerRef.current && duration > 0) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      youtubePlayerRef.current.seekTo(newTime, true);
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Upload recording to IRYS
  const handleUploadToIrys = async () => {
    if (!recordedBlobRef.current) {
      alert('No recording available to upload');
      return;
    }

    try {
      setIsUploading(true);

      const metadata: PerformanceMetadata = {
        trackName: trackInfo.name,
        artistName: trackInfo.artist,
        duration: duration,
        recordedAt: new Date().toISOString(),
        appVersion: '1.0.0',
      };

      const result = await uploadRecordingToIrys(recordedBlobRef.current, metadata);
      
      setUploadResult(result);
      console.log('✅ Recording uploaded to IRYS:', result);

      // Save to localStorage for profile page
      const recording = {
        id: result.id,
        trackName: trackInfo.name,
        artistName: trackInfo.artist,
        duration: duration,
        recordedAt: metadata.recordedAt,
        irysUrl: result.url,
        timestamp: result.timestamp,
      };

      const stored = localStorage.getItem('irys_recordings');
      const recordings = stored ? JSON.parse(stored) : [];
      recordings.push(recording);
      localStorage.setItem('irys_recordings', JSON.stringify(recordings));
      console.log('💾 Recording saved to localStorage');
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.message || 'Failed to upload recording');
    } finally {
      setIsUploading(false);
    }
  };

  // Copy link to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Share on social media
  const shareOnSocial = (platform: 'twitter' | 'facebook') => {
    if (!uploadResult) return;

    const text = `Check out my karaoke performance of "${trackInfo.name}" by ${trackInfo.artist}!`;
    const url = uploadResult.url;

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    };

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  // Handle LRC file upload
  const handleLyricsUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !trackId) return;

    try {
      const parsed = await parseUserLRCFile(file);
      const lrcContent = await file.text();
      
      saveUserLyrics(trackId, trackInfo.name, trackInfo.artist, lrcContent);
      setLyrics(parsed);
      setLyricsSource('User Upload');
      setShowLyricsUpload(false);
      
      alert('Lyrics uploaded successfully!');
    } catch (error) {
      console.error('Error uploading lyrics:', error);
      alert('Failed to upload lyrics. Please ensure the file is in LRC format.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#2C0E4A] via-[#121212] to-[#1a0a2e]">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-black text-white mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Karaoke Studio
            </h1>
            <p className="text-xl text-white/70">
              Choose a song and let your voice shine
            </p>
          </div>

          {/* Loading Indicator */}
          {isLoadingTrack && (
            <Card className="bg-[#121212]/80 border-primary/20 backdrop-blur-sm p-8 mb-8">
              <div className="flex flex-col items-center justify-center py-12">
                <div className="relative w-20 h-20 mb-6">
                  <div className="absolute inset-0 border-4 border-primary/30 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Loading Track...</h3>
                <p className="text-white/60 text-center">
                  Searching for karaoke version and fetching lyrics
                </p>
              </div>
            </Card>
          )}

          {/* Main Content - Side by Side Layout */}
          {!isLoadingTrack && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Player Card */}
            <Card className="bg-[#121212]/80 border-primary/20 backdrop-blur-sm p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {trackInfo.name} - {trackInfo.artist}
              </h2>
              <p className="text-white/60">Album: {trackInfo.album} • Duration: {formatTime(duration)}</p>
            </div>

            {/* Hidden YouTube Player */}
            <div ref={youtubeContainerRef} className="hidden" />

            {/* Waveform Visualization with Rhythm Animations */}
            <div className="bg-black/40 rounded-lg mb-6 border border-white/10 overflow-hidden p-4 relative">
              {/* Animated background bars that pulse with rhythm */}
              {isPlaying && (
                <div className="absolute inset-0 flex items-end justify-around gap-1 px-4 pb-4 pointer-events-none">
                  {[...Array(32)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-gradient-to-t from-primary/30 to-accent/30 rounded-t-full"
                      style={{
                        width: '4px',
                        height: '100%',
                        animation: `rhythmPulse ${0.4 + (i % 8) * 0.1}s ease-in-out infinite`,
                        animationDelay: `${i * 0.05}s`,
                        transform: 'scaleY(0.3)',
                      }}
                    />
                  ))}
                </div>
              )}
              
              {/* Waveform */}
              <div ref={waveformRef} className="min-h-[128px] relative z-10" />
              
              {/* Floating particles */}
              {isPlaying && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-primary/40 rounded-full"
                      style={{
                        left: `${(i * 8.33)}%`,
                        animation: `floatParticle ${2 + (i % 3)}s ease-in-out infinite`,
                        animationDelay: `${i * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Audio Source Indicator */}
            {trackInfo.youtubeVideoId && (
              <div className="text-center mb-4">
                <p className="text-xs text-green-400 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Playing full track via YouTube
                </p>
              </div>
            )}

            {/* Time Display */}
            <div className="flex justify-between text-sm text-white/60 mb-4">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            {/* Main Controls */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <Button
                size="lg"
                onClick={() => skip(-10)}
                className="bg-white/10 hover:bg-white/20 rounded-full w-14 h-14"
              >
                <SkipBack className="w-5 h-5" />
              </Button>

              <Button
                size="lg"
                onClick={togglePlayPause}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 rounded-full w-16 h-16"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </Button>

              <Button
                size="lg"
                onClick={() => skip(10)}
                className="bg-white/10 hover:bg-white/20 rounded-full w-14 h-14"
              >
                <SkipForward className="w-5 h-5" />
              </Button>

              <Button
                size="lg"
                onClick={toggleRecording}
                className={`${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                    : hasRecording
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-white/10 hover:bg-white/20'
                } rounded-full w-16 h-16 ml-4`}
              >
                {isRecording ? (
                  <Square className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </Button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-4 mb-6 max-w-xs mx-auto">
              <Volume2 className="w-5 h-5 text-white/60" />
              <Slider
                value={volume}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-white/60 text-sm w-12">{volume[0]}%</span>
            </div>

            {/* Recording Status */}
            {isRecording && (
              <div className="text-center mb-4">
                <p className="text-red-400 font-semibold flex items-center justify-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  Recording in progress...
                </p>
              </div>
            )}

            {hasRecording && !isRecording && (
              <div className="text-center mb-4">
                <p className="text-green-400 font-semibold flex items-center justify-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full" />
                  Recording saved! Ready to upload.
                </p>
              </div>
            )}

            {/* Upload to IRYS */}
            {hasRecording && !uploadResult && (
              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleUploadToIrys}
                  disabled={isUploading}
                  className="bg-gradient-to-r from-accent to-primary hover:opacity-90 text-white px-8 disabled:opacity-50"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  {isUploading ? 'Uploading to IRYS...' : 'Save to IRYS (Permanent)'}
                </Button>
              </div>
            )}

            {/* Upload Success & Share */}
            {uploadResult && (
              <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <p className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    Recording saved permanently on IRYS!
                  </p>
                  <p className="text-sm text-white/60 mb-3">
                    Transaction ID: {uploadResult.id.slice(0, 20)}...
                  </p>
                  
                  {/* Share Options */}
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={uploadResult.url}
                        readOnly
                        className="flex-1 bg-black/30 border border-white/10 rounded px-3 py-2 text-sm text-white/80"
                      />
                      <Button
                        size="sm"
                        onClick={() => copyToClipboard(uploadResult.url)}
                        className="bg-primary hover:bg-primary/80"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>

                    <div className="flex gap-2 justify-center">
                      <Button
                        size="sm"
                        onClick={() => shareOnSocial('twitter')}
                        className="bg-[#1DA1F2] hover:bg-[#1DA1F2]/80 text-white"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share on Twitter
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => shareOnSocial('facebook')}
                        className="bg-[#4267B2] hover:bg-[#4267B2]/80 text-white"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share on Facebook
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            </Card>

            {/* Lyrics Display */}
            <Card className="bg-[#121212]/80 border-primary/20 backdrop-blur-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Mic className="w-5 h-5 text-primary" />
                Lyrics <span className="text-sm text-white/60 font-normal ml-2">(Source: {lyricsSource})</span>
              </h3>
              {showLyricsUpload && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".lrc"
                    onChange={handleLyricsUpload}
                    className="hidden"
                  />
                  <Button
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Upload .LRC File
                  </Button>
                </div>
              )}
            </div>
            <div ref={lyricsContainerRef} className="space-y-3 max-h-96 overflow-y-auto scroll-smooth">
              {lyrics.length === 0 ? (
                <p className="text-white/60 text-center py-8">
                  {trackId ? 'No lyrics found for this track. Upload an .LRC file to add lyrics.' : 'Select a track to view lyrics'}
                </p>
              ) : (
                lyrics.map((lyric, index) => (
                  <p
                    key={index}
                    id={`lyric-${index}`}
                    className={`text-lg leading-relaxed transition-all duration-300 text-center ${
                      lyric.type === 'section'
                        ? 'text-primary font-bold text-xl mt-6'
                        : index === currentLyricIndex
                        ? 'text-white font-semibold text-2xl scale-105 transform'
                        : index < currentLyricIndex
                        ? 'text-white/40'
                        : 'text-white/60'
                    }`}
                  >
                    {lyric.text}
                  </p>
                ))
              )}
            </div>
            </Card>
          </div>
          )}
        </div>
      </main>
    </div>
  );
}
