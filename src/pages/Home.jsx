import story from "../data/story.json";
import HeartBeat from "../components/HeartBeat";
import Banner from "../components/Banner";

import Journey from "../components/Journey";
import Dashboard from "./Dashboard";

export default function Home() {
  const { couple, tagline, intro } = story;

  return (
    <div className="text-center mt-1 md:mt-2 space-y-6 px-4">
      <Banner />
      <hr className="my-6 md:my-8 border-t border-gray-300 w-3/4 mx-auto" />
      <Journey />
      
      <div className="pt-16 md:pt-24 pb-20">
        <h2 className="text-2xl font-black text-[#39332c] mb-8 uppercase tracking-widest">Trung tâm điều khiển</h2>
        <Dashboard />
      </div>
    </div>
  );
}
