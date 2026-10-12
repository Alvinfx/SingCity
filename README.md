# SingCity

SingCity is a browser-based karaoke project built with React and TypeScript. It brings song search, lyrics, microphone recording, and wallet-connected uploads into one interface.

## Live App

https://singcity.vercel.app

## What It Includes

- Song search through a Supabase-hosted Spotify proxy, with demo songs when the request fails
- YouTube playback and karaoke track lookup
- Lyrics lookup and support for user-uploaded LRC files
- Microphone recording with RecordRTC and audio visualization with WaveSurfer
- Wallet connection and recording uploads through Irys
- A profile page for playing recordings and copying their links

## Tech Stack

React 19, TypeScript, Vite, React Router, Tailwind CSS, Radix UI, Framer Motion, Supabase, Ethers, Irys, RecordRTC, and WaveSurfer.

## Run Locally

Install pnpm, then run:

```bash
pnpm install
pnpm dev
```

For a production build and local preview:

```bash
pnpm build
pnpm preview
```

## Service Configuration

Song search uses the Supabase Spotify proxy. Set up the Supabase connection and configure Spotify credentials in the backend environment. YouTube lookup and optional lyrics providers require their own configuration. See [the deployment guide](DEPLOYMENT_GUIDE.md) and [YouTube integration notes](YOUTUBE_INTEGRATION.md) for the existing setup details.

Recording requires microphone permission. Uploads require a compatible wallet.

## Current Implementation

The uploader is configured for Irys devnet. Profile details and recording references are stored in the current browser's local storage.

This repository is a portfolio development project. External music, lyrics, and upload services depend on their configuration and availability.
