import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Play } from "lucide-react";
import { useLoginContext } from "@/contexts/LoginContext";

const StartWatchingButton = () => {
  const { input, isLoading, handleLoad } = useLoginContext();

  return (
    <Field>
      <Button
        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium shadow-red-900/20 shadow-lg h-14 text-lg"
        onClick={handleLoad}
        disabled={!input || isLoading}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">Loading...</span>
        ) : (
          <span className="flex items-center gap-2">
            <Play className="w-5 h-5" fill="currentColor" /> Start Watching
          </span>
        )}
      </Button>
    </Field>
  );
};

export default StartWatchingButton;
