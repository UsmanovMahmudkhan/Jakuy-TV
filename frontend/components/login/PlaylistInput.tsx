import { Input } from "@/components/ui/input";
import { Field, FieldError } from "@/components/ui/field";
import { useLoginContext } from "@/contexts/LoginContext";

const PlaylistInput = () => {
  const { input, setInput, error } = useLoginContext();

  return (
    <Field>
      <Input
        id="playlist-input"
        placeholder="Paste your playlist URL here"
        value={input}
        onChange={e => setInput(e.target.value)}
        className="bg-neutral-900 border-neutral-800 focus:ring-red-600 focus:border-red-600 placeholder:text-neutral-600 h-14 text-lg px-4"
      />
      {error && <FieldError errors={[{ message: error }]} className="text-base" />}
    </Field>
  );
};

export default PlaylistInput;
