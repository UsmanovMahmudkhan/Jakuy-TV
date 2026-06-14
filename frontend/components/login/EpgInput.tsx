import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { useLoginContext } from "@/contexts/LoginContext";

const EpgInput = () => {
  const { epgInput, setEpgInput } = useLoginContext();

  return (
    <Field>
      <Input
        id="epg-input"
        placeholder="EPG URL (optional)"
        value={epgInput}
        onChange={e => setEpgInput(e.target.value)}
        className="bg-neutral-900 border-neutral-800 focus:ring-red-600 focus:border-red-600 placeholder:text-neutral-600 h-14 text-lg px-4"
      />
    </Field>
  );
};

export default EpgInput;
