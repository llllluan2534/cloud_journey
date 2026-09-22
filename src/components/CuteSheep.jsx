import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { playSheepSound } from "../utils/audioEffects";

// Each sheep:
//  Phase "enter"  → walk from edge to a random stop spot in the meadow
//  Phase "pause"  → stand still ~5s, keep same direction
//  Phase "exit"   → continue walking the SAME direction off the opposite edge

function SingleSheep({ sheep }) {
  const [phase, setPhase] = useState("enter");
  const [isInteracting, setIsInteracting] = useState(false);
  const phaseTimer = useRef(null);

  useEffect(() => {
    if (phase === "enter") {
      // After walking into the stop spot, hold still for 5s
      phaseTimer.current = setTimeout(() => {
        setPhase("pause");
      }, (sheep.delay + sheep.entryDuration) * 1000);
    } else if (phase === "pause") {
      // After 5s pause, continue walking out
      phaseTimer.current = setTimeout(() => {
        setPhase("exit");
      }, 5000);
    }
    return () => {
      if (phaseTimer.current) clearTimeout(phaseTimer.current);
    };
  }, [phase]);

  const handleSheepClick = (e) => {
    e.stopPropagation();
    playSheepSound();
    setIsInteracting(true);
    setTimeout(() => setIsInteracting(false), 800);
  };

  // Target position for current phase
  const targetLeft =
    phase === "enter" || phase === "pause" ? sheep.stopLeft : sheep.endLeft;

  return (
    <motion.div
      initial={{ left: sheep.startLeft }}
      animate={{ left: targetLeft }}
      transition={{
        duration: phase === "enter" ? sheep.entryDuration : phase === "pause" ? 0 : sheep.exitDuration,
        delay: phase === "enter" ? sheep.delay : 0,
        ease: "linear",
      }}
      className="absolute z-20 pointer-events-none select-none"
      style={{ bottom: `${sheep.bottomOffset}px` }}
    >
      <div className="relative pointer-events-auto">
        <motion.div
          onClick={handleSheepClick}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          animate={
            isInteracting
              ? {
                  y: [-4, -18, 0],
                  scale: [1, 1.18, 1],
                  transition: { duration: 0.5, ease: "easeOut" },
                }
              : phase === "pause"
              ? {
                  // Gentle idle sway while standing still
                  y: [0, -2, 0],
                  rotate: [0, 1, 0, -1, 0],
                  transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                }
              : {
                  // Bouncy walk — direction stays the SAME for all phases
                  y: [0, -5, 0, -5, 0],
                  rotate: sheep.facingRight ? [-2, 2, -2] : [2, -2, 2],
                  transition: {
                    duration: 0.58 + (sheep.id % 5) * 0.04,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }
          }
          className="cursor-pointer group relative"
          title="Nhấp vào chú cừu nha! 🐑"
        >
          {/* Meadow Shadow */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 md:w-16 h-2 bg-emerald-950/20 rounded-full blur-[2px] pointer-events-none" />

          {/* Sheep Image — direction NEVER changes (no turn-around) */}
          <div
            className="inline-block"
            style={{
              // Original sheep.png faces LEFT.
              // When going RIGHT (facingRight=true): flip with scaleX(-1)
              // When going LEFT  (facingRight=false): keep scaleX(1)
              transform: `scaleX(${sheep.facingRight ? -1 : 1}) scale(${sheep.scale})`,
            }}
          >
            <img
              src="/images/sheep.png"
              alt="Chú cừu nhỏ trên bãi cỏ"
              className="w-14 h-auto md:w-20 object-contain drop-shadow-sm select-none"
              draggable={false}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function createSheep(index, timestamp) {
  // Each sheep individually picks its own entry side
  const facingRight = Math.random() < 0.5; // true = enters from LEFT, exits RIGHT

  const startLeft = facingRight ? "-18%" : "115%";
  const endLeft   = facingRight ? "115%"  : "-18%"; // exits the OPPOSITE side (straight through)

  // Random stop position between 18% and 74%
  const stopPct  = Math.floor(18 + Math.random() * 56);
  const stopLeft = `${stopPct}%`;

  // Walk speed: full 133% range in ~16s → speed ~8.3%/s
  const speed        = 8.3;
  const entryDist    = facingRight ? stopPct + 18 : 115 - stopPct;
  const exitDist     = facingRight ? 115 - stopPct : stopPct + 18;
  const entryDuration = Math.max(3, entryDist / speed + Math.random() * 1.5);
  const exitDuration  = Math.max(3, exitDist  / speed + Math.random() * 1.5);

  return {
    id:           timestamp + index,
    facingRight,
    startLeft,
    stopLeft,
    endLeft,
    entryDuration,
    exitDuration,
    scale:        Number((0.82 + Math.random() * 0.28).toFixed(2)),
    bottomOffset: Math.floor(10 + (index % 3) * 7 + Math.random() * 5),
    delay:        index * (1.4 + Math.random() * 0.8),
  };
}

export default function CuteSheep({ isDay = true }) {
  const [flock, setFlock] = useState([]);
  const timerRef = useRef(null);

  const spawnFlock = () => {
    const count    = Math.floor(Math.random() * 4) + 1;
    const now      = Date.now();
    const newFlock = Array.from({ length: count }, (_, i) => createSheep(i, now));

    setFlock(newFlock);

    // Wait until every sheep fully exits (delay + enter + 5s pause + exit), then add a 5s gap
    const maxTime = Math.max(
      ...newFlock.map((s) => s.delay + s.entryDuration + 5 + s.exitDuration)
    );
    timerRef.current = setTimeout(spawnFlock, (maxTime + 5) * 1000);
  };

  useEffect(() => {
    if (!isDay) {
      setFlock([]);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    // 5-second warm-up before the first flock
    timerRef.current = setTimeout(spawnFlock, 5000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isDay]);

  if (!isDay) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 pointer-events-none z-20">
      {flock.map((sheep) => (
        <SingleSheep key={sheep.id} sheep={sheep} />
      ))}
    </div>
  );
}
