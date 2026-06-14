'use client';

import useStream from "@/hooks/useStream";
import StreamError from "./StreamError";

interface VideoPlayerProps {
  url: string;
  poster?: string;
  autoPlay?: boolean;
  controls?: boolean;
  muted?: boolean;
  className?: string;
}

const VideoPlayer = ({ url, poster, autoPlay = true, controls = true, muted = false, className = "object-contain" }: VideoPlayerProps) => {
  const { videoRef, error } = useStream({ url, autoPlay });

  return (
    <div className="relative w-full h-full bg-black group overflow-hidden rounded-md shadow-2xl">
      {error ? (
        <StreamError error={error} />
      ) : (
        <video ref={videoRef} className={`w-full h-full ${className}`} poster={poster} controls={controls} muted={muted} playsInline />
      )}
    </div>
  );
};

export default VideoPlayer;
