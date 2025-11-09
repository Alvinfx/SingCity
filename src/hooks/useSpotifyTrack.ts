import { useState, useEffect } from 'react';
import { spotifyRequest } from '@/lib/supabase';

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  duration_ms: number;
  preview_url: string | null;
}

/**
 * Hook to fetch and manage Spotify track data
 */
export function useSpotifyTrack(trackId?: string) {
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!trackId) return;

    async function fetchTrack() {
      setLoading(true);
      setError(null);

      try {
        const data = await spotifyRequest(`/tracks/${trackId}`);
        setTrack(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch track');
        console.error('Error fetching Spotify track:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTrack();
  }, [trackId]);

  return { track, loading, error };
}
