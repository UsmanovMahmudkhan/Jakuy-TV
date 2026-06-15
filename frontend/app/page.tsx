import { getInitialPlaylist } from "@/lib/channels-server";
import HomeClient from "@/components/views/HomeClient";

// Statically render the shell + channel list with periodic background
// revalidation. The first usable screen is served from the CDN and never blocks
// on a live (possibly cold-started) backend request.
export const revalidate = 300;

const Home = async () => {
  const initialPlaylist = await getInitialPlaylist();
  return <HomeClient initialPlaylist={initialPlaylist} />;
};

export default Home;
