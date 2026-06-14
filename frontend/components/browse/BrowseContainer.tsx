import { motion } from "framer-motion";
import BrowseNavbar from "@/components/browse/BrowseNavbar";
import TabContent from "@/components/browse/TabContent";
import BrandFooter from "@/components/BrandFooter";

const BrowseContainer = () => {
  return (
    <motion.div
      key="browse-interface"
      className="min-h-screen w-full bg-neutral-950 text-white overflow-x-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      <BrowseNavbar />
      <TabContent />
      <BrandFooter />
    </motion.div>
  );
};

export default BrowseContainer;

