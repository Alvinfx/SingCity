// Multi-source lyrics API integration
// Priority: Musixmatch -> Genius -> Spotify -> LRCLIB -> User Upload

import { parseLRC, type ParsedLyric } from './lrclib';

export interface LyricsSource {
  source: 'musixmatch' | 'genius' | 'spotify' | 'lrclib' | 'user';
  syncedLyrics: string | null;
  plainLyrics: string | null;
}

// Musixmatch API configuration
const MUSIXMATCH_API_KEY = import.meta.env.VITE_MUSIXMATCH_API_KEY || '';
const MUSIXMATCH_BASE = 'https://api.musixmatch.com/ws/1.1';

// Genius API configuration
const GENIUS_API_KEY = import.meta.env.VITE_GENIUS_API_KEY || '';
const GENIUS_BASE = 'https://api.genius.com';

// LRCLIB API (no auth required)
const LRCLIB_BASE = 'https://lrclib.net/api';

/**
 * Fetch lyrics from Musixmatch API
 */
async function fetchMusixmatchLyrics(
  trackName: string,
  artistName: string,
  duration: number
): Promise<LyricsSource | null> {
  if (!MUSIXMATCH_API_KEY) {
    console.log('Musixmatch API key not configured');
    return null;
  }

  try {
    // Search for track
    const searchParams = new URLSearchParams({
      apikey: MUSIXMATCH_API_KEY,
      q_track: trackName,
      q_artist: artistName,
      f_has_lyrics: '1',
      page_size: '1',
    });

    const searchResponse = await fetch(`${MUSIXMATCH_BASE}/track.search?${searchParams}`);
    const searchData = await searchResponse.json();

    if (searchData.message.header.status_code !== 200 || !searchData.message.body.track_list.length) {
      return null;
    }

    const trackId = searchData.message.body.track_list[0].track.track_id;

    // Get lyrics
    const lyricsParams = new URLSearchParams({
      apikey: MUSIXMATCH_API_KEY,
      track_id: trackId.toString(),
    });

    const lyricsResponse = await fetch(`${MUSIXMATCH_BASE}/track.lyrics.get?${lyricsParams}`);
    const lyricsData = await lyricsResponse.json();

    if (lyricsData.message.header.status_code !== 200) {
      return null;
    }

    const plainLyrics = lyricsData.message.body.lyrics?.lyrics_body || null;

    // Try to get synced lyrics (if available in paid tier)
    let syncedLyrics = null;
    try {
      const syncedParams = new URLSearchParams({
        apikey: MUSIXMATCH_API_KEY,
        track_id: trackId.toString(),
      });
      const syncedResponse = await fetch(`${MUSIXMATCH_BASE}/track.subtitle.get?${syncedParams}`);
      const syncedData = await syncedResponse.json();
      
      if (syncedData.message.header.status_code === 200 && syncedData.message.body.subtitle) {
        syncedLyrics = syncedData.message.body.subtitle.subtitle_body;
      }
    } catch (e) {
      console.log('Synced lyrics not available from Musixmatch');
    }

    return {
      source: 'musixmatch',
      syncedLyrics,
      plainLyrics,
    };
  } catch (error) {
    console.error('Musixmatch API error:', error);
    return null;
  }
}

/**
 * Fetch lyrics from Genius API
 */
async function fetchGeniusLyrics(
  trackName: string,
  artistName: string
): Promise<LyricsSource | null> {
  if (!GENIUS_API_KEY) {
    console.log('Genius API key not configured');
    return null;
  }

  try {
    // Search for song
    const searchParams = new URLSearchParams({
      q: `${trackName} ${artistName}`,
    });

    const searchResponse = await fetch(`${GENIUS_BASE}/search?${searchParams}`, {
      headers: {
        Authorization: `Bearer ${GENIUS_API_KEY}`,
      },
    });

    const searchData = await searchResponse.json();

    if (!searchData.response.hits.length) {
      return null;
    }

    const songUrl = searchData.response.hits[0].result.url;

    // Note: Genius API doesn't provide lyrics directly
    // We would need to scrape the page, which violates their ToS
    // For now, we'll just return the URL and let users know
    console.log('Genius lyrics available at:', songUrl);
    
    return {
      source: 'genius',
      syncedLyrics: null,
      plainLyrics: `Lyrics available at: ${songUrl}`,
    };
  } catch (error) {
    console.error('Genius API error:', error);
    return null;
  }
}

/**
 * Fetch lyrics from Spotify via third-party proxy (Lyricstify)
 */
async function fetchSpotifyLyrics(trackId: string): Promise<LyricsSource | null> {
  try {
    const response = await fetch(`https://lyricstify-api.vercel.app/api/lyrics/${trackId}`);
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data.lyrics) {
      return null;
    }

    // Convert Spotify lyrics format to LRC if synced
    let syncedLyrics = null;
    if (data.lyrics.syncType === 'LINE_SYNCED' && data.lyrics.lines) {
      syncedLyrics = data.lyrics.lines
        .map((line: any) => {
          const time = parseInt(line.startTimeMs) / 1000;
          const minutes = Math.floor(time / 60);
          const seconds = Math.floor(time % 60);
          const centiseconds = Math.floor((time % 1) * 100);
          return `[${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}]${line.words}`;
        })
        .join('\n');
    }

    const plainLyrics = data.lyrics.lines?.map((line: any) => line.words).join('\n') || null;

    return {
      source: 'spotify',
      syncedLyrics,
      plainLyrics,
    };
  } catch (error) {
    console.error('Spotify lyrics API error:', error);
    return null;
  }
}

/**
 * Fetch lyrics from LRCLIB (fallback)
 */
async function fetchLRCLIBLyrics(
  trackName: string,
  artistName: string,
  albumName: string,
  duration: number
): Promise<LyricsSource | null> {
  try {
    // Try with full metadata first
    let params = new URLSearchParams({
      track_name: trackName,
      artist_name: artistName,
      album_name: albumName,
      duration: Math.round(duration).toString(),
    });

    let response = await fetch(`${LRCLIB_BASE}/get?${params}`, {
      headers: {
        'User-Agent': 'SingCity v1.0.0 (https://singcity.app)',
      },
    });

    // If not found, try without album name
    if (!response.ok && response.status === 404) {
      console.log('Retrying LRCLIB without album...');
      params = new URLSearchParams({
        track_name: trackName,
        artist_name: artistName,
        duration: Math.round(duration).toString(),
      });
      response = await fetch(`${LRCLIB_BASE}/get?${params}`, {
        headers: {
          'User-Agent': 'SingCity v1.0.0 (https://singcity.app)',
        },
      });
    }

    // If still not found, try search endpoint
    if (!response.ok && response.status === 404) {
      console.log('Trying LRCLIB search...');
      const searchParams = new URLSearchParams({ q: `${trackName} ${artistName}` });
      const searchResponse = await fetch(`${LRCLIB_BASE}/search?${searchParams}`, {
        headers: {
          'User-Agent': 'SingCity v1.0.0 (https://singcity.app)',
        },
      });
      
      if (searchResponse.ok) {
        const searchResults = await searchResponse.json();
        if (searchResults.length > 0) {
          const data = searchResults[0];
          return {
            source: 'lrclib',
            syncedLyrics: data.syncedLyrics,
            plainLyrics: data.plainLyrics,
          };
        }
      }
      return null;
    }

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return {
      source: 'lrclib',
      syncedLyrics: data.syncedLyrics,
      plainLyrics: data.plainLyrics,
    };
  } catch (error) {
    console.error('LRCLIB API error:', error);
    return null;
  }
}

/**
 * Main function to fetch lyrics from multiple sources with fallback
 */
export async function fetchLyricsMultiSource(
  trackName: string,
  artistName: string,
  albumName: string,
  duration: number,
  spotifyTrackId?: string | null
): Promise<{ lyrics: ParsedLyric[]; source: string } | null> {
  console.log('🎵 Fetching lyrics for:', trackName, '-', artistName);
  
  // Try LRCLIB first (no CORS issues, most reliable)
  let result = await fetchLRCLIBLyrics(trackName, artistName, albumName, duration);
  if (result?.syncedLyrics) {
    console.log('✅ Lyrics found from LRCLIB');
    return {
      lyrics: parseLRC(result.syncedLyrics),
      source: 'LRCLIB',
    };
  }

  // Try Musixmatch (CORS issues expected)
  result = await fetchMusixmatchLyrics(trackName, artistName, duration);
  if (result?.syncedLyrics) {
    console.log('✅ Lyrics found from Musixmatch');
    return {
      lyrics: parseLRC(result.syncedLyrics),
      source: 'Musixmatch',
    };
  }

  // Try Spotify if track ID is available (CORS issues expected)
  if (spotifyTrackId) {
    result = await fetchSpotifyLyrics(spotifyTrackId);
    if (result?.syncedLyrics) {
      console.log('✅ Lyrics found from Spotify');
      return {
        lyrics: parseLRC(result.syncedLyrics),
        source: 'Spotify',
      };
    }
  }

  // Try Genius (CORS issues expected)
  result = await fetchGeniusLyrics(trackName, artistName);
  if (result?.plainLyrics && !result.plainLyrics.startsWith('Lyrics available at:')) {
    console.log('✅ Lyrics found from Genius');
    // Convert plain lyrics to simple timed format
    const lines = result.plainLyrics.split('\n').filter(l => l.trim());
    const lyrics: ParsedLyric[] = lines.map((line, i) => ({
      time: i * 3, // 3 seconds per line as fallback
      text: line,
      type: 'line' as const,
    }));
    return { lyrics, source: 'Genius' };
  }

  console.warn('⚠️ No lyrics found from any source');
  return null;
}

/**
 * Parse user-uploaded LRC file
 */
export async function parseUserLRCFile(file: File): Promise<ParsedLyric[]> {
  const text = await file.text();
  return parseLRC(text);
}

/**
 * Save user-contributed lyrics to local storage
 */
export function saveUserLyrics(
  trackId: string,
  trackName: string,
  artistName: string,
  lrcContent: string
): void {
  const key = `user_lyrics_${trackId}`;
  const data = {
    trackId,
    trackName,
    artistName,
    lrcContent,
    uploadedAt: new Date().toISOString(),
  };
  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Get user-contributed lyrics from local storage
 */
export function getUserLyrics(trackId: string | null): ParsedLyric[] | null {
  if (!trackId) return null;
  const key = `user_lyrics_${trackId}`;
  const stored = localStorage.getItem(key);
  
  if (!stored) return null;
  
  try {
    const data = JSON.parse(stored);
    return parseLRC(data.lrcContent);
  } catch {
    return null;
  }
}
