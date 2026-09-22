import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaExternalLinkAlt,
  FaExchangeAlt,
  FaCloud,
  FaImages,
  FaMapMarkedAlt,
  FaMapPin
} from "react-icons/fa";
import { supabaseService } from "../utils/supabaseService";
import CloudMemory from "../components/CloudMemory";
import Gallery from "./Gallery";
import BucketList from "./BucketList";

// ================= MINI WIDGET 1: CLOUD MEMORIES =================
function CloudMiniWidget({ memories = [], onSwap }) {
  const latestMemory = memories[0] || {
    title: "Ngày đầu tiên gặp gỡ",
    date: "2025-02-19",
    description: "Khoảnh khắc đáng nhớ nhất khi tụi mình chính thức bên nhau...",
  };

  return (
    <div className="relative overflow-hidden rounded-[2.2rem] p-6 bg-white/90 backdrop-blur-md border border-stone-200/90 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between h-full min-h-[240px]">
      {/* Subtle Warm Background Glow */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-amber-50/60 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-2xl bg-[#faf8f5] border border-stone-200/80 text-[#39332c] flex items-center justify-center shadow-2xs">
            <FaCloud size={15} />
          </span>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#39332c]">
              Đám Mây Kỷ Niệm
            </h4>
            <span className="text-[11px] font-medium text-stone-500">
              {memories.length > 0 ? `✨ ${memories.length} khoảnh khắc trên mây` : "✨ Bầu trời kỷ niệm"}
            </span>
          </div>
        </div>

        <Link
          to="/timeline"
          className="p-2 rounded-xl bg-white hover:bg-[#39332c] hover:text-white text-stone-500 border border-stone-200/80 transition-all shadow-2xs"
          title="Mở toàn bộ trang Timeline"
        >
          <FaExternalLinkAlt size={11} />
        </Link>
      </div>

      {/* Latest Memory Details (Removed circular cloud icon) */}
      <div className="relative z-10 my-2.5 bg-[#faf8f5] p-3 rounded-2xl border border-stone-200/80">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400">
            Kỷ niệm mới nhất
          </span>
          <span className="text-[10px] font-semibold text-stone-400">
            {latestMemory.date}
          </span>
        </div>
        <p className="text-sm font-black text-[#39332c] truncate">
          {latestMemory.title}
        </p>
        <p className="text-xs text-stone-500 line-clamp-1 mt-0.5 font-medium">
          {latestMemory.description || "Nhấp để khám phá khoảnh khắc này"}
        </p>
      </div>

      {/* Action Footer */}
      <div className="relative z-10 pt-3 flex items-center justify-between border-t border-stone-100">
        <button
          onClick={onSwap}
          className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#39332c] hover:bg-[#26221d] px-4 py-2 rounded-full shadow-xs transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <FaExchangeAlt size={10} />
          <span>Xem trên khung chính</span>
        </button>
        <span className="text-[10px] font-medium text-stone-400 italic">
          Bầu trời kỷ niệm
        </span>
      </div>
    </div>
  );
}

// ================= MINI WIDGET 2: GALLERY POLAROID =================
function GalleryMiniWidget({ gallery = [], onSwap }) {
  const photos = gallery.slice(0, 3).map(item => item.url);
  const samplePhotos = [
    "/images/banner.png",
    "/images/bear.png",
    "/images/banner.png",
  ];
  const displayPhotos = photos.length > 0 ? photos : samplePhotos;

  return (
    <div className="relative overflow-hidden rounded-[2.2rem] p-6 bg-white/90 backdrop-blur-md border border-stone-200/90 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between h-full min-h-[240px]">
      {/* Subtle Warm Background Glow */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-rose-50/40 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-2xl bg-[#faf8f5] border border-stone-200/80 text-[#39332c] flex items-center justify-center shadow-2xs">
            <FaImages size={15} />
          </span>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#39332c]">
              Thư Viện Thời Gian
            </h4>
            <span className="text-[11px] font-medium text-stone-500">
              {gallery.length > 0 ? `📸 ${gallery.length} khoảnh khắc lưu giữ` : "📸 Kho ảnh tình yêu"}
            </span>
          </div>
        </div>

        <Link
          to="/gallery"
          className="p-2 rounded-xl bg-white hover:bg-[#39332c] hover:text-white text-stone-500 border border-stone-200/80 transition-all shadow-2xs"
          title="Mở toàn bộ Thư viện"
        >
          <FaExternalLinkAlt size={11} />
        </Link>
      </div>

      {/* 3 Stacked Polaroid Photos with Vintage Vibe */}
      <div className="relative z-10 my-2 flex justify-center items-center h-24">
        {/* Left Polaroid */}
        <motion.div
          className="absolute w-20 h-22 bg-white p-1.5 pb-4 rounded-sm shadow-[0_6px_16px_rgba(57,51,44,0.12)] border border-stone-200/80 -rotate-8 -translate-x-7 group-hover:-translate-x-11 group-hover:-rotate-16 transition-all duration-300"
        >
          <div className="w-full h-full overflow-hidden rounded-xs bg-stone-100">
            <img
              src={displayPhotos[0]}
              alt="Polaroid 1"
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

        {/* Right Polaroid */}
        <motion.div
          className="absolute w-20 h-22 bg-white p-1.5 pb-4 rounded-sm shadow-[0_6px_16px_rgba(57,51,44,0.12)] border border-stone-200/80 rotate-8 translate-x-7 group-hover:translate-x-11 group-hover:rotate-16 transition-all duration-300"
        >
          <div className="w-full h-full overflow-hidden rounded-xs bg-stone-100">
            <img
              src={displayPhotos[2] || displayPhotos[0]}
              alt="Polaroid 3"
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

        {/* Center Polaroid (Top of stack) */}
        <motion.div
          className="absolute w-22 h-24 bg-white p-1.5 pb-5 rounded-sm shadow-[0_10px_24px_rgba(57,51,44,0.16)] border border-stone-200/90 rotate-0 z-20 group-hover:scale-105 transition-all duration-300"
        >
          {/* Vintage Kraft Washi Tape */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3.5 bg-[#e8dfd1]/80 backdrop-blur-xs rotate-1 rounded-xs border border-stone-300/60" />
          <div className="w-full h-full overflow-hidden rounded-xs bg-stone-100">
            <img
              src={displayPhotos[1] || displayPhotos[0]}
              alt="Polaroid 2"
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>
      </div>

      {/* Action Footer */}
      <div className="relative z-10 pt-3 flex items-center justify-between border-t border-stone-100">
        <button
          onClick={onSwap}
          className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#39332c] hover:bg-[#26221d] px-4 py-2 rounded-full shadow-xs transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <FaExchangeAlt size={10} />
          <span>Xem trên khung chính</span>
        </button>
        <span className="text-[10px] font-medium text-stone-400 italic">
          Xếp lớp Polaroid
        </span>
      </div>
    </div>
  );
}

// ================= MINI WIDGET 3: BUCKET LIST =================
function BucketMiniWidget({ bucketList = [], onSwap }) {
  const total = bucketList.length || 6;
  const completed = bucketList.filter(item => item.is_completed).length || 2;
  const percentage = Math.round((completed / total) * 100);

  const nextGoal = bucketList.find(item => !item.is_completed) || {
    text: "Đi du lịch Đà Lạt ngắm thông reo",
    location_name: "Đà Lạt",
  };

  return (
    <div className="relative overflow-hidden rounded-[2.2rem] p-6 bg-white/90 backdrop-blur-md border border-stone-200/90 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between h-full min-h-[240px]">
      {/* Subtle Warm Background Glow */}
      <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-amber-50/50 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-2xl bg-[#faf8f5] border border-stone-200/80 text-[#39332c] flex items-center justify-center shadow-2xs">
            <FaMapMarkedAlt size={15} />
          </span>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#39332c]">
              Bản Đồ Mơ Ước
            </h4>
            <span className="text-[11px] font-medium text-stone-500">
              {completed}/{total} mục tiêu ({percentage}%)
            </span>
          </div>
        </div>

        <Link
          to="/bucket-list"
          className="p-2 rounded-xl bg-white hover:bg-[#39332c] hover:text-white text-stone-500 border border-stone-200/80 transition-all shadow-2xs"
          title="Mở toàn bộ Bản đồ mơ ước"
        >
          <FaExternalLinkAlt size={11} />
        </Link>
      </div>

      {/* Progress Bar & Next Destination */}
      <div className="relative z-10 my-2 space-y-2.5">
        {/* Progress bar in warm theme */}
        <div>
          <div className="flex justify-between text-[10px] font-bold text-stone-500 mb-1">
            <span>Tiến độ hành trình</span>
            <span className="text-[#39332c] font-black">{percentage}%</span>
          </div>
          <div className="w-full h-2 bg-stone-200/80 rounded-full overflow-hidden p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-[#39332c] rounded-full"
            />
          </div>
        </div>

        {/* Next destination card */}
        <div className="bg-[#faf8f5] p-2.5 rounded-2xl border border-stone-200/80 flex items-center gap-2.5">
          <span className="p-2 bg-white text-[#39332c] rounded-xl text-xs shrink-0 shadow-2xs border border-stone-200/60">
            <FaMapPin />
          </span>
          <div className="min-w-0 flex-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400 block">
              Mục tiêu tiếp theo
            </span>
            <p className="text-xs font-bold text-[#39332c] truncate">
              {nextGoal.location_name ? `📍 ${nextGoal.location_name}: ` : ""}{nextGoal.text}
            </p>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="relative z-10 pt-3 flex items-center justify-between border-t border-stone-100">
        <button
          onClick={onSwap}
          className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#39332c] hover:bg-[#26221d] px-4 py-2 rounded-full shadow-xs transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <FaExchangeAlt size={10} />
          <span>Xem trên khung chính</span>
        </button>
        <span className="text-[10px] font-medium text-stone-400 italic">
          Khám phá cùng nhau
        </span>
      </div>
    </div>
  );
}

// ================= MAIN DASHBOARD COMPONENT =================
export default function Dashboard() {
  const [primary, setPrimary] = useState("timeline");
  const [memories, setMemories] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [bucketList, setBucketList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      try {
        const [mems, gals, buckets] = await Promise.allSettled([
          supabaseService.getMemories(),
          supabaseService.getGallery(),
          supabaseService.getBucketList(),
        ]);

        if (mems.status === "fulfilled" && mems.value) setMemories(mems.value);
        if (gals.status === "fulfilled" && gals.value) setGallery(gals.value);
        if (buckets.status === "fulfilled" && buckets.value) setBucketList(buckets.value);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const widgetConfig = {
    timeline: {
      label: "Đám Mây Kỷ Niệm",
      shortLabel: "Mây",
      path: "/timeline",
      renderPrimary: () => <CloudMemory isEmbedded={true} />,
    },
    gallery: {
      label: "Thư Viện Thời Gian",
      shortLabel: "Thư Viện",
      path: "/gallery",
      renderPrimary: () => <Gallery isEmbedded={true} />,
    },
    bucket: {
      label: "Bản Đồ Mơ Ước",
      shortLabel: "Mơ",
      path: "/bucket-list",
      renderPrimary: () => <BucketList isEmbedded={true} />,
    },
  };

  const allKeys = ["timeline", "gallery", "bucket"];
  const secondaries = allKeys.filter((k) => k !== primary);

  const renderMiniWidget = (key) => {
    if (key === "timeline") {
      return (
        <CloudMiniWidget
          memories={memories}
          onSwap={() => setPrimary("timeline")}
        />
      );
    }
    if (key === "gallery") {
      return (
        <GalleryMiniWidget
          gallery={gallery}
          onSwap={() => setPrimary("gallery")}
        />
      );
    }
    return (
      <BucketMiniWidget
        bucketList={bucketList}
        onSwap={() => setPrimary("bucket")}
      />
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2 md:px-4">
      {/* Mobile Tab Switcher */}
      <div className="grid grid-cols-3 md:hidden gap-1.5 mb-5 p-1 bg-white/85 backdrop-blur-md rounded-2xl border border-stone-200/80 shadow-sm w-full max-w-lg mx-auto">
        {allKeys.map((key) => {
          const active = primary === key;
          return (
            <button
              key={key}
              onClick={() => setPrimary(key)}
              className={`py-2 px-1 text-xs font-bold rounded-xl transition-all text-center flex items-center justify-center ${active
                ? "bg-[#39332c] text-white shadow-xs"
                : "text-stone-500 hover:text-stone-800"
                }`}
            >
              <span className="sm:hidden">{widgetConfig[key].shortLabel}</span>
              <span className="hidden sm:inline">{widgetConfig[key].label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Desktop 2 Columns (Col-span-7 Primary, Col-span-5 Two Mini-Widgets) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* ================= PRIMARY SPOTLIGHT VIEW ================= */}
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="lg:col-span-7 bg-white rounded-[2.5rem] shadow-lg border border-stone-200/80 overflow-hidden flex flex-col h-[680px] relative"
        >
          {/* Top Bar for Primary View */}
          <div className="px-3 sm:px-6 py-2.5 sm:py-3.5 bg-white/95 backdrop-blur-md border-b border-stone-100 flex items-center justify-between z-20 shrink-0 gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#39332c] shrink-0" />
              <span className="text-[10.5px] sm:text-xs font-black uppercase tracking-tight sm:tracking-wider text-[#39332c] whitespace-nowrap">
                {widgetConfig[primary].label}
              </span>
              <span className="text-[9px] sm:text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-bold shrink-0 whitespace-nowrap">
                Khung chính
              </span>
            </div>

            <Link
              to={widgetConfig[primary].path}
              className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-[#39332c] hover:bg-[#39332c] hover:text-white px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full border border-stone-200 transition-all shadow-2xs shrink-0 whitespace-nowrap"
              title="Mở toàn màn hình"
            >
              <span>Xem toàn màn hình</span>
              <FaExternalLinkAlt size={9} />
            </Link>
          </div>

          {/* Embedded Native Component (Without duplicate headers) */}
          <div className="flex-1 w-full h-full overflow-y-auto custom-scrollbar relative bg-[#fafaf9]">
            {widgetConfig[primary].renderPrimary()}
          </div>
        </motion.div>

        {/* ================= SECONDARY MINI WIDGETS COLUMN ================= */}
        <div className="lg:col-span-5 flex flex-col gap-6 justify-between h-auto lg:h-[680px]">
          {secondaries.map((key) => (
            <motion.div
              key={key}
              layout
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="flex-1 min-h-[220px]"
            >
              {renderMiniWidget(key)}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
