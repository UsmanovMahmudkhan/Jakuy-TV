import { LoginProvider } from "@/contexts/LoginContext";
import LoginHeader from "@/components/login/LoginHeader";
import LoginForm from "@/components/login/LoginForm";
import LoginSidebar from "@/components/login/LoginSidebar";

const LoginContent = () => {
  return (
    <div className="grid h-screen lg:grid-cols-2 bg-neutral-950 text-neutral-100 overflow-hidden">
      <div className="relative flex flex-col p-6 md:p-10">
        <div className="absolute top-6 left-6 md:top-10 md:left-10 right-6 md:right-10 z-10">
          <LoginHeader />
        </div>
        <div className="flex flex-col pt-20 pb-6 min-h-0 h-full">
          <div className="w-full max-w-2xl mx-auto flex flex-col h-full">
            <LoginForm />
          </div>
        </div>
      </div>
      <LoginSidebar />
    </div>
  );
};

const LoginView = () => {
  return (
    <LoginProvider>
      <LoginContent />
    </LoginProvider>
  );
};

export default LoginView;
