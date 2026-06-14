'use client';

import Hls from 'hls.js';
import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface UseStreamOptions {
  url: string;
  autoPlay?: boolean;
}

interface UseStreamReturn {
  videoRef: RefObject<HTMLVideoElement | null>;
  audioRef: RefObject<HTMLAudioElement | null>;
  error: string | null;
  isAudioOnly: boolean;
  isLive: boolean;
  duration: number | null;
}

const proxied = (target: string): string =>
  `${window.location.origin}/api/proxy?url=${encodeURIComponent(target)}`;

const detectAudioOnly = (url: string): boolean => {
  const audioIndicators = [
    /\.mp3/i,
    /\.aac/i,
    /\.ogg/i,
    /\.wav/i,
    /\.m4a/i,
    /radio/i,
    /audio/i,
    /stream.*audio/i,
  ];
  return audioIndicators.some(pattern => pattern.test(url));
};

const useStream = ({ url, autoPlay = true }: UseStreamOptions): UseStreamReturn => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [error, setError] = useState<string | null>(null);
  const isAudioOnly = useMemo(() => detectAudioOnly(url), [url]);
  const [isLive, setIsLive] = useState(true);
  const [duration, setDuration] = useState<number | null>(null);

  const applyVodDuration = useCallback((value: number | null | undefined) => {
    if (value && isFinite(value) && value > 0) {
      setIsLive(false);
      setDuration(value);
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    const mediaElement = isAudioOnly ? (audio || video) : video;
    if (!mediaElement) return;

    let hls: Hls | null = null;
    let metadataHandler: (() => void) | null = null;
    let progressHandler: (() => void) | null = null;
    let nativeErrorHandler: (() => void) | null = null;
    let triedProxy = false;

    setError(null);
    setIsLive(true);
    setDuration(null);

    // Try the stream URL directly first; only fall back to the local proxy if the
    // direct load fails (e.g. CORS). This keeps time-to-first-frame low for streams
    // that allow direct playback.
    const loadWithHls = (sourceUrl: string, viaProxy: boolean) => {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
      });

      hls.loadSource(sourceUrl);
      hls.attachMedia(mediaElement as HTMLVideoElement | HTMLAudioElement);

      hls.on(Hls.Events.LEVEL_LOADED, (_event, data) => {
        if (data.details.live) {
          setIsLive(true);
        } else {
          applyVodDuration(data.details.totalduration);
        }
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) {
          mediaElement.play().catch(e => console.warn('Autoplay prevented:', e));
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return;
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR && !viaProxy) {
          console.warn('Direct stream load failed, retrying through proxy');
          hls?.destroy();
          loadWithHls(proxied(url), true);
          return;
        }
        console.error('Fatal HLS error:', data.type, data.details);
        hls?.destroy();
        setError('Stream could not be loaded. Please try another channel.');
      });
    };

    const initHls = () => {
      if (Hls.isSupported()) {
        loadWithHls(url, false);
        return;
      }

      if (mediaElement.canPlayType('application/vnd.apple.mpegurl')) {
        mediaElement.src = url;

        metadataHandler = () => {
          applyVodDuration((mediaElement as HTMLVideoElement | HTMLAudioElement).duration);
          if (autoPlay) {
            mediaElement.play().catch(e => console.warn('Autoplay prevented:', e));
          }
        };
        mediaElement.addEventListener('loadedmetadata', metadataHandler);

        nativeErrorHandler = () => {
          if (!triedProxy) {
            triedProxy = true;
            mediaElement.src = proxied(url);
            mediaElement.load();
            return;
          }
          setError('Stream could not be loaded. Please try another channel.');
        };
        mediaElement.addEventListener('error', nativeErrorHandler);
        return;
      }

      if (isAudioOnly && audio) {
        audio.src = url;

        metadataHandler = () => {
          applyVodDuration(audio.duration);
          if (autoPlay) {
            audio.play().catch(e => console.warn('Autoplay prevented:', e));
          }
        };
        progressHandler = () => applyVodDuration(audio.duration);

        audio.addEventListener('loadedmetadata', metadataHandler);
        audio.addEventListener('progress', progressHandler);

        nativeErrorHandler = () => {
          if (!triedProxy) {
            triedProxy = true;
            audio.src = proxied(url);
            audio.load();
            return;
          }
          setError('Stream could not be loaded. Please try another channel.');
        };
        audio.addEventListener('error', nativeErrorHandler);
        return;
      }

      setError('Format not supported in this browser.');
    };

    initHls();

    return () => {
      if (metadataHandler) {
        mediaElement.removeEventListener('loadedmetadata', metadataHandler);
      }
      if (progressHandler) {
        mediaElement.removeEventListener('progress', progressHandler);
      }
      if (nativeErrorHandler) {
        mediaElement.removeEventListener('error', nativeErrorHandler);
      }
      if (hls) hls.destroy();
    };
  }, [url, autoPlay, applyVodDuration, isAudioOnly]);

  return { videoRef, audioRef, error, isAudioOnly, isLive, duration };
};

export default useStream;
