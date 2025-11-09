import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Music, Heart, Share2, Download, Play, Trash2, Copy, Check, ExternalLink, Edit2, Save, X, Camera } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';

interface Recording {
  id: string;
  trackName: string;
  artistName: string;
  duration: number;
  recordedAt: string;
  irysUrl: string;
  timestamp: number;
}

export default function ProfilePage() {
  const { walletAddress, walletConnected, connectWallet } = useWallet();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const audioRef = useState<HTMLAudioElement | null>(null)[0];
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('SingCity Star');
  const [bio, setBio] = useState('Karaoke enthusiast 🎤');
  const [profilePhoto, setProfilePhoto] = useState('https://api.dicebear.com/7.x/avataaars/svg?seed=user');
  const [editedName, setEditedName] = useState(displayName);
  const [editedBio, setEditedBio] = useState(bio);
  const [editedPhoto, setEditedPhoto] = useState(profilePhoto);

  // Load recordings and profile from localStorage
  useEffect(() => {
    const loadRecordings = () => {
      try {
        const stored = localStorage.getItem('irys_recordings');
        if (stored) {
          const parsed = JSON.parse(stored) as Recording[];
          // Sort by timestamp, newest first
          const sorted = parsed.sort((a, b) => b.timestamp - a.timestamp);
          setRecordings(sorted);
        }
      } catch (error) {
        console.error('Error loading recordings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const loadProfile = () => {
      try {
        const storedName = localStorage.getItem('profile_name');
        const storedBio = localStorage.getItem('profile_bio');
        const storedPhoto = localStorage.getItem('profile_photo');
        if (storedName) {
          setDisplayName(storedName);
          setEditedName(storedName);
        }
        if (storedBio) {
          setBio(storedBio);
          setEditedBio(storedBio);
        }
        if (storedPhoto) {
          setProfilePhoto(storedPhoto);
          setEditedPhoto(storedPhoto);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadRecordings();
    loadProfile();
  }, []);

  // Play/pause recording
  const togglePlay = async (url: string, id: string) => {
    if (playingId === id) {
      // Stop current playback
      if (audioRef) {
        audioRef.pause();
        audioRef.currentTime = 0;
      }
      setPlayingId(null);
    } else {
      // Start new playback
      if (audioRef) {
        audioRef.pause();
      }
      const audio = new Audio(url);
      audio.play();
      audio.onended = () => setPlayingId(null);
      setPlayingId(id);
    }
  };

  // Delete recording
  const deleteRecording = (id: string) => {
    if (confirm('Are you sure you want to delete this recording?')) {
      const updated = recordings.filter(r => r.id !== id);
      setRecordings(updated);
      localStorage.setItem('irys_recordings', JSON.stringify(updated));
      
      if (playingId === id && audioRef) {
        audioRef.pause();
        setPlayingId(null);
      }
    }
  };

  // Copy link to clipboard
  const copyLink = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Share on social media
  const shareRecording = (recording: Recording, platform: 'twitter' | 'facebook') => {
    const text = `Check out my karaoke performance of "${recording.trackName}" by ${recording.artistName}!`;
    const url = recording.irysUrl;

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    };

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Save profile changes
  const saveProfile = () => {
    setDisplayName(editedName);
    setBio(editedBio);
    setProfilePhoto(editedPhoto);
    localStorage.setItem('profile_name', editedName);
    localStorage.setItem('profile_bio', editedBio);
    localStorage.setItem('profile_photo', editedPhoto);
    setIsEditing(false);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditedName(displayName);
    setEditedBio(bio);
    setEditedPhoto(profilePhoto);
    setIsEditing(false);
  };

  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#2C0E4A] via-[#121212] to-[#1a0a2e]">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <Card className="bg-[#121212]/80 border-primary/20 backdrop-blur-sm p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative group">
                <Avatar className="w-32 h-32 border-4 border-primary/30">
                  <AvatarImage src={isEditing ? editedPhoto : profilePhoto} />
                  <AvatarFallback>SC</AvatarFallback>
                </Avatar>
                {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="flex-1 text-center md:text-left">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="text-4xl font-black text-white mb-2 bg-white/10 border border-primary/30 rounded px-3 py-1 w-full max-w-md focus:outline-none focus:border-primary"
                    placeholder="Your name"
                  />
                ) : (
                  <h1 className="text-4xl font-black text-white mb-2">
                    {walletConnected ? displayName : 'Guest'}
                  </h1>
                )}
                {isEditing ? (
                  <input
                    type="text"
                    value={editedBio}
                    onChange={(e) => setEditedBio(e.target.value)}
                    className="text-white/60 mb-4 bg-white/10 border border-primary/30 rounded px-3 py-1 w-full max-w-md focus:outline-none focus:border-primary"
                    placeholder="Your bio"
                  />
                ) : (
                  <p className="text-white/60 mb-4">
                    {walletConnected ? bio : 'Connect wallet to save recordings'}
                  </p>
                )}
                {walletConnected && (
                  <p className="text-white/40 text-sm mb-4">
                    Wallet: {walletAddress}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">
                      {recordings.length}
                    </p>
                    <p className="text-white/60 text-sm">Recordings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-accent">
                      {recordings.reduce((sum, r) => sum + Math.floor(r.duration), 0)}
                    </p>
                    <p className="text-white/60 text-sm">Total Seconds</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">
                      {recordings.length > 0 ? '🎤' : '🎵'}
                    </p>
                    <p className="text-white/60 text-sm">{recordings.length > 0 ? 'Active' : 'Start Singing'}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {recordings.length >= 5 && (
                    <Badge className="bg-primary/20 text-primary border-primary/30">
                      <Trophy className="w-3 h-3 mr-1" />
                      Dedicated Singer
                    </Badge>
                  )}
                  {recordings.length >= 1 && (
                    <Badge className="bg-accent/20 text-accent border-accent/30">
                      <Music className="w-3 h-3 mr-1" />
                      {recordings.length >= 10 ? 'Karaoke Master' : 'Rising Star'}
                    </Badge>
                  )}
                  {!walletConnected && (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      Connect Wallet to Upload
                    </Badge>
                  )}
                </div>
              </div>

              {!walletConnected ? (
                <Button 
                  onClick={connectWallet}
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  Connect Wallet
                </Button>
              ) : isEditing ? (
                <div className="flex gap-2">
                  <Button 
                    onClick={saveProfile}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button 
                    onClick={cancelEdit}
                    variant="outline"
                    className="border-white/20 hover:bg-white/10"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="recordings" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-[#121212]/80 border border-white/10 mb-8">
              <TabsTrigger value="recordings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent">
                My Recordings
              </TabsTrigger>
              <TabsTrigger value="favorites" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent">
                Favorites
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recordings" className="space-y-4">
              {isLoading ? (
                <Card className="bg-[#121212]/80 border-primary/20 backdrop-blur-sm p-12">
                  <div className="text-center">
                    <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                    <p className="text-white/60">Loading recordings...</p>
                  </div>
                </Card>
              ) : recordings.length === 0 ? (
                <Card className="bg-[#121212]/80 border-primary/20 backdrop-blur-sm p-12">
                  <div className="text-center">
                    <Music className="w-16 h-16 text-primary/40 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Recordings Yet</h3>
                    <p className="text-white/60 mb-6">
                      Start singing and upload your performances to IRYS!
                    </p>
                    <Button 
                      onClick={() => window.location.href = '/sing'}
                      className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                    >
                      Go to Karaoke Studio
                    </Button>
                  </div>
                </Card>
              ) : (
                recordings.map((recording) => (
                  <Card
                    key={recording.id}
                    className="bg-[#121212]/80 border-primary/20 backdrop-blur-sm hover:border-primary/40 transition-all"
                  >
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-1">
                            {recording.trackName}
                          </h3>
                          <p className="text-white/60 mb-2">{recording.artistName}</p>
                          <div className="flex items-center gap-4 text-sm text-white/40">
                            <span>{formatDate(recording.recordedAt)}</span>
                            <span>Duration: {formatDuration(recording.duration)}</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                            Stored on IRYS
                          </Badge>
                          <div className="flex flex-wrap gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => togglePlay(recording.irysUrl, recording.id)}
                              className={playingId === recording.id ? 'bg-primary hover:bg-primary/80' : 'bg-white/10 hover:bg-white/20'}
                            >
                              <Play className="w-4 h-4 mr-1" />
                              {playingId === recording.id ? 'Playing...' : 'Play'}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => copyLink(recording.irysUrl, recording.id)}
                              className="border-white/20 hover:bg-white/10"
                            >
                              {copiedId === recording.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => window.open(recording.irysUrl, '_blank')}
                              className="border-white/20 hover:bg-white/10"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => shareRecording(recording, 'twitter')}
                              className="border-white/20 hover:bg-white/10"
                            >
                              <Share2 className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => deleteRecording(recording.id)}
                              className="border-red-500/20 hover:bg-red-500/10 text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="favorites" className="text-center py-12">
              <p className="text-white/60 text-lg">
                No favorites yet. Start exploring the library!
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
