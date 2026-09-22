import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FaMusic, FaPause } from "react-icons/fa";

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Để thay đổi bài nhạc, bạn hãy chép file nhạc của bạn vào thư mục 'public' và đổi tên thành 'song.mp3'
  // (hoặc sửa tên file ở dòng bên dưới cho khớp với tên file của bạn)
  const audioSrc = "/song.mp3";

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3; // Play softly
    }
  }, []);

  const togglePlay = async () => {
    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.warn("Audio play failed. Bạn nhớ thêm file song.mp3 vào thư mục public nhé!", error);
      setIsPlaying(false);
      alert("Bạn chưa thêm bài hát! Hãy copy file nhạc vào thư mục public/song.mp3 nhé.");
    }
  };

  return (
    <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50">
      <audio ref={audioRef} src={audioSrc} loop />

      <motion.button
        onClick={togglePlay}
        className="relative group bg-white/40 backdrop-blur-md p-2 rounded-full shadow-lg border border-white/50 flex items-center gap-3 hover:bg-white/60 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Vinyl Record */}
        <motion.div
          className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center border-2 border-gray-700 shadow-inner overflow-hidden relative"
          animate={{ rotate: isPlaying ? 360 : 0 }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
        >
          {/* Vinyl grooves */}
          <div className="absolute w-10 h-10 rounded-full border border-gray-800" />
          <div className="absolute w-8 h-8 rounded-full border border-gray-800" />

          {/* Center Label */}
          <div className="w-4 h-4 bg-pink-400 rounded-full border border-gray-900 z-10" />
        </motion.div>

        {/* Text/Status */}
        <div className="hidden md:flex flex-col items-start pr-2">
          <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            {isPlaying ? "Now Playing" : "Our Song"}
          </span>
          <span className="text-[10px] text-gray-600 truncate w-24 text-left">
            {isPlaying ? "BbiBbi - IU" : "Click to play"}
          </span>
        </div>

        {/* Play/Pause Icon overlay on hover (Mobile) or side */}
        <div className="absolute -top-2 -right-2 bg-pink-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md">
          {isPlaying ? <FaPause size={10} /> : <FaMusic size={10} />}
        </div>
      </motion.button>
    </div>
  );
}
