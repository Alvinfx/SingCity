# Deployment Guide: GitHub + Vercel

## Prerequisites
- GitHub account
- Vercel account (sign up at https://vercel.com)
- Git installed on your local machine

## Step 1: Initialize Git Repository

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Karaoke app"
```

## Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository:
   - Repository name: `karaoke-app` (or your preferred name)
   - Description: "AI-powered karaoke application with YouTube integration"
   - Choose **Public** or **Private**
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
3. Click "Create repository"

## Step 3: Push to GitHub

```bash
# Add GitHub remote (replace YOUR_USERNAME and YOUR_REPO with your values)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 4: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repository
4. Configure project:
   - **Framework Preset**: Vite
   - **Build Command**: `pnpm build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `pnpm install` (auto-detected)

5. **Add Environment Variables** (click "Environment Variables"):
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_YOUTUBE_API_KEY=your_youtube_api_key
   VITE_MUSIXMATCH_API_KEY=your_musixmatch_api_key (optional)
   VITE_GENIUS_API_KEY=your_genius_api_key (optional)
   ```

6. Click "Deploy"

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? (press enter for default or type custom name)
# - Directory? ./ (press enter)
# - Override settings? No

# Add environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_YOUTUBE_API_KEY

# Deploy to production
vercel --prod
```

## Step 5: Configure Supabase for Production

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Add your Vercel deployment URL to:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: `https://your-app.vercel.app/**`

## Step 6: Update Spotify Edge Function (if using)

If you're using Spotify integration:

1. Update your Supabase Edge Function environment variables:
   ```bash
   # Set Spotify credentials in Supabase
   supabase secrets set SPOTIFY_CLIENT_ID=your_client_id
   supabase secrets set SPOTIFY_CLIENT_SECRET=your_client_secret
   ```

2. Deploy edge functions:
   ```bash
   supabase functions deploy spotify-api
   supabase functions deploy spotify-proxy
   ```

## Step 7: Verify Deployment

1. Visit your Vercel deployment URL
2. Test key features:
   - ✅ Homepage loads
   - ✅ Search functionality works
   - ✅ Karaoke playback works
   - ✅ YouTube integration works
   - ✅ Lyrics display correctly
   - ✅ Recording feature works

## Continuous Deployment

Once connected, Vercel automatically deploys:
- **Production**: Every push to `main` branch
- **Preview**: Every pull request

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Ensure `pnpm-lock.yaml` is committed

### Environment Variables Not Working
- Prefix all client-side variables with `VITE_`
- Redeploy after adding/changing environment variables
- Check variable names match exactly

### YouTube API Issues
- Verify API key is valid
- Check API quotas in Google Cloud Console
- Ensure YouTube Data API v3 is enabled

### Supabase Connection Issues
- Verify Supabase URL and anon key are correct
- Check Supabase project is not paused
- Verify redirect URLs are configured

## Custom Domain (Optional)

1. Go to Vercel project settings
2. Navigate to **Domains**
3. Add your custom domain
4. Follow DNS configuration instructions
5. Update Supabase redirect URLs with custom domain

## Monitoring

- **Vercel Analytics**: Enable in project settings for traffic insights
- **Error Tracking**: Check Vercel deployment logs for runtime errors
- **Performance**: Use Vercel Speed Insights

## Security Checklist

- ✅ `.env` file is in `.gitignore`
- ✅ No API keys committed to repository
- ✅ All sensitive variables set in Vercel dashboard
- ✅ Supabase RLS policies configured
- ✅ CORS settings configured in Supabase

## Support

- Vercel Documentation: https://vercel.com/docs
- Supabase Documentation: https://supabase.com/docs
- GitHub Issues: Create issues in your repository

---

**Your app is now live! 🎉**
