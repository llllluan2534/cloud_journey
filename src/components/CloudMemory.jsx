import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCloud, FaListUl, FaLock, FaUnlock, FaSearch, FaTimes, FaMapMarkerAlt } from "react-icons/fa";
import Cloud from "./Cloud";
import MemoryModal from "./MemoryModal";
import CreateMemoryForm from "./CreateMemoryForm";
import { supabaseService } from "../utils/supabaseService";
import { playShootingStarSound } from "../utils/audioEffects";
import CuteSheep from "./CuteSheep";
import CelestialSun from "./CelestialSun";
import CelestialMoon from "./CelestialMoon";

export default function CloudMemory({ isEmbedded = false }) {
  const [memories, setMemories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedMemory, setSelectedMemory] = useState(null);
  const [editingMemory, setEditingMemory] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [lastAddedId, setLastAddedId] = useState(null);
  const containerRef = useRef(null);
  const [timeOfDay, setTimeOfDay] = useState("day");

  // UX/UI States: Search, Mood Filter, Drag Lock, and Dual-View Mode
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [moodFilter, setMoodFilter] = useState("all");
  const [isDragLocked, setIsDragLocked] = useState(true); // Default to locked on mobile to prevent touch conflict
  const [viewMode, setViewMode] = useState("sky"); // "sky" | "list"
  const [shootingStar, setShootingStar] = useState(null);
  const starTimeoutRef = useRef(null);

  // Periodic Shooting Star Effect: 5-7s flight, 10s gap between flights
  const triggerShootingStar = () => {
    if (timeOfDay !== "night") return;

    // Start completely outside the right edge (110%)
    const startX = 110;
    const startY = Math.floor(Math.random() * 15 + 12); // 12% to 27% (upper sky)
    // Drift completely past the left edge (-30%) and across the entire sky
    const endX = -30;
    const endY = startY + Math.floor(Math.random() * 18 + 18); // 30% to 50% (mid sky)
    // Thời gian bay của sao là 5 - 7 giây
    const duration = Number((Math.random() * 2 + 5).toFixed(1));

    setShootingStar({
      id: Date.now(),
      startX,
      startY,
      endX,
      endY,
      duration,
    });

    playShootingStarSound();
  };

  useEffect(() => {
    if (timeOfDay !== "night") {
      setShootingStar(null);
      if (starTimeoutRef.current) clearTimeout(starTimeoutRef.current);
      return;
    }

    // Reset any ongoing star and timer
    setShootingStar(null);
    if (starTimeoutRef.current) clearTimeout(starTimeoutRef.current);

    // First shooting star appears 1.5 seconds after entering night sky
    starTimeoutRef.current = setTimeout(triggerShootingStar, 1500);

    return () => {
      if (starTimeoutRef.current) clearTimeout(starTimeoutRef.current);
    };
  }, [timeOfDay]);

  const handleShootingStarComplete = () => {
    setShootingStar(null);
    if (timeOfDay === "night") {
      if (starTimeoutRef.current) clearTimeout(starTimeoutRef.current);
      // Mỗi lượt bay cách nhau đúng 10 giây
      starTimeoutRef.current = setTimeout(triggerShootingStar, 10000);
    }
  };

  useEffect(() => {
    // 1. Lấy dữ liệu ban đầu
    const fetchMemories = async () => {
      try {
        const data = await supabaseService.getMemories();
        setMemories(data);
      } catch (err) {
        console.error("Error fetching memories:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemories();

    // 2. Lắng nghe thay đổi Real-time
    const subscription = supabaseService.subscribeMemories(() => {
      fetchMemories(); // Refresh lại khi có thay đổi
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 17) {
      setTimeOfDay("day");
    } else if (hour >= 17 && hour < 19) {
      setTimeOfDay("sunset");
    } else {
      setTimeOfDay("night");
    }
  }, []);

  const toggleTimeOfDay = () => {
    setTimeOfDay((prev) => {
      if (prev === "day") return "sunset";
      if (prev === "sunset") return "night";
      return "day";
    });
  };

  const handleAddMemory = async (memoryData, files) => {
    try {
      if (editingMemory) {
        await supabaseService.updateMemory(editingMemory.id, memoryData, files);
        setEditingMemory(null);
      } else {
        const newDoc = await supabaseService.addMemory(memoryData, files);
        setLastAddedId(newDoc.id);
      }
      setShowForm(false);
    } catch (err) {
      console.error("Error saving memory:", err);
      alert("Không thể lưu kỷ niệm. Bạn đã tạo Table 'memories' và Storage 'love-memories' trên Supabase chưa?");
    }
  };

  const handleEditClick = (memory) => {
    setSelectedMemory(null);
    setEditingMemory(memory);
    setShowForm(true);
  };

  // Helper to determine mood of a memory
  const getMemoryMood = (memory) => {
    const rawLayer = memory.layer || "middle";
    if (rawLayer.includes("_special")) return "happy";
    if (rawLayer.includes("_rainy")) return "rainy";
    if (rawLayer.includes("_stormy")) return "stormy";
    const text = ((memory.title || "") + " " + (memory.fullStory || "")).toLowerCase();
    if (/cãi nhau|giận|dỗi|ghét|bực|bão|angry|fight|conflict|storm|hate|mad/.test(text)) return "stormy";
    if (/buồn|khóc|mưa|tiếc|đau|sầu|sad|rain|cry|tear|grief|hurt/.test(text)) return "rainy";
    return "normal";
  };

  const isFilterActive = searchKeyword.trim() !== "" || moodFilter !== "all";

  const isMemoryMatching = (memory) => {
    if (!isFilterActive) return true;

    // Mood check
    if (moodFilter !== "all") {
      const mood = getMemoryMood(memory);
      if (moodFilter === "happy") {
        if (mood === "rainy" || mood === "stormy") return false;
      } else if (moodFilter === "unhappy") {
        if (mood !== "rainy" && mood !== "stormy") return false;
      }
    }

    // Keyword check
    if (searchKeyword.trim() !== "") {
      const kw = searchKeyword.trim().toLowerCase();
      const titleMatch = (memory.title || "").toLowerCase().includes(kw);
      const storyMatch = (memory.fullStory || "").toLowerCase().includes(kw);
      const locMatch = (memory.locationName || "").toLowerCase().includes(kw);
      const dateMatch = (memory.date || "").toLowerCase().includes(kw);
      if (!titleMatch && !storyMatch && !locMatch && !dateMatch) return false;
    }

    return true;
  };

  const filteredMemories = memories.filter(isMemoryMatching);

  const skyGradients = {
    day: "from-[#60a5fa] via-[#93c5fd] to-[#bae6fd]",
    sunset: "from-[#fb923c] via-[#f472b6] to-[#a78bfa]",
    night: "from-[#0b0f19] via-[#111827] to-[#1e1b4b]",
  };

  const isNight = timeOfDay === "night";

  // --- CUSTOM COZY SKETCH SUN & MOON SVG COMPONENTS ---
  const SunSVG = ({ size = "w-10 h-10 md:w-12 md:h-12" }) => (
    <svg className={`${size} filter drop-shadow-[0_3px_6px_rgba(251,191,36,0.35)] overflow-visible`} viewBox="0 0 50 50">
      <g filter="url(#crayon-wobble-celestial)">
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const cx = 25 + 13 * Math.cos(angle);
          const cy = 25 + 13 * Math.sin(angle);
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r="6.5"
              fill="#fec051"
              stroke="#39332c"
              strokeWidth="1.2"
            />
          );
        })}
        <circle cx="25" cy="25" r="14.5" fill="#fcd34d" stroke="#39332c" strokeWidth="1.5" />
        <ellipse cx="16.5" cy="26.5" rx="2.5" ry="1.5" fill="#ffa4be" />
        <ellipse cx="33.5" cy="26.5" rx="2.5" ry="1.5" fill="#ffa4be" />
        <circle cx="13.5" cy="25.5" r="0.4" fill="#ea580c" />
        <circle cx="14.5" cy="28" r="0.4" fill="#ea580c" />
        <circle cx="35.5" cy="25.5" r="0.4" fill="#ea580c" />
        <circle cx="36.5" cy="28" r="0.4" fill="#ea580c" />
        <circle cx="20.5" cy="23.5" r="1.5" fill="#39332c" />
        <circle cx="29.5" cy="23.5" r="1.5" fill="#39332c" />
        <path d="M 23.5 25.5 Q 25 28.5 26.5 25.5" fill="none" stroke="#39332c" strokeWidth="1.8" strokeLinecap="round" />
      </g>
    </svg>
  );

  const SunsetSunSVG = ({ size = "w-10 h-10 md:w-12 md:h-12" }) => (
    <svg className={`${size} filter drop-shadow-[0_3px_6px_rgba(244,63,94,0.35)] overflow-visible`} viewBox="0 0 50 50">
      <g filter="url(#crayon-wobble-celestial)">
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const cx = 25 + 13 * Math.cos(angle);
          const cy = 25 + 13 * Math.sin(angle);
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r="6.5"
              fill="#fb923c"
              stroke="#39332c"
              strokeWidth="1.2"
            />
          );
        })}
        <circle cx="25" cy="25" r="14.5" fill="#f43f5e" stroke="#39332c" strokeWidth="1.5" />
        <ellipse cx="16.5" cy="26.5" rx="2.5" ry="1.5" fill="#f472b6" />
        <ellipse cx="33.5" cy="26.5" rx="2.5" ry="1.5" fill="#f472b6" />
        <circle cx="20.5" cy="23.5" r="1.5" fill="#39332c" />
        <circle cx="29.5" cy="23.5" r="1.5" fill="#39332c" />
        <path d="M 23.5 25.5 Q 25 28.5 26.5 25.5" fill="none" stroke="#39332c" strokeWidth="1.8" strokeLinecap="round" />
      </g>
    </svg>
  );

  const MoonSVG = ({ size = "w-10 h-10 md:w-12 md:h-12" }) => (
    <svg className={`${size} filter drop-shadow-[0_3px_8px_rgba(253,224,71,0.25)] overflow-visible`} viewBox="0 0 50 50">
      <g filter="url(#crayon-wobble-celestial)">
        <circle cx="25" cy="25" r="17.5" fill="#cfd8dc" stroke="#39332c" strokeWidth="1.5" />
        <circle cx="16" cy="15" r="3.2" fill="#b0bec5" stroke="#39332c" strokeWidth="0.8" />
        <circle cx="34" cy="18" r="2.8" fill="#b0bec5" stroke="#39332c" strokeWidth="0.8" />
        <circle cx="14" cy="30" r="2.4" fill="#b0bec5" stroke="#39332c" strokeWidth="0.8" />
        <circle cx="28" cy="36" r="3.5" fill="#b0bec5" stroke="#39332c" strokeWidth="0.8" />
        <circle cx="33" cy="29" r="2.2" fill="#b0bec5" stroke="#39332c" strokeWidth="0.8" />
        <path d="M 12 16 Q 16 10 22 10" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
        <ellipse cx="14" cy="25.5" rx="2.5" ry="1.8" fill="#ff8a80" />
        <ellipse cx="36" cy="25.5" rx="2.5" ry="1.8" fill="#ff8a80" />
        <path d="M 17 22 Q 20 25 23 22" fill="none" stroke="#39332c" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M 27 22 Q 30 25 33 22" fill="none" stroke="#39332c" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="25" cy="27" r="1.3" fill="none" stroke="#39332c" strokeWidth="1.6" />
      </g>
    </svg>
  );



  return (
    <div className={`relative w-full ${isEmbedded ? "h-full p-2 bg-transparent" : "py-8 px-3 md:px-8 bg-[#fafaf9]"}`}>
      {/* Custom Wobbly Crayon Filter for Celestial Sun & Moon */}
      <svg className="absolute w-0 h-0 pointer-events-none">
        <defs>
          <filter id="crayon-wobble-celestial" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Header Section (Only when not embedded) */}
      {!isEmbedded && (
        <div className="max-w-7xl mx-auto mb-4 md:mb-8 text-center relative flex items-center justify-center min-h-[60px] md:min-h-[80px]">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl md:text-5xl font-black text-[#39332c] drop-shadow-sm tracking-tight transition-colors duration-1000">
              CLOUD MEMORIES
            </h1>
            <p className="mt-1 text-stone-600 font-medium tracking-wide text-xs md:text-sm">
              Nơi lưu giữ những khoảnh khắc lãng mạn trên bầu trời
            </p>
          </motion.div>

          {/* Desktop Only: "+ Thêm Kỷ Niệm" on the right */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="hidden md:flex absolute right-0 md:right-4 px-6 py-3 bg-white font-black text-[#39332c] rounded-2xl shadow-md hover:bg-stone-50 transition-all items-center gap-2 border border-stone-200 text-sm"
          >
            <span className="text-xl font-black">+</span>
            <span>Thêm Kỷ Niệm</span>
          </motion.button>
        </div>
      )}

      {/* Background Sky Container */}
      <div className={`max-w-7xl mx-auto ${isEmbedded ? "h-full min-h-[580px] rounded-[2rem]" : "h-[540px] md:h-[620px] rounded-[2rem] md:rounded-[2.5rem]"} shadow-xl overflow-hidden relative border-4 border-white ring-1 ring-sky-100 bg-white transition-colors duration-1000 flex flex-col`}>

        {/* Dynamic Sky Gradient / Illustrated Backgrounds */}
        <div className={`absolute inset-0 bg-gradient-to-b ${skyGradients[timeOfDay]} transition-colors duration-1000`}>
          {/* Daytime Sky Illustrated Background */}
          <div
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 pointer-events-none ${
              timeOfDay === "day" ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage: "url('/images/day-sky-bg.jpg')",
            }}
          />

          {/* Sunset Sky Illustrated Background */}
          <div
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 pointer-events-none ${
              timeOfDay === "sunset" ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage: "url('/images/sunset-sky-bg.jpg')",
            }}
          />

          {/* Night Sky Illustrated Background */}
          <div
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 pointer-events-none ${
              isNight ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage: "url('/images/night-sky-bg.png')",
            }}
          />

          {/* Stars (Only at night) */}
          {isNight && (
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 25 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute bg-white rounded-full shadow-[0_0_2px_rgba(255,255,255,0.6)]"
                  style={{
                    width: Math.random() * 1.5 + 1 + "px",
                    height: Math.random() * 1.5 + 1 + "px",
                    top: Math.random() * 70 + "%",
                    left: Math.random() * 100 + "%",
                  }}
                  animate={{
                    opacity: [0.2, 0.9, 0.2],
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: Math.random() * 3 + 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: Math.random() * 2,
                  }}
                />
              ))}

              {/* Shooting Star (Sao băng - chỉ 1 ngôi sao duy nhất, không bóng mờ hay trùng lặp) */}
              {shootingStar && (
                <motion.div
                  key={shootingStar.id}
                  initial={{
                    left: `${shootingStar.startX}%`,
                    top: `${shootingStar.startY}%`,
                  }}
                  animate={{
                    left: `${shootingStar.endX}%`,
                    top: `${shootingStar.endY}%`,
                  }}
                  transition={{
                    duration: shootingStar.duration || 6.0,
                    ease: "linear",
                  }}
                  onAnimationComplete={handleShootingStarComplete}
                  className="absolute pointer-events-none z-20 -translate-x-1/2 -translate-y-1/2"
                >
                  <img
                    src="/images/shooting-star.png"
                    alt="Shooting Star"
                    className="w-16 h-16 md:w-24 md:h-24 object-contain select-none"
                  />
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* FLOATING GLASS TOOLBAR OVER SKY */}
        <div className="relative z-30 p-3 md:p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 pointer-events-none">
          {/* Left: View Mode Toggle & Drag Lock */}
          <div className="flex items-center justify-between md:justify-start gap-2">
            <div className="flex items-center gap-1 pointer-events-auto bg-white/85 backdrop-blur-md p-1 rounded-full shadow-sm border border-white/60">
              <button
                type="button"
                onClick={() => setViewMode("sky")}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === "sky"
                    ? "bg-[#39332c] text-white shadow-xs"
                    : "text-[#39332c]/80 hover:bg-stone-100"
                }`}
                title="Chế độ Bầu trời"
              >
                <FaCloud className="text-[11px]" />
                <span className="hidden sm:inline">Bầu trời</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === "list"
                    ? "bg-[#39332c] text-white shadow-xs"
                    : "text-[#39332c]/80 hover:bg-stone-100"
                }`}
                title="Chế độ Danh sách"
              >
                <FaListUl className="text-[11px]" />
                <span className="hidden sm:inline">Danh sách</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-200/80 text-[#39332c] font-black">
                  {filteredMemories.length}
                </span>
              </button>

              {/* Drag Lock (Only in Sky mode) */}
              {viewMode === "sky" && (
                <button
                  type="button"
                  onClick={() => setIsDragLocked(!isDragLocked)}
                  className={`px-2.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 border ${
                    isDragLocked
                      ? "bg-amber-50/90 border-amber-200 text-amber-800"
                      : "bg-emerald-50/90 border-emerald-200 text-emerald-800"
                  }`}
                  title={isDragLocked ? "Khóa mây (Bấm để mở kéo thả)" : "Đang mở kéo thả (Bấm để khóa lại)"}
                >
                  {isDragLocked ? <FaLock className="text-[9px]" /> : <FaUnlock className="text-[9px]" />}
                  <span className="hidden md:inline">{isDragLocked ? "Khóa" : "Kéo"}</span>
                </button>
              )}
            </div>

            {/* Mobile Only: Top Right Controls (Search icon, Celestial toggle, Add button) */}
            <div className="flex md:hidden items-center gap-1.5 pointer-events-auto">
              {/* Expandable Search on Mobile */}
              <div className="relative flex items-center">
                {showSearch ? (
                  <motion.div
                    initial={{ width: 40, opacity: 0 }}
                    animate={{ width: 140, opacity: 1 }}
                    exit={{ width: 40, opacity: 0 }}
                    className="flex items-center bg-white/90 backdrop-blur-md rounded-full shadow-sm border border-white/60 px-2.5 py-1"
                  >
                    <FaSearch className="text-stone-400 text-xs mr-1 shrink-0" />
                    <input
                      type="text"
                      autoFocus
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      placeholder="Tìm kiếm..."
                      className="w-full bg-transparent text-xs text-[#39332c] font-medium outline-none placeholder:text-stone-400"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSearchKeyword("");
                        setShowSearch(false);
                      }}
                      className="text-stone-400 hover:text-stone-600 text-xs ml-1"
                    >
                      <FaTimes />
                    </button>
                  </motion.div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowSearch(true)}
                    className="w-8 h-8 rounded-full bg-white/85 backdrop-blur-md border border-white/60 flex items-center justify-center text-stone-600 shadow-sm hover:bg-white transition-all relative"
                    title="Tìm kiếm kỷ niệm"
                  >
                    <FaSearch className="text-xs" />
                    {searchKeyword && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500" />
                    )}
                  </button>
                )}
              </div>

              {/* Celestial Sun/Moon Toggle Mobile */}
              <button
                type="button"
                onClick={toggleTimeOfDay}
                className="w-8 h-8 rounded-full bg-white/35 backdrop-blur-md border border-white/50 flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Đổi thời gian bầu trời"
              >
                {timeOfDay === "day" && <SunSVG size="w-6 h-6" />}
                {timeOfDay === "sunset" && <SunsetSunSVG size="w-6 h-6" />}
                {timeOfDay === "night" && <MoonSVG size="w-6 h-6" />}
              </button>

              {/* Add Memory Button Mobile */}
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="h-8 px-2.5 rounded-full bg-[#39332c] text-white text-xs font-bold shadow-md hover:bg-[#39332c]/85 transition-all flex items-center gap-1"
                title="Thêm kỷ niệm mới"
              >
                <span className="text-sm font-black">+</span>
              </button>
            </div>
          </div>

          {/* Filter Pills on Mobile: Row 2 (Centered) */}
          <div className="flex md:hidden justify-center pointer-events-auto">
            <div className="inline-flex items-center gap-1 bg-white/80 backdrop-blur-md p-1 rounded-full shadow-xs border border-white/60">
              {[
                { id: "all", label: "Tất cả" },
                { id: "happy", label: "Happy" },
                { id: "unhappy", label: "Unhappy" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMoodFilter(tab.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    moodFilter === tab.id
                      ? "bg-[#39332c] text-white shadow-xs"
                      : "text-[#39332c]/75 hover:bg-stone-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Only Right Controls: Full Search + Filter Pills + Sun/Moon */}
          <div className="hidden md:flex items-center gap-2 pointer-events-auto">
            {/* Search Input on Desktop */}
            <div className="flex items-center bg-white/85 backdrop-blur-md rounded-full shadow-sm border border-white/60 px-3 py-1.5">
              <FaSearch className="text-stone-400 text-xs mr-2" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm kỷ niệm..."
                className="w-32 lg:w-44 bg-transparent text-xs text-[#39332c] font-medium outline-none placeholder:text-stone-400"
              />
              {searchKeyword && (
                <button
                  type="button"
                  onClick={() => setSearchKeyword("")}
                  className="text-stone-400 hover:text-stone-600 text-xs ml-1"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            {/* Mood Filter Pills on Desktop */}
            <div className="flex items-center gap-1 bg-white/85 backdrop-blur-md p-1 rounded-full shadow-sm border border-white/60">
              {[
                { id: "all", label: "Tất cả" },
                { id: "happy", label: "Happy" },
                { id: "unhappy", label: "Unhappy" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMoodFilter(tab.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    moodFilter === tab.id
                      ? "bg-[#39332c] text-white shadow-xs"
                      : "text-[#39332c]/75 hover:bg-stone-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Celestial Sun/Moon Toggle Desktop */}
            <button
              type="button"
              onClick={toggleTimeOfDay}
              className="flex items-center justify-center p-1 rounded-full bg-white/35 backdrop-blur-md border border-white/50 hover:bg-white/50 hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
              title="Đổi thời gian bầu trời"
            >
              {timeOfDay === "day" && <SunSVG size="w-7 h-7 md:w-8 md:h-8" />}
              {timeOfDay === "sunset" && <SunsetSunSVG size="w-7 h-7 md:w-8 md:h-8" />}
              {timeOfDay === "night" && <MoonSVG size="w-7 h-7 md:w-8 md:h-8" />}
            </button>
          </div>
        </div>

        {/* CONTENT AREA: SKY VIEW OR TIMELINE LIST VIEW */}
        <div className={`relative flex-1 w-full h-full ${viewMode === "sky" ? "overflow-visible" : "overflow-hidden"}`}>
          {viewMode === "sky" ? (
            /* SKY VIEW */
            <div ref={containerRef} className="relative z-10 w-full h-full">
              {/* Celestial Sun (Day & Sunset with sinking animation) */}
              <CelestialSun timeOfDay={timeOfDay} />
              {/* Celestial Moon (Night with rising animation) */}
              <CelestialMoon timeOfDay={timeOfDay} />
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <p className="text-white font-bold animate-pulse">Đang tìm mây kỷ niệm...</p>
                  </div>
                </div>
              ) : (
                <AnimatePresence>
                  {memories.map((memory, index) => {
                    const matches = isMemoryMatching(memory);
                    return (
                      <Cloud
                        key={memory.id}
                        memory={memory}
                        number={memories.length - index}
                        onClick={() => setSelectedMemory(memory)}
                        containerRef={containerRef}
                        isNew={memory.id === lastAddedId}
                        isNight={isNight}
                        isDragLocked={isDragLocked}
                        isDimmed={isFilterActive && !matches}
                        isHighlighted={isFilterActive && matches}
                      />
                    );
                  })}
                </AnimatePresence>
              )}
              {/* Cute Sheep wandering on daytime meadow */}
              <CuteSheep isDay={timeOfDay === "day"} />

              {/* Bottom Cloud Texture */}
              <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white/20 to-transparent z-10 pointer-events-none" />
            </div>
          ) : (
            /* TIMELINE LIST VIEW */
            <div className="relative z-20 w-full h-full p-4 md:p-6 overflow-y-auto custom-scrollbar">
              {filteredMemories.length === 0 ? (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 bg-white/60 backdrop-blur-md rounded-3xl border border-white/60 max-w-md mx-auto">
                  <div className="text-4xl mb-2">☁️</div>
                  <p className="text-sm font-bold text-[#39332c]">Không tìm thấy kỷ niệm phù hợp</p>
                  <p className="text-xs text-stone-500 mt-1">Hãy thử xóa bộ lọc hoặc tìm với từ khóa khác nhé!</p>
                  <button
                    onClick={() => {
                      setSearchKeyword("");
                      setMoodFilter("all");
                    }}
                    className="mt-4 px-4 py-1.5 bg-[#39332c] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#39332c]/85 transition-all"
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 max-w-6xl mx-auto pb-10">
                  {filteredMemories.map((mem, index) => {
                    const mood = getMemoryMood(mem);
                    const isUnhappy = mood === "rainy" || mood === "stormy";
                    const moodBadge = isUnhappy
                      ? { text: "Unhappy", bg: "bg-blue-100 text-blue-900 border-blue-200" }
                      : { text: "Happy", bg: "bg-amber-100 text-amber-900 border-amber-200" };

                    const firstMedia = mem.media?.[0] || (mem.imageUrl ? { type: "image", url: mem.imageUrl } : null);

                    return (
                      <motion.div
                        key={mem.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        whileHover={{ y: -3, transition: { duration: 0.2 } }}
                        onClick={() => setSelectedMemory(mem)}
                        className="p-4 bg-white/90 hover:bg-white backdrop-blur-md rounded-2xl border border-stone-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${moodBadge.bg}`}>
                              {moodBadge.text}
                            </span>
                            <span className="text-[11px] font-medium text-stone-400">
                              {mem.date}
                            </span>
                          </div>
                          
                          {firstMedia && (
                            <div className="w-full h-28 mb-3 rounded-xl overflow-hidden bg-stone-100 border border-stone-200/60">
                              {firstMedia.type === "video" ? (
                                <video src={firstMedia.url} className="w-full h-full object-cover" />
                              ) : (
                                <img src={firstMedia.url} alt={mem.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              )}
                            </div>
                          )}

                          <h3 className="text-sm font-black text-[#39332c] line-clamp-1 group-hover:text-amber-900 transition-colors">
                            {mem.title}
                          </h3>
                          <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                            {mem.fullStory || mem.description}
                          </p>
                        </div>

                        {mem.locationName && (
                          <div className="mt-3 pt-2 border-t border-stone-100 flex items-center gap-1.5 text-[10px] text-stone-400 truncate">
                            <FaMapMarkerAlt className="text-rose-400 shrink-0" />
                            <span className="truncate">{mem.locationName}</span>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showForm && (
          <CreateMemoryForm
            initialData={editingMemory}
            onCreate={handleAddMemory}
            onClose={() => {
              setShowForm(false);
              setEditingMemory(null);
            }}
          />
        )}
        {selectedMemory && (
          <MemoryModal
            memory={selectedMemory}
            number={memories.length - memories.findIndex(m => m.id === selectedMemory.id)}
            onClose={() => setSelectedMemory(null)}
            onEdit={handleEditClick}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
