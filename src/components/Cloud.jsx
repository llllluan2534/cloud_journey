import React, { useState } from "react";
import { motion } from "framer-motion";
import { playChimeSound, playRainSound } from "../utils/audioEffects";

export default function Cloud({
  memory,
  number,
  onClick,
  containerRef,
  isNew,
  isNight,
  isDragLocked = false,
  isDimmed = false,
  isHighlighted = false,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Height is defined by aspect-[8/5] which perfectly bounds only the fluffy cloud body.
  // This ensures text titles are snug and numbers are perfectly centered!
  const sizeMap = {
    background: "w-[46px] md:w-[68px] opacity-85 z-10 drop-shadow-[0_3px_6px_rgba(0,0,0,0.05)]",
    middle: "w-[56px] md:w-[80px] opacity-95 z-20 drop-shadow-[0_4px_8px_rgba(0,0,0,0.06)]",
    foreground: "w-[66px] md:w-[94px] opacity-100 z-30 drop-shadow-[0_5px_10px_rgba(0,0,0,0.07)]",
  };

  const driftDistance = {
    background: 40,
    middle: 60,
    foreground: 100,
  };

  const driftDuration = {
    background: 80,
    middle: 50,
    foreground: 30,
  };

  const bobDuration = {
    background: 6,
    middle: 5,
    foreground: 4,
  };

  const rawLayer = memory.layer || "middle";
  const isSpecial = rawLayer.includes("_special");
  const isRainy = rawLayer.includes("_rainy");
  const isStormy = rawLayer.includes("_stormy");
  
  // Extract pure layer (background, middle, foreground) for sizes and floating physics
  const layer = rawLayer.replace("_special", "").replace("_rainy", "").replace("_stormy", "");

  // Determine emotional mood
  let mood = "normal";
  if (isSpecial) {
    mood = "happy";
  } else if (isRainy) {
    mood = "rainy";
  } else if (isStormy) {
    mood = "stormy";
  } else {
    // Backward compatible auto detection for old records
    const text = ((memory.title || "") + " " + (memory.fullStory || "")).toLowerCase();
    if (/cãi nhau|giận|dỗi|ghét|bực|bão|angry|fight|conflict|storm|hate|mad/.test(text)) {
      mood = "stormy";
    } else if (/buồn|khóc|mưa|tiếc|đau|sầu|sad|rain|cry|tear|grief|hurt/.test(text)) {
      mood = "rainy";
    }
  }

  // Color config for each mood cloud
  const colors = {
    happy: { fill: "#ffffff", stroke: "#39332c" },
    normal: { fill: "#ffffff", stroke: "#39332c" },
    rainy: { fill: "#b2c2d2", stroke: "#39332c" },  // Soft hand-drawn slate grey
    stormy: { fill: "#37474f", stroke: "#1c252e" }  // Rich stormy charcoal
  };

  const currentColors = colors[mood];
  const hasRain = mood === "rainy" || mood === "stormy";

  // Keep cloud within comfortable margins so rainbow and drift don't hit the container edge
  const safeY = Math.max(10, Math.min(68, typeof memory.y === "number" ? memory.y : 30));
  const safeX = Math.max(5, Math.min(88, typeof memory.x === "number" ? memory.x : 50));

  return (
    <motion.div
      className={`absolute group touch-pan-y z-20 ${isDragLocked ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"} ${
        isDimmed ? "opacity-20 pointer-events-none transition-opacity duration-500" : ""
      } ${
        isHighlighted ? "z-40 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]" : ""
      }`}
      style={{
        top: `${safeY}%`,
        left: `${safeX}%`,
      }}
      initial={isNew ? { opacity: 0, scale: 0, y: 50 } : { opacity: 0, scale: 0.5 }}
      animate={{
        opacity: isDimmed ? 0.2 : 1,
        scale: isHighlighted ? 1.15 : 1,
        y: 0,
      }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{
        type: isNew ? "spring" : "tween",
        stiffness: isNew ? 200 : undefined,
        damping: isNew ? 15 : undefined,
        duration: isNew ? undefined : 0.5,
        ease: "easeOut"
      }}
      drag={!isDragLocked}
      dragConstraints={containerRef}
      dragElastic={0.2}
      whileDrag={{ scale: 1.1, zIndex: 50 }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => {
        setTimeout(() => setIsDragging(false), 150);
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div
        animate={{
          x: [0, driftDistance[layer], 0],
          y: [0, -10, 10, 0],
        }}
        transition={{
          x: {
            duration: driftDuration[layer],
            repeat: Infinity,
            ease: "easeInOut",
          },
          y: {
            duration: bobDuration[layer],
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
        className="relative"
      >
        <div className="relative inline-block">

          {/* wobbly hand-drawn cloud SVG - aspect-[8/5] perfectly fits only the body bounds (x:10-90, y:0-50) */}
          <div
            className={`${sizeMap[layer]} aspect-[8/5] relative cursor-pointer`}
            onClick={(e) => {
              if (isDragging) return;
              if (e.detail === 0) return;
              if (hasRain) {
                playRainSound();
              } else {
                playChimeSound();
              }
              onClick();
            }}
          >
            <svg className="w-full h-full overflow-visible" viewBox="10 0 80 50">
              <defs>
                {/* Cozy crayon texture wobbly filter */}
                <filter id={`crayon-texture-${memory.id}`} x="-15%" y="-15%" width="130%" height="130%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise" />
                  <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.5" xChannelSelector="R" yChannelSelector="G" />
                </filter>
              </defs>

              {/* 1. HAPPY/SPECIAL MOOD: Top rainbow arch & twinkling stars */}
              {mood === "happy" && (
                <g filter={`url(#crayon-texture-${memory.id})`}>
                  {/* Blue Arch */}
                  <path d="M 37 8 Q 50 -10 63 8" fill="none" stroke="#55bcff" strokeWidth="4" strokeLinecap="round" />
                  {/* Purple Arch */}
                  <path d="M 40 10 Q 50 -4 60 10" fill="none" stroke="#b66bff" strokeWidth="4" strokeLinecap="round" />
                  {/* Pink Arch */}
                  <path d="M 43 12 Q 50 2 57 12" fill="none" stroke="#ff7ba9" strokeWidth="4" strokeLinecap="round" />

                  {/* Twinkling yellow stars next to the rainbow */}
                  <polygon points="66,-3 67,0 70,0 68,2 69,5 66,3 63,5 64,2 62,0 65,0" fill="#fbbf24" />
                  <polygon points="31,2 32,4 34,4 33,6 34,8 32,7 30,8 31,6 29,4 31,4" fill="#fbbf24" />
                </g>
              )}

              {/* 4. STORMY MOOD: Yellow Lightning Bolt Under the cloud */}
              {mood === "stormy" && (
                <g filter={`url(#crayon-texture-${memory.id})`}>
                  <polygon
                    points="48,46 56,46 50,58 58,58 44,78 48,62 42,62"
                    fill="#ffeb3b"
                    stroke="#1c252e"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    className="origin-top animate-pulse"
                  />
                </g>
              )}

              {/* 3 & 4. RAINY & STORMY MOODS: Wobbly hand-drawn falling drops */}
              {hasRain && (
                <g filter={`url(#crayon-texture-${memory.id})`}>
                  {/* Droplets drawn underneath */}
                  <path d="M 23 54 Q 24 57 23 59 C 22 59 22 57 23 54 Z" fill="#55bcff" />
                  <path d="M 33 60 Q 34 63 33 65 C 32 65 32 63 33 60 Z" fill="#55bcff" />
                  <path d="M 45 52 Q 46 55 45 57 C 44 57 44 55 45 52 Z" fill="#55bcff" fillOpacity="0.8" />
                  <path d="M 55 56 Q 56 59 55 61 C 54 61 54 59 55 56 Z" fill="#55bcff" fillOpacity="0.8" />
                  <path d="M 67 62 Q 68 65 67 67 C 66 67 66 63 67 62 Z" fill="#55bcff" />
                  <path d="M 77 54 Q 78 57 77 59 C 76 59 76 57 77 54 Z" fill="#55bcff" />
                </g>
              )}

              {/* Cloud Body Shape */}
              <g filter={`url(#crayon-texture-${memory.id})`}>
                {/* Silver moonlight glow outer aura when isNight (pure SVG vector strokes, no CSS filter box) */}
                {isNight && (
                  <>
                    <path
                      d="M 25 46 
                         C 13 46, 7 36, 15 26 
                         C 9 14, 23 6, 33 11 
                         C 40 1,  58 1,  65 11 
                         C 75 6,  89 14, 83 26 
                         C 91 36, 85 46, 75 46 
                         C 70 48, 30 48, 25 46 Z"
                      fill="none"
                      stroke="#bae6fd"
                      strokeWidth="6.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.35"
                    />
                    <path
                      d="M 25 46 
                         C 13 46, 7 36, 15 26 
                         C 9 14, 23 6, 33 11 
                         C 40 1,  58 1,  65 11 
                         C 75 6,  89 14, 83 26 
                         C 91 36, 85 46, 75 46 
                         C 70 48, 30 48, 25 46 Z"
                      fill="none"
                      stroke="#e0f2fe"
                      strokeWidth="4.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.65"
                    />
                  </>
                )}

                <path
                  d="M 25 46 
                     C 13 46, 7 36, 15 26 
                     C 9 14, 23 6, 33 11 
                     C 40 1,  58 1,  65 11 
                     C 75 6,  89 14, 83 26 
                     C 91 36, 85 46, 75 46 
                     C 70 48, 30 48, 25 46 Z"
                  fill={currentColors.fill}
                  stroke={isNight ? "#93c5fd" : currentColors.stroke}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* --- FACES ON CLOUDS --- */}

                {/* A. HAPPY MOOD FACE */}
                {mood === "happy" && (
                  <>
                    {/* Smiling closed eye arcs */}
                    <path d="M 38 27 Q 42 23 46 27" fill="none" stroke="#39332c" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M 54 27 Q 58 23 62 27" fill="none" stroke="#39332c" strokeWidth="2.5" strokeLinecap="round" />

                    {/* Joyful open mouth laughing */}
                    <path d="M 45 32 Q 50 38 55 32 Z" fill="#39332c" stroke="#39332c" strokeWidth="1" />
                    <path d="M 47 34 Q 50 37 53 34 Z" fill="#ffa4be" />

                    {/* Pink cheeks */}
                    <ellipse cx="33" cy="30" rx="4.2" ry="2" fill="#ffa4be" opacity="0.9" />
                    <ellipse cx="67" cy="30" rx="4.2" ry="2" fill="#ffa4be" opacity="0.9" />
                  </>
                )}

                {/* B. NORMAL MOOD FACE */}
                {mood === "normal" && (
                  <>
                    {/* Peaceful circular eyes */}
                    <circle cx="42" cy="27" r="2" fill="#39332c" />
                    <circle cx="58" cy="27" r="2" fill="#39332c" />

                    {/* Soft smiling mouth */}
                    <path d="M 47 33 Q 50 36 53 33" fill="none" stroke="#39332c" strokeWidth="2.2" strokeLinecap="round" />

                    {/* Soft pink cheeks */}
                    <ellipse cx="33" cy="30" rx="4" ry="1.8" fill="#ffa4be" opacity="0.85" />
                    <ellipse cx="67" cy="30" rx="4" ry="1.8" fill="#ffa4be" opacity="0.85" />
                  </>
                )}

                {/* C. RAINY MOOD FACE */}
                {mood === "rainy" && (
                  <>
                    {/* Sleepy melancholic eyes (closed downward arcs) */}
                    <path d="M 38 27 Q 42 30 46 27" fill="none" stroke="#39332c" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M 54 27 Q 58 30 62 27" fill="none" stroke="#39332c" strokeWidth="2.5" strokeLinecap="round" />

                    {/* Sleepy / flat mouth */}
                    <path d="M 47 34 L 53 34" stroke="#39332c" strokeWidth="2.2" strokeLinecap="round" />

                    {/* Darker cheeks */}
                    <ellipse cx="33" cy="30" rx="4" ry="2" fill="#e27a96" opacity="0.85" />
                    <ellipse cx="67" cy="30" rx="4" ry="2" fill="#e27a96" opacity="0.85" />
                  </>
                )}

                {/* D. STORMY MOOD FACE */}
                {mood === "stormy" && (
                  <>
                    {/* Angry slanted white eyes with dark pupils */}
                    <circle cx="41" cy="27" r="3.2" fill="#ffffff" stroke="#1c252e" strokeWidth="1" />
                    <circle cx="41" cy="27" r="1.3" fill="#1c252e" />
                    <path d="M 35 22 L 43 25" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />

                    <circle cx="59" cy="27" r="3.2" fill="#ffffff" stroke="#1c252e" strokeWidth="1" />
                    <circle cx="59" cy="27" r="1.3" fill="#1c252e" />
                    <path d="M 65 22 L 57 25" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />

                    {/* Frowning angry mouth */}
                    <path d="M 46 36 Q 50 32 54 36" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                  </>
                )}

              </g>
            </svg>
          </div>

          {/* Dynamic Rain Droplets animation cascading down under the cloud (Rainy & Stormy only) */}
          {hasRain && (
            <div className="absolute top-[85%] left-0 right-0 h-7 pointer-events-none overflow-hidden z-0">
              {Array.from({ length: 4 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-[1.2px] h-2 bg-sky-300/40 rounded-full"
                  style={{
                    left: `${20 + i * 20}%`,
                    top: 0,
                  }}
                  animate={{
                    y: [0, 18],
                    opacity: [0, 0.8, 0],
                  }}
                  transition={{
                    duration: 0.8 + Math.random() * 0.4,
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          )}

        </div>

        {/* Snug Floating Title Label positioned exactly below the cloud belly (hover-only on true desktop screens to avoid sticky states on mobile) */}
        <div
          className="absolute top-[90%] left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 bg-white/60 backdrop-blur-md border border-white/60 rounded-full opacity-0 [@media(hover:hover)]:group-hover:opacity-100 transition-all duration-300 transform translate-y-1 [@media(hover:hover)]:group-hover:translate-y-0 z-50 shadow-sm cursor-pointer hover:bg-white/80"
          onClick={(e) => {
            e.stopPropagation();
            if (isDragging) return;
            onClick();
          }}
        >
          <span className="text-[11px] md:text-xs font-bold text-[#39332c] drop-shadow-sm whitespace-nowrap flex items-center gap-1">
            {mood === "happy" && <span className="text-sky-500 animate-pulse"></span>}
            {mood === "stormy" && <span className="text-yellow-500 animate-pulse"></span>}
            {mood === "rainy" && <span className="text-blue-400 animate-pulse"></span>}
            {memory.title}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
