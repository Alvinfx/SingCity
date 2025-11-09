import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Play, Heart, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { spotifyRequest } from '@/lib/supabase';

interface SpotifyTrack {
  id: string
  name: string
  artists: { name: string }[]
  album: {
    images: { url: string }[]
  }
  duration_ms: number
  preview_url: string | null
}

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<SpotifyTrack[]>([]);

  const genres = ['All', 'Pop', 'Rock', 'Soul', 'R&B', 'Hip Hop'];

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse recent searches:', e);
      }
    }
  }, []);

  // Save track to recent searches
  const addToRecentSearches = (track: SpotifyTrack) => {
    setRecentSearches(prev => {
      // Remove duplicates and add to front
      const filtered = prev.filter(t => t.id !== track.id);
      const updated = [track, ...filtered].slice(0, 10); // Keep max 10 recent
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    const fetchTracks = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('🎵 Fetching tracks from Spotify API...');
        const query = searchQuery || 'karaoke popular';
        const genreQuery = selectedGenre !== 'All' ? ` genre:${selectedGenre.toLowerCase()}` : '';
        const data = await spotifyRequest(`/search?q=${encodeURIComponent(query + genreQuery)}&type=track&limit=20`);
        console.log('✅ Spotify API response:', data);
        setTracks(data.tracks?.items || []);
      } catch (err) {
        console.error('❌ Failed to fetch tracks:', err);
        // Fallback to mock data if Spotify proxy fails
        setTracks(getMockTracks(selectedGenre));
        setError('Using demo songs. Spotify integration pending.');
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchTracks, 500);
    return () => clearTimeout(debounce);
  }, [searchQuery, selectedGenre]);

  const getMockTracks = (genre: string): SpotifyTrack[] => {
    const mockData: Record<string, SpotifyTrack[]> = {
      'All': [
        { id: '1', name: 'Bohemian Rhapsody', artists: [{ name: 'Queen' }], album: { images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273e319baafd16e84f0408af2a0' }] }, duration_ms: 354000, preview_url: null },
        { id: '2', name: 'Don\'t Stop Believin\'', artists: [{ name: 'Journey' }], album: { images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273c5653f9038e42efba85eed97' }] }, duration_ms: 250000, preview_url: null },
        { id: '3', name: 'Sweet Caroline', artists: [{ name: 'Neil Diamond' }], album: { images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273b3d92d7a0c5e6f8b5f8c8f8c' }] }, duration_ms: 203000, preview_url: null },
      ],
      'Pop': [
        { id: '4', name: 'Shake It Off', artists: [{ name: 'Taylor Swift' }], album: { images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273e787cffec20aa2a396a61647' }] }, duration_ms: 219000, preview_url: null },
        { id: '5', name: 'Uptown Funk', artists: [{ name: 'Mark Ronson' }], album: { images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273e419ccba0baa8bd3f3d7abf2' }] }, duration_ms: 269000, preview_url: null },
      ],
      'Rock': [
        { id: '6', name: 'Livin\' on a Prayer', artists: [{ name: 'Bon Jovi' }], album: { images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273c5653f9038e42efba85eed97' }] }, duration_ms: 249000, preview_url: null },
        { id: '7', name: 'We Will Rock You', artists: [{ name: 'Queen' }], album: { images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273e319baafd16e84f0408af2a0' }] }, duration_ms: 122000, preview_url: null },
      ],
      'Soul': [
        { id: '8', name: 'Respect', artists: [{ name: 'Aretha Franklin' }], album: { images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273b3d92d7a0c5e6f8b5f8c8f8c' }] }, duration_ms: 147000, preview_url: null },
      ],
      'R&B': [
        { id: '9', name: 'No Scrubs', artists: [{ name: 'TLC' }], album: { images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273b3d92d7a0c5e6f8b5f8c8f8c' }] }, duration_ms: 215000, preview_url: null },
      ],
      'Hip Hop': [
        { id: '10', name: 'Lose Yourself', artists: [{ name: 'Eminem' }], album: { images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273b3d92d7a0c5e6f8b5f8c8f8c' }] }, duration_ms: 326000, preview_url: null },
      ],
    };
    return mockData[genre] || mockData['All'];
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#2C0E4A] via-[#121212] to-[#1a0a2e]">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-black text-white mb-4">
              Song Library
            </h1>
            <p className="text-xl text-white/70">
              Discover thousands of songs to perform
            </p>
          </div>

          {/* Recently Searched Songs */}
          {recentSearches.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6">Recently Searched</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                {recentSearches.map((track) => (
                  <Card
                    key={track.id}
                    className="bg-[#121212]/80 border-primary/20 backdrop-blur-sm hover:border-primary/40 transition-all group cursor-pointer"
                  >
                    <Link to={`/karaoke?track=${track.id}`} onClick={() => addToRecentSearches(track)}>
                      <div className="p-4">
                        {track.album.images[0] && (
                          <img
                            src={track.album.images[0].url}
                            alt={track.name}
                            className="w-full aspect-square rounded-lg object-cover mb-3"
                          />
                        )}
                        <h3 className="text-sm font-bold text-white mb-1 group-hover:text-primary transition-colors truncate">
                          {track.name}
                        </h3>
                        <p className="text-white/60 text-xs truncate">
                          {track.artists.map(a => a.name).join(', ')}
                        </p>
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search songs or artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-[#121212]/80 border-white/20 text-white placeholder:text-white/40 h-14 text-lg rounded-full"
              />
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {genres.map((genre) => (
                <Button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  variant={selectedGenre === genre ? 'default' : 'outline'}
                  className={`rounded-full ${
                    selectedGenre === genre
                      ? 'bg-gradient-to-r from-primary to-accent hover:opacity-90'
                      : 'bg-white/5 border-white/20 hover:bg-white/10 text-white'
                  }`}
                >
                  {genre}
                </Button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-yellow-400 text-lg">{error}</p>
            </div>
          )}

          {/* Songs Grid */}
          {!loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tracks.map((track) => (
                <Card
                  key={track.id}
                  className="bg-[#121212]/80 border-primary/20 backdrop-blur-sm hover:border-primary/40 transition-all group"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      {track.album.images[0] && (
                        <img
                          src={track.album.images[0].url}
                          alt={track.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors truncate">
                          {track.name}
                        </h3>
                        <p className="text-white/60 text-sm truncate">
                          {track.artists.map(a => a.name).join(', ')}
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-white/40 hover:text-primary hover:bg-primary/10 flex-shrink-0"
                      >
                        <Heart className="w-5 h-5" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-white/40 text-sm">
                        {formatDuration(track.duration_ms)}
                      </span>
                    </div>

                    <Link to={`/karaoke?track=${track.id}`} onClick={() => addToRecentSearches(track)}>
                      <Button className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
                        <Play className="w-4 h-4 mr-2" />
                        Sing Now
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {!loading && tracks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/60 text-lg">
                No songs found. Try a different search or filter.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
