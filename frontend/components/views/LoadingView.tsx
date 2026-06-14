import JakuyLogo from "@/components/JakuyLogo";

const LoadingView = () => {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <JakuyLogo className="size-10 animate-pulse" />
          <span className="text-2xl font-bold text-white">Jakuy TV</span>
        </div>
        <p className="text-neutral-400 text-center">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingView;

