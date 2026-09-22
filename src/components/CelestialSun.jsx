import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playChimeSound } from "../utils/audioEffects";

export default function CelestialSun({ timeOfDay }) {
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

  const isSunset = timeOfDay === "sunset";
  const isDay = timeOfDay === "day";
  const isNight = timeOfDay === "night";

  // Framer Motion variants for the setting sun
  const sunVariants = {
    day: {
      top: "8%",
      left: "74%",
      scale: 1,
      opacity: 1,
      transition: {
        duration: 3,
        ease: [0.34, 1.2, 0.64, 1],
      },
    },
    sunset: {
      // Khi chuyển qua hoàng hôn: mặt trời từ trên lặn xuống lơ lửng sát chân trời, ở lại ngắm cảnh hoàng hôn (KHÔNG bị lặn mất)
      top: "58%",
      left: "68%",
      scale: 1.05,
      opacity: 1,
      transition: {
        duration: 4, // Lặn xuống sát chân trời êm dịu trong 4s
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
    night: {
      // Khi sang ban đêm: mặt trời mới lặn hẳn xuống dưới màn hình
      top: "135%",
      left: "64%",
      scale: 0.75,
      opacity: 0,
      transition: {
        duration: 2.5,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      variants={sunVariants}
      initial={false}
      animate={timeOfDay}
      className="absolute z-0 select-none pointer-events-auto -translate-x-1/2 -translate-y-1/2 cursor-pointer"
      onClick={handleClick}
      title={isSunset ? "Hoàng hôn lãng mạn 🌅" : "Ông mặt trời ấm áp ☀️"}
    >
      {/* Glow Aura behind the Sun */}
      <div
        className={`absolute inset-0 -m-6 md:-m-8 rounded-full transition-all duration-1000 pointer-events-none ${
          isSunset
            ? "bg-gradient-to-t from-orange-600/40 via-rose-500/35 to-amber-300/25 blur-2xl scale-125 animate-pulse"
            : isDay
            ? "bg-amber-300/30 blur-xl scale-110"
            : "opacity-0"
        }`}
      />

      {/* Floating & Breathing Animation */}
      <motion.div
        animate={
          isClicked
            ? { scale: [1, 1.25, 0.9, 1.05, 1], rotate: [0, -10, 10, -5, 0] }
            : {
                y: isSunset ? [0, -3, 0] : [0, -6, 0],
                rotate: isSunset ? [-0.5, 0.5, -0.5] : [-2, 2, -2],
              }
        }
        transition={
          isClicked
            ? { duration: 0.6 }
            : { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
        }
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 flex items-center justify-center"
      >
        <img
          src="/images/sun.png"
          alt="Cute Sun"
          className={`w-full h-full object-contain pointer-events-none transition-all duration-1000 ${
            isSunset
              ? "drop-shadow-[0_0_25px_rgba(249,115,22,0.9)] drop-shadow-[0_0_50px_rgba(244,63,94,0.5)] brightness-95 saturate-125"
              : "drop-shadow-[0_0_18px_rgba(251,191,36,0.5)] drop-shadow-[0_0_35px_rgba(253,224,71,0.3)]"
          }`}
        />

        {/* Interactive Speech Bubble */}
        <AnimatePresence>
          {showBubble && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: -45, scale: 1 }}
              exit={{ opacity: 0, y: -55, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="absolute pointer-events-none whitespace-nowrap bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-lg border border-amber-200 text-xs font-bold text-[#39332c] flex items-center gap-1.5"
            >
              <span>{isSunset ? "Hoàng hôn buông dịu êm... 🌅" : "Chúc bạn ngày mới ấm áp! ☀️"}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
