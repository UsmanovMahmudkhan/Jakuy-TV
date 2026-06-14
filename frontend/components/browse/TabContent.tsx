import { motion, AnimatePresence } from "framer-motion";
import { useBrowseContext } from "@/contexts/BrowseContext";
import { Tab } from "@/types";
import ForYouTab from "./ForYouTab";
import FavoritesTab from "./FavoritesTab";
import ChannelGrid from "./ChannelGrid";

const TabContent = () => {
  const { activeTab, previousTab, getSlideDirection, isReturningFromFullscreen } = useBrowseContext();

  const slideVariants = {
    enter: (direction: number) => ({
      x: isReturningFromFullscreen ? 0 : direction > 0 ? 24 : -24,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: isReturningFromFullscreen ? 0 : direction > 0 ? -24 : 24,
      opacity: 0,
    }),
  };

  const transition = {
    x: isReturningFromFullscreen ? { duration: 0 } : { type: "spring" as const, stiffness: 300, damping: 30 },
    opacity: { duration: 0.15 },
  };

  const tabs = [
    {
      id: Tab.FOR_YOU,
      key: "foryou",
      component: ForYouTab,
      className: "",
    },
    {
      id: Tab.ALL,
      key: "all",
      component: ChannelGrid,
      className: "pt-24 px-8 pb-20 mt-4",
    },
    {
      id: Tab.FAVORITES,
      key: "favorites",
      component: FavoritesTab,
      className: "pt-24 px-8 pb-20",
    },
  ];

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence mode="wait" custom={getSlideDirection(previousTab, activeTab)}>
        {tabs.map(
          ({ id, key, component: Component, className }) =>
            activeTab === id && (
              <motion.div
                key={key}
                custom={getSlideDirection(previousTab, activeTab)}
                initial="enter"
                animate="center"
                exit="exit"
                variants={slideVariants}
                transition={transition}
                className={className}
              >
                <Component />
              </motion.div>
            )
        )}
      </AnimatePresence>
    </div>
  );
};

export default TabContent;

