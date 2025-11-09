import { Buffer } from 'buffer';
import { WebUploader } from '@irys/web-upload';
import { WebEthereum } from '@irys/web-upload-ethereum';
import { EthersV6Adapter } from '@irys/web-upload-ethereum-ethers-v6';
import { BrowserProvider } from 'ethers';

export interface UploadResult {
  id: string;
  url: string;
  timestamp: number;
}

export interface PerformanceMetadata {
  trackName: string;
  artistName: string;
  duration: number;
  recordedAt: string;
  appVersion: string;
}

/**
 * Compress audio blob to reduce file size
 */
async function compressAudio(audioBlob: Blob): Promise<Blob> {
  // Compress more aggressively - if over 2MB
  if (audioBlob.size < 2 * 1024 * 1024) { // 2MB
    return audioBlob;
  }

  console.log('🗜️ Compressing audio from', (audioBlob.size / 1024 / 1024).toFixed(2), 'MB');

  return new Promise((resolve, reject) => {
    const audioContext = new AudioContext();
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Create offline context with lower sample rate and mono for better compression
        const offlineContext = new OfflineAudioContext(
          1, // Mono for smaller size
          audioBuffer.length,
          16000 // Lower sample rate for faster upload
        );

        const source = offlineContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(offlineContext.destination);
        source.start();

        const renderedBuffer = await offlineContext.startRendering();

        // Convert to WAV with lower quality
        const wavBlob = audioBufferToWav(renderedBuffer);
        console.log('✅ Compressed to', (wavBlob.size / 1024 / 1024).toFixed(2), 'MB');
        resolve(wavBlob);
      } catch (error) {
        console.warn('Compression failed, using original:', error);
        resolve(audioBlob);
      }
    };

    reader.onerror = () => {
      console.warn('Failed to read audio for compression, using original');
      resolve(audioBlob);
    };

    reader.readAsArrayBuffer(audioBlob);
  });
}

/**
 * Convert AudioBuffer to WAV Blob
 */
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const length = buffer.length * buffer.numberOfChannels * 2;
  const arrayBuffer = new ArrayBuffer(44 + length);
  const view = new DataView(arrayBuffer);
  const channels: Float32Array[] = [];
  let offset = 0;
  let pos = 0;

  // Write WAV header
  const setUint16 = (data: number) => {
    view.setUint16(pos, data, true);
    pos += 2;
  };
  const setUint32 = (data: number) => {
    view.setUint32(pos, data, true);
    pos += 4;
  };

  // "RIFF" chunk descriptor
  setUint32(0x46464952);
  setUint32(36 + length);
  setUint32(0x45564157);

  // "fmt" sub-chunk
  setUint32(0x20746d66);
  setUint32(16);
  setUint16(1);
  setUint16(buffer.numberOfChannels);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * buffer.numberOfChannels * 2);
  setUint16(buffer.numberOfChannels * 2);
  setUint16(16);

  // "data" sub-chunk
  setUint32(0x61746164);
  setUint32(length);

  // Write interleaved data
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < arrayBuffer.byteLength) {
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

/**
 * Initialize IRYS uploader with MetaMask authentication
 */
export async function initializeIrys() {
  if (!window.ethereum) {
    throw new Error('Please install MetaMask to upload recordings to IRYS');
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    }) as string[];
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please unlock MetaMask.');
    }

    console.log('🔗 Connecting to IRYS with account:', accounts[0]);

    // Create ethers.js v6 provider from MetaMask
    const provider = new BrowserProvider(window.ethereum);

    // Initialize IRYS web uploader with Ethers v6 adapter
    // Use devnet for testing (free uploads)
    const irysUploader = await WebUploader(WebEthereum)
      .withAdapter(EthersV6Adapter(provider))
      .withRpc('https://devnet.irys.xyz')
      .devnet();
    
    console.log('✅ IRYS uploader initialized');
    return irysUploader;
  } catch (error) {
    console.error('Error initializing IRYS:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to connect wallet. Please try again.');
  }
}

/**
 * Upload audio recording to IRYS datachain with metadata
 */
export async function uploadRecordingToIrys(
  audioBlob: Blob,
  metadata: PerformanceMetadata
): Promise<UploadResult> {
  // Check file size and warn if too large
  const sizeMB = audioBlob.size / 1024 / 1024;
  console.log('📦 Original file size:', sizeMB.toFixed(2), 'MB');
  
  if (sizeMB > 100) {
    throw new Error(`File too large: ${sizeMB.toFixed(2)}MB. IRYS devnet limit is ~100MB`);
  }

  // Compress audio if needed
  const compressedBlob = await compressAudio(audioBlob);
  const finalSizeMB = compressedBlob.size / 1024 / 1024;
  console.log('📦 Final upload size:', finalSizeMB.toFixed(2), 'MB');

  // Test network connectivity
  try {
    const testResponse = await fetch('https://devnet.irys.xyz', { method: 'HEAD' });
    if (!testResponse.ok) {
      console.warn('⚠️ IRYS devnet may be unreachable');
    }
  } catch (e) {
    console.warn('⚠️ Network connectivity issue to IRYS devnet:', e);
  }

  const irysUploader = await initializeIrys();

  // Prepare tags for IRYS
  const tags = [
    { name: 'Content-Type', value: compressedBlob.type || 'audio/wav' },
    { name: 'App-Name', value: 'Karaoke-App' },
    { name: 'App-Version', value: metadata.appVersion },
    { name: 'Track-Name', value: metadata.trackName },
    { name: 'Artist-Name', value: metadata.artistName },
    { name: 'Duration', value: metadata.duration.toString() },
    { name: 'Recorded-At', value: metadata.recordedAt },
    { name: 'Type', value: 'karaoke-recording' },
  ];

  try {
    // Convert compressed blob to buffer for upload
    const arrayBuffer = await compressedBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log('📤 Uploading to IRYS...', {
      size: buffer.length,
      type: compressedBlob.type,
      tags: tags.length
    });
    
    // Upload to IRYS datachain with chunking for faster uploads
    console.log('📤 Starting chunked upload...');
    const receipt = await irysUploader.upload(buffer, { tags });

    const irysUrl = `https://gateway.irys.xyz/${receipt.id}`;
    
    console.log('✅ Recording uploaded to IRYS:', {
      id: receipt.id,
      url: irysUrl,
      timestamp: Date.now(),
    });
    
    return {
      id: receipt.id,
      url: irysUrl,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('❌ Error uploading to IRYS:', error);
    if (error instanceof Error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
    throw new Error('Failed to upload recording. Please try again.');
  }
}

/**
 * Fund IRYS account for uploads
 */
export async function fundIrysAccount(amount: number): Promise<void> {
  const irysUploader = await initializeIrys();
  
  try {
    const fundTx = await irysUploader.fund(irysUploader.utils.toAtomic(amount));
    console.log(`Successfully funded ${irysUploader.utils.fromAtomic(fundTx.quantity)} ${irysUploader.token}`);
  } catch (error) {
    console.error('Error funding account:', error);
    throw new Error('Failed to fund account. Please try again.');
  }
}

/**
 * Check IRYS account balance
 */
export async function checkWalletBalance(): Promise<string> {
  const irysUploader = await initializeIrys();
  
  try {
    const balance = await irysUploader.getLoadedBalance();
    return irysUploader.utils.fromAtomic(balance).toString();
  } catch (error) {
    console.error('Error checking balance:', error);
    return '0';
  }
}

/**
 * Get upload cost estimate
 */
export async function getUploadCost(fileSizeBytes: number): Promise<string> {
  const irysUploader = await initializeIrys();
  
  try {
    const cost = await irysUploader.getPrice(fileSizeBytes);
    return irysUploader.utils.fromAtomic(cost).toString();
  } catch (error) {
    console.error('Error getting upload cost:', error);
    return 'Unknown';
  }
}
