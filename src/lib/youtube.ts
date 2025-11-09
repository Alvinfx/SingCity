// YouTube API integration for karaoke audio playback
// Uses YouTube Data API v3 for search and YouTube IFrame API for playback

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || '';

export interface YouTubeVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  duration: string;
}

/**
 * Search YouTube for a music video matching the track info
 * @param trackName - Name of the track
 * @param artistName - Name of the artist
 * @returns YouTube video ID or null if not found
 */
export async function searchYouTubeMusic(
  trackName: string,
  artistName: string
): Promise<YouTubeVideo | null> {
  if (!YOUTUBE_API_KEY) {
    console.warn('YouTube API key not configured');
    return null;
  }
  
  if (!trackName || trackName.trim() === '') {
    console.warn('Track name is required for YouTube search');
    return null;
  }

  try {
    // Normalize track and artist names for better matching
    const normalizeText = (text: string) => 
      text.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .trim();
    
    const normalizedTrack = normalizeText(trackName);
    const normalizedArtist = normalizeText(artistName);

    // Helper to check if video title matches the track
    const isMatchingVideo = (videoTitle: string, channelTitle: string): { match: boolean; score: number } => {
      const normalizedTitle = normalizeText(videoTitle);
      const normalizedChannel = normalizeText(channelTitle);
      
      // Must contain significant portion of track name
      const trackWords = normalizedTrack.split(/\s+/).filter(w => w.length > 2);
      const matchedWords = trackWords.filter(word => normalizedTitle.includes(word));
      const trackMatch = matchedWords.length >= Math.max(1, trackWords.length * 0.5);
      
      if (!trackMatch) return { match: false, score: 0 };
      
      // Calculate quality score
      let score = 0;
      
      // Strong karaoke indicators (highest priority)
      if (/karaoke/i.test(videoTitle)) score += 100;
      if (/instrumental/i.test(videoTitle)) score += 90;
      if (/backing track/i.test(videoTitle)) score += 85;
      if (/sing along/i.test(videoTitle)) score += 80;
      if (/no vocals/i.test(videoTitle)) score += 75;
      if (/lyrics/i.test(videoTitle)) score += 60;
      if (/cover/i.test(videoTitle)) score += 40;
      
      // Penalize original artist versions
      if (normalizedTitle.includes('official') || normalizedTitle.includes('music video')) score -= 50;
      if (normalizedTitle.includes('live') || normalizedTitle.includes('concert')) score -= 40;
      if (normalizedChannel.includes(normalizedArtist)) score -= 30;
      
      // Bonus for reputable karaoke channels
      if (/karaoke|sing|backing|instrumental/i.test(channelTitle)) score += 30;
      
      // Bonus for exact track name match
      if (normalizedTitle.includes(normalizedTrack)) score += 20;
      
      return { match: score > 50, score };
    };

    // Try multiple search strategies for karaoke/instrumental versions
    const searchQueries = artistName && artistName.trim() !== '' ? [
      `"${trackName}" "${artistName}" karaoke`,
      `${trackName} ${artistName} karaoke lyrics`,
      `"${trackName}" karaoke instrumental`,
      `${trackName} ${artistName} instrumental`,
      `${trackName} karaoke backing track`,
      `"${trackName}" sing along`,
      `${trackName} ${artistName} karaoke`,
      `${trackName} no vocals`,
    ] : [
      `"${trackName}" karaoke`,
      `${trackName} karaoke lyrics`,
      `"${trackName}" karaoke instrumental`,
      `${trackName} instrumental`,
      `${trackName} karaoke backing track`,
      `"${trackName}" sing along`,
      `${trackName} no vocals`,
    ];

    for (const searchQuery of searchQueries) {
      console.log('🔍 Trying search:', searchQuery);
      const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
      searchUrl.searchParams.set('part', 'snippet');
      searchUrl.searchParams.set('maxResults', '10'); // Get more results to filter
      searchUrl.searchParams.set('q', searchQuery);
      searchUrl.searchParams.set('type', 'video');
      searchUrl.searchParams.set('videoCategoryId', '10'); // Music category
      searchUrl.searchParams.set('key', YOUTUBE_API_KEY);

      const response = await fetch(searchUrl.toString());
      
      if (!response.ok) {
        console.warn(`YouTube API error: ${response.status}`);
        continue;
      }

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        console.warn('No YouTube results found for:', searchQuery);
        continue;
      }

      // Collect and score all matching videos
      const candidates: Array<{ video: any; score: number }> = [];
      
      for (const item of data.items) {
        const videoId = item.id.videoId;
        const videoTitle = item.snippet.title;
        const channelTitle = item.snippet.channelTitle;
        
        // Check if this video matches our criteria
        const matchResult = isMatchingVideo(videoTitle, channelTitle);
        if (!matchResult.match) {
          console.log('⏭️ Skipping non-matching video:', videoTitle, '(score:', matchResult.score, ')');
          continue;
        }

        // Get video details including duration
        const videoDetailsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
        videoDetailsUrl.searchParams.set('part', 'contentDetails,snippet');
        videoDetailsUrl.searchParams.set('id', videoId);
        videoDetailsUrl.searchParams.set('key', YOUTUBE_API_KEY);

        const detailsResponse = await fetch(videoDetailsUrl.toString());
        const detailsData = await detailsResponse.json();

        if (!detailsData.items || detailsData.items.length === 0) {
          continue;
        }

        const videoDetails = detailsData.items[0];
        console.log('✅ Found candidate:', videoDetails.snippet.title, '(score:', matchResult.score, ')');
        
        candidates.push({
          video: {
            videoId,
            title: videoDetails.snippet.title,
            channelTitle: videoDetails.snippet.channelTitle,
            thumbnail: videoDetails.snippet.thumbnails.high.url,
            duration: videoDetails.contentDetails.duration,
          },
          score: matchResult.score
        });
      }
      
      // Return the highest scoring candidate from this search query
      if (candidates.length > 0) {
        candidates.sort((a, b) => b.score - a.score);
        const best = candidates[0];
        console.log('🏆 Best match for query:', searchQuery, '-', best.video.title, '(score:', best.score, ')');
        return best.video;
      }
    }

    // No karaoke/instrumental found
    console.warn('⚠️ No karaoke or instrumental version found');
    return null;
  } catch (error) {
    console.error('Error searching YouTube:', error);
    return null;
  }
}

/**
 * Parse ISO 8601 duration format (PT1M30S) to seconds
 */
export function parseYouTubeDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Load YouTube IFrame API script
 */
export function loadYouTubeIFrameAPI(): Promise<void> {
  return new Promise((resolve) => {
    // Check if already loaded
    if (window.YT && window.YT.Player) {
      resolve();
      return;
    }

    // Check if script is already being loaded
    if ((window as any).onYouTubeIframeAPIReady) {
      // Wait for existing load
      const checkInterval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      return;
    }

    // Load the script
    (window as any).onYouTubeIframeAPIReady = () => {
      resolve();
    };

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
  });
}

// Extend Window interface for YouTube API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}
