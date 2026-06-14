import JakuyLogo from "@/components/JakuyLogo";

const LoginSidebar = () => {
  return (
    <div className="relative hidden overflow-hidden border-l border-neutral-800 bg-neutral-900 lg:block">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(220,38,38,0.3),_transparent_45%)]" />
      <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center">
        <JakuyLogo className="mb-8 size-28 drop-shadow-2xl" />
        <h2 className="mb-2 text-4xl font-bold text-white">Jakuy TV</h2>
        <p className="max-w-md text-neutral-400">Watch public Uzbek live TV channels in one clean interface.</p>
      </div>
    </div>
  );
};

export default LoginSidebar;
