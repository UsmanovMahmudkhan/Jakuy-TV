import Link from "next/link";
import JakuyLogo from "@/components/JakuyLogo";

const LoginHeader = () => {
  return (
    <div className="flex justify-center gap-2 md:justify-start">
      <Link href="/" className="flex items-center gap-2 font-medium text-white">
        <div className="flex size-8 items-center justify-center rounded-md">
          <JakuyLogo className="size-8" />
        </div>
        <span className="text-xl font-bold">Jakuy TV</span>
      </Link>
    </div>
  );
};

export default LoginHeader;
