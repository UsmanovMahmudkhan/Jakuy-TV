import JakuyLogo from "@/components/JakuyLogo";

interface LoadingViewProps {
  // When the backend is cold-starting the initial load can take up to a minute;
  // show an explanatory message instead of a bare "Loading..." spinner.
  isWakingUp?: boolean;
}

const LoadingView = ({ isWakingUp = false }: LoadingViewProps) => {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <JakuyLogo className="size-10 animate-pulse" />
          <span className="text-2xl font-bold text-white">Jakuy TV</span>
        </div>
        <p className="text-neutral-400 text-center">
          {isWakingUp ? "Waking up the server — this can take up to a minute…" : "Loading..."}
        </p>
      </div>
    </div>
  );
};

export default LoadingView;
