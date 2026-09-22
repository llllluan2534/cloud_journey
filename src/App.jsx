import Header from "./components/Header";
import Footer from "./components/Footer";
import MusicPlayer from "./components/MusicPlayer";

export default function App({ children }) {
  return (
    <div className="flex flex-col min-h-screen relative">
      <Header />
      <main className="flex-grow pt-14 md:pt-20 pb-28 md:pb-6">{children}</main>
      <Footer />
      <MusicPlayer />
    </div>
  );
}
