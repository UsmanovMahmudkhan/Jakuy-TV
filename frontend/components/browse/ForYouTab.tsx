import HeroSection from "./HeroSection";
import ContinueWatchingSection from "./ContinueWatchingSection";
import CategoryRows from "./CategoryRows";

const ForYouTab = () => {
  return (
    <>
      <HeroSection />
      <div className="-mt-12 md:-mt-48 relative z-20 space-y-8 pb-20">
        <ContinueWatchingSection />
        <CategoryRows />
      </div>
    </>
  );
};

export default ForYouTab;

