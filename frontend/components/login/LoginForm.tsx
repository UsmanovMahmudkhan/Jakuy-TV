import { motion } from "framer-motion";
import LoginFormHeader from "./LoginFormHeader";
import PlaylistSelection from "./PlaylistSelection";

const LoginForm = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col h-full justify-center items-center gap-4"
    >
      <LoginFormHeader />
      <div className="h-[70vh] min-h-0 w-full max-w-2xl">
        <PlaylistSelection />
      </div>
    </motion.div>
  );
};

export default LoginForm;
