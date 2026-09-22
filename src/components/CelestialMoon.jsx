import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playChimeSound } from "../utils/audioEffects";

export default function CelestialMoon({ timeOfDay }) {
  const [isClicked, setIsClicked] = useState(false);
  const [showBubble, setShowBubble] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    playChimeSound();
    setIsClicked(true);
    setShowBubble(true);
    setTimeout(() => setIsClicked(false), 600);
    setTimeout(() => setShowBubble(false), 2600);
  };

  const isNight = timeOfDay === "night";

  // Framer Motion variants: khi sang ban đêm, mặt trăng từ dưới mọc lên trên
  const moonVariants = {
    day: {
      top: "135%",
      left: "74%",
      scale: 0.75,
      opacity: 0,
      transition: {
        duration: 2,
        ease: "easeInOut",
      },
    },
    sunset: {
      top: "135%",
      left: "74%",
      scale: 0.8,
      opacity: 0,
      transition: {
        duration: 2,
        ease: "easeInOut",
      },
    },
    night: {
      // Khi chuyển sang ban đêm: Mặt trăng từ dưới mọc lên trên
      top: "10%",
      left: "74%",
      scale: 1,
      opacity: 1,
      transition: {
        duration: 4.5, // Mọc lên êm dịu trong ~4.5 giây
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <motion.div
      variants={moonVariants}
      initial={false}
      animate={timeOfDay}
      className="absolute z-0 select-none pointer-events-auto -translate-x-1/2 -translate-y-1/2 cursor-pointer"
      onClick={handleClick}
      title="Vầng trăng dịu êm 🌙"
    >
      {/* Soft Moon Glow Aura */}
      <div
        className={`absolute inset-0 -m-6 md:-m-8 rounded-full transition-all duration-1000 pointer-events-none ${
          isNight
            ? "bg-amber-100/20 blur-2xl scale-125 animate-pulse"
            : "opacity-0"
        }`}
      />

      {/* Floating & Bobbing */}
      <motion.div
        animate={
          isClicked
            ? { scale: [1, 1.25, 0.9, 1.05, 1], rotate: [0, -10, 10, -5, 0] }
            : {
                y: isNight ? [0, -5, 0] : 0,
                rotate: isNight ? [-1.5, 1.5, -1.5] : 0,
              }
        }
        transition={
          isClicked
            ? { duration: 0.6 }
            : { duration: 5, repeat: Infinity, ease: "easeInOut" }
        }
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 flex items-center justify-center"
      >
        <img
          src="/images/moon.png"
          alt="Cute Moon with Cat"
          className="w-full h-full object-contain pointer-events-none drop-shadow-[0_0_20px_rgba(253,224,71,0.45)] drop-shadow-[0_0_40px_rgba(255,255,255,0.25)]"
        />

        {/* Interactive Speech Bubble */}
        <AnimatePresence>
          {showBubble && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: -45, scale: 1 }}
              exit={{ opacity: 0, y: -55, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="absolute pointer-events-none whitespace-nowrap bg-stone-900/90 text-amber-100 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-lg border border-amber-300/30 text-xs font-bold flex items-center gap-1.5"
            >
              <span>Chúc bạn một đêm an lành! 🌙✨</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
