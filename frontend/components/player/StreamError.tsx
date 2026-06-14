'use client';

import { AlertCircle, Tv2 } from "lucide-react";

interface StreamErrorProps {
  error?: string | null;
  className?: string;
}

const StreamError = ({ error, className = "" }: StreamErrorProps) => {
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center bg-neutral-950 p-6 text-center ${className}`}>
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center animate-pulse">
          <Tv2 className="w-10 h-10 text-red-500" />
        </div>
        <div className="absolute -top-1 -right-1">
          <AlertCircle className="w-6 h-6 text-red-500 fill-neutral-950" />
        </div>
      </div>

      <div className="max-w-md space-y-4">
        <h3 className="text-2xl font-bold text-white tracking-tight">
          Stream Unavailable
        </h3>
        
        <div className="space-y-2">
          <p className="text-neutral-400 leading-relaxed">
            {error || "We encountered an issue connecting to this channel's stream. This is usually a temporary provider issue."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StreamError;

