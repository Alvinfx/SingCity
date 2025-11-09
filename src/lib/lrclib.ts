// LRCLIB API client for fetching synchronized lyrics
// Documentation: https://lrclib.net/docs

export interface LyricsResponse {
  id: number;
  trackName: string;
  artistName: string;
  albumName: string;
  duration: number;
  instrumental: boolean;
  plainLyrics: string | null;
  syncedLyrics: string | null;
}

export interface ParsedLyric {
  time: number;
  text: string;
  type: 'line' | 'section';
}

const LRCLIB_API_BASE = 'https://lrclib.net/api';

/**
 * Fetch lyrics from LRCLIB API
 */
export async function fetchLyrics(
  trackName: string,
  artistName: string,
  albumName: string,
  duration: number
): Promise<LyricsResponse | null> {
  try {
    // Try with full metadata first
    let params = new URLSearchParams({
      track_name: trackName,
      artist_name: artistName,
      album_name: albumName,
      duration: Math.round(duration).toString(),
    });

    let response = await fetch(`${LRCLIB_API_BASE}/get?${params}`);

    // If not found, try without album name
    if (!response.ok && response.status === 404) {
      params = new URLSearchParams({
        track_name: trackName,
        artist_name: artistName,
      });
      response = await fetch(`${LRCLIB_API_BASE}/get?${params}`);
    }

    // If still not found, try search endpoint
    if (!response.ok && response.status === 404) {
      const searchResults = await searchLyrics(`${trackName} ${artistName}`);
      if (searchResults.length > 0) {
        return searchResults[0];
      }
      console.log('Lyrics not found for this track');
      return null;
    }

    if (!response.ok) {
      throw new Error(`LRCLIB API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    return null;
  }
}

/**
 * Search for lyrics by track name
 */
export async function searchLyrics(query: string): Promise<LyricsResponse[]> {
  try {
    const params = new URLSearchParams({ q: query });

    const response = await fetch(`${LRCLIB_API_BASE}/search?${params}`, {
      headers: {
        'User-Agent': 'SingCity v1.0.0 (https://singcity.app)',
      },
    });

    if (!response.ok) {
      throw new Error(`LRCLIB API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching lyrics:', error);
    return [];
  }
}

/**
 * Parse LRC format lyrics into timestamped array
 * LRC format: [mm:ss.xx] Lyric text
 */
export function parseLRC(lrcContent: string | null): ParsedLyric[] {
  if (!lrcContent) return [];

  const lines = lrcContent.split('\n');
  const parsed: ParsedLyric[] = [];

  // LRC timestamp regex: [mm:ss.xx] or [mm:ss]
  const timeRegex = /\[(\d{2}):(\d{2})\.?(\d{2})?\]/g;

  for (const line of lines) {
    const matches = [...line.matchAll(timeRegex)];
    
    if (matches.length === 0) continue;

    // Get the text after the timestamp
    const text = line.replace(timeRegex, '').trim();
    if (!text) continue;

    // Parse each timestamp (a line can have multiple timestamps)
    for (const match of matches) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const centiseconds = match[3] ? parseInt(match[3], 10) : 0;
      
      const timeInSeconds = minutes * 60 + seconds + centiseconds / 100;

      // Detect section markers like [Intro], [Verse], [Chorus]
      const isSectionMarker = /^\[.*\]$/.test(text);

      parsed.push({
        time: timeInSeconds,
        text,
        type: isSectionMarker ? 'section' : 'line',
      });
    }
  }

  // Sort by time
  return parsed.sort((a, b) => a.time - b.time);
}

/**
 * Get demo lyrics for testing (when real lyrics aren't available)
 */
export function getDemoLyrics(): ParsedLyric[] {
  return [
    { time: 0, text: "[Intro]", type: "section" },
    { time: 5, text: "Welcome to the stage", type: "line" },
    { time: 8, text: "Where dreams come alive", type: "line" },
    { time: 12, text: "[Verse 1]", type: "section" },
    { time: 15, text: "Sing your heart out loud", type: "line" },
    { time: 18, text: "Let the music take control", type: "line" },
    { time: 22, text: "Feel the rhythm in your soul", type: "line" },
    { time: 26, text: "[Chorus]", type: "section" },
    { time: 30, text: "This is your moment to shine", type: "line" },
    { time: 34, text: "Let your voice be heard", type: "line" },
    { time: 38, text: "Sing like nobody's watching", type: "line" },
  ];
}
