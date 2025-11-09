# YouTube Integration for Karaoke App

## Overview

The karaoke app now uses a **hybrid approach** combining YouTube and Spotify:

- **YouTube**: Primary audio source for full-length track playback
- **Spotify**: Metadata, search, discovery, and album art
- **Lyrics APIs**: Multi-source lyrics system (unchanged)

## How It Works

### 1. Track Selection Flow

1. User selects a track from Spotify search results
2. App fetches track metadata from Spotify (name, artist, album, artwork)
3. App searches YouTube for matching music video/audio using YouTube Data API v3
4. YouTube video is loaded in a hidden IFrame player
5. WaveSurfer displays a simulated waveform synced with YouTube playback

### 2. Audio Playback

- **YouTube IFrame Player API** handles all audio playback
- Player is hidden (height: 0) - audio only, no video display
- Full-length tracks available (not limited to 30-second previews)
- Volume, play/pause, and seek controls integrated

### 3. Waveform Visualization

- **WaveSurfer.js** displays a simulated waveform for visual feedback
- Waveform progress syncs with YouTube player position every 100ms
- Click-to-seek functionality disabled (YouTube player controls seeking)

## Setup Instructions

### 1. Get YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **YouTube Data API v3**
4. Create credentials → API Key
5. (Optional) Restrict API key to YouTube Data API v3 and your domain

### 2. Configure Environment Variables

Add to your `.env` file:

```env
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here
```

### 3. API Quota Limits

YouTube Data API v3 has daily quota limits:

- **Default quota**: 10,000 units/day (free tier)
- **Search request**: 100 units
- **Video details request**: 1 unit

**Estimated usage**: ~100 searches per day with default quota

To increase quota, you can:
- Request quota increase in Google Cloud Console
- Implement caching to reduce API calls
- Use Spotify track ID → YouTube video ID mapping database

## Technical Implementation

### Files Modified

1. **`src/lib/youtube.ts`** (new)
   - YouTube Data API v3 integration
   - Search for music videos by track name and artist
   - Parse YouTube duration format (ISO 8601)
   - Load YouTube IFrame API script

2. **`src/pages/KaraokePage.tsx`**
   - YouTube IFrame Player initialization
   - Sync YouTube player with WaveSurfer
   - Update play/pause, volume, and seek controls
   - Display audio source indicator

3. **`.env.example`**
   - Added YouTube API key configuration

### Key Features

✅ **Full-length audio playback** (no 30-second limit)
✅ **Automatic YouTube search** based on Spotify metadata
✅ **Synced waveform visualization** with YouTube player
✅ **Volume control** for YouTube audio
✅ **Seek controls** (skip forward/backward)
✅ **Lyrics synchronization** with YouTube playback
✅ **Recording functionality** (unchanged)

### Fallback Behavior

If YouTube video is not found:
- App falls back to Spotify preview URL (30-second clip)
- User is notified that full playback is unavailable
- All other features continue to work normally

## Legal Considerations

### YouTube Terms of Service

- ✅ **Allowed**: Embedding YouTube videos via IFrame API
- ✅ **Allowed**: Controlling playback via API
- ❌ **Not allowed**: Downloading or extracting audio streams
- ❌ **Not allowed**: Removing YouTube branding (we use hidden player)

### Best Practices

1. **Attribution**: Consider adding "Powered by YouTube" notice
2. **Compliance**: Follow YouTube's [Terms of Service](https://www.youtube.com/t/terms)
3. **User Experience**: Inform users that audio is streamed from YouTube
4. **Caching**: Cache YouTube video IDs to reduce API calls

## Future Enhancements

### Potential Improvements

1. **Video ID Caching**
   - Store Spotify track ID → YouTube video ID mappings in database
   - Reduce YouTube API calls and improve load times

2. **Manual Video Selection**
   - Allow users to choose from multiple YouTube results
   - Handle cases where auto-search finds wrong video

3. **Offline Mode**
   - Allow users to upload their own audio files
   - Support local karaoke track files

4. **YouTube Music API**
   - Explore YouTube Music API for better music-specific results
   - May provide more accurate matches for songs

5. **Waveform Generation**
   - Generate actual waveforms from audio analysis
   - Store waveform data for faster loading

## Troubleshooting

### No YouTube API Key

**Symptom**: Console warning "YouTube API key not configured"

**Solution**: Add `VITE_YOUTUBE_API_KEY` to your `.env` file

### YouTube Video Not Found

**Symptom**: Track plays 30-second Spotify preview instead of full track

**Possible causes**:
- Song not available on YouTube
- Search query doesn't match YouTube video title
- API quota exceeded

**Solution**: Check console logs for YouTube search results

### Player Not Loading

**Symptom**: No audio playback, player controls don't work

**Possible causes**:
- YouTube IFrame API script failed to load
- CORS or network issues
- Invalid video ID

**Solution**: Check browser console for errors

### Audio Sync Issues

**Symptom**: Waveform progress doesn't match audio playback

**Solution**: Sync interval runs every 100ms - slight delay is normal

## API Reference

### YouTube Data API v3

**Search Endpoint**:
```
GET https://www.googleapis.com/youtube/v3/search
?part=snippet
&maxResults=5
&q={trackName} {artistName} official audio
&type=video
&videoCategoryId=10
&key={API_KEY}
```

**Video Details Endpoint**:
```
GET https://www.googleapis.com/youtube/v3/videos
?part=contentDetails,snippet
&id={videoId}
&key={API_KEY}
```

### YouTube IFrame Player API

**Documentation**: https://developers.google.com/youtube/iframe_api_reference

**Key Methods**:
- `playVideo()`: Start playback
- `pauseVideo()`: Pause playback
- `seekTo(seconds, allowSeekAhead)`: Seek to position
- `setVolume(volume)`: Set volume (0-100)
- `getCurrentTime()`: Get current playback position
- `getDuration()`: Get video duration

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify YouTube API key is configured correctly
3. Ensure YouTube Data API v3 is enabled in Google Cloud Console
4. Check API quota usage in Google Cloud Console
