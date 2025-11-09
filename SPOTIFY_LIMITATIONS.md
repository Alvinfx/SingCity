# Spotify API Limitations for Karaoke App

## Audio Playback Restrictions

### Preview URLs Only
Spotify Web API **does not provide full track audio** for playback. The API only returns:
- **30-second preview URLs** for most tracks
- Some tracks have **no preview URL at all**

### Why Full Playback Isn't Available

1. **Licensing Restrictions**: Spotify's licensing agreements with record labels prohibit providing full track audio via their Web API
2. **Spotify SDK Limitations**: Even the Spotify Web Playback SDK requires:
   - Users to have a **Spotify Premium subscription**
   - Active Spotify app authentication
   - Cannot be used for karaoke-style applications where users record over tracks

### Current Implementation

The karaoke player currently:
- ✅ Loads 30-second preview URLs when available
- ✅ Displays waveform visualization
- ✅ Shows synchronized lyrics
- ✅ Allows recording user vocals
- ❌ Cannot play full tracks due to Spotify API limitations

## Alternative Solutions

### Option 1: YouTube Audio (Recommended)
Use YouTube Data API + audio extraction:
- Search for official music videos/audio
- Extract audio stream for playback
- **Pros**: Full-length tracks, free API
- **Cons**: Requires backend processing, legal gray area

### Option 2: SoundCloud API
- Some tracks available via SoundCloud API
- **Pros**: Full tracks, streaming-friendly
- **Cons**: Limited catalog, requires API key

### Option 3: User Upload
- Allow users to upload their own audio files
- **Pros**: Full control, no API limits
- **Cons**: Copyright concerns, storage costs

### Option 4: Spotify Premium + Web Playback SDK
- Require users to have Spotify Premium
- Use Spotify Web Playback SDK for full playback
- **Pros**: Official, legal, full tracks
- **Cons**: Requires Premium subscription, complex OAuth flow

### Option 5: Instrumental/Karaoke Track Services
- Use dedicated karaoke track APIs like:
  - Singa API
  - Smule API
  - KaraFun API
- **Pros**: Purpose-built for karaoke, legal
- **Cons**: Paid services, smaller catalogs

## Recommended Implementation Path

For a production karaoke app, we recommend:

1. **Primary**: Integrate YouTube audio extraction for full tracks
2. **Secondary**: Keep Spotify for metadata, lyrics sync, and discovery
3. **Tertiary**: Allow user audio uploads as fallback

This hybrid approach provides:
- Full-length audio playback
- Rich metadata from Spotify
- User flexibility
- Legal compliance (with proper attribution)

## Current Status

The app is configured to work with Spotify's 30-second previews. To enable full playback, you'll need to implement one of the alternative solutions above.

**Note**: The "no sound" issue is likely because:
1. The selected track has no preview URL
2. Browser autoplay policies blocking audio
3. Volume is muted or set to 0

Check browser console for specific errors.
