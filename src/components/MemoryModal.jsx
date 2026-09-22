import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";

// Fix default icon for Leaflet in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

export default function MemoryModal({ memory, number, onClose, onEdit }) {
  if (!memory) return null;

  const isSpecial = memory.layer?.endsWith("_special");

  const mediaItems = memory.media && memory.media.length > 0
    ? memory.media
    : (memory.imageUrl ? [{ type: "image", url: memory.imageUrl }] : []);

  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 flex items-center justify-center z-[100] p-4"
    >
      {/* Backdrop */}
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
          exit: { opacity: 0 }
        }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        onClick={onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-md"
      />

      {/* Modal Content */}
      <motion.div
        variants={{
          hidden: { scale: 0.92, opacity: 0, y: 15 },
          visible: { scale: 1, opacity: 1, y: 0 },
          exit: { scale: 0.92, opacity: 0, y: 15 }
        }}
        transition={{
          type: "spring",
          damping: 26,
          stiffness: 220
        }}
        className="relative bg-white/90 backdrop-blur-xl rounded-3xl md:rounded-[2.5rem] shadow-2xl max-w-4xl w-full overflow-hidden border border-white/50 max-h-[95vh] md:max-h-[90vh] flex flex-col"
      >
          {/* Top Cloud Decoration */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-100/50 rounded-full blur-3xl" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-100/50 rounded-full blur-3xl" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 md:top-6 md:right-6 z-10 w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition-colors text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="p-5 md:p-10 relative flex-1 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

              {/* Left Column: Media & Map */}
              <div className="space-y-4 md:space-y-6">
                {mediaItems.length > 0 && (
                  <div className="overflow-hidden rounded-2xl shadow-inner bg-stone-900 border border-stone-800 relative h-72 md:h-96 group/carousel">
                    {/* Media Display with AnimatePresence */}
                    <div className="w-full h-full flex items-center justify-center bg-stone-950/80 relative">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeIndex}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.25 }}
                          className="w-full h-full flex items-center justify-center"
                        >
                          {mediaItems[activeIndex].type === "video" ? (
                            <video
                              src={mediaItems[activeIndex].url}
                              controls
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <img
                              src={mediaItems[activeIndex].url}
                              alt={`${memory.title} - ${activeIndex}`}
                              className="w-full h-full object-contain"
                            />
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Navigation Arrows */}
                    {mediaItems.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={handlePrev}
                          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                          title="Ảnh trước"
                        >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={handleNext}
                          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                          title="Ảnh tiếp theo"
                        >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}

                    {/* Image Counter & Pagination Dots */}
                    {mediaItems.length > 1 && (
                      <div className="absolute bottom-3 left-0 right-0 z-20 flex flex-col items-center gap-1.5 pointer-events-none">
                        {/* Counter badge */}
                        <span className="px-2.5 py-0.5 bg-black/60 backdrop-blur-sm text-[10px] text-white font-bold rounded-full select-none">
                          {activeIndex + 1} / {mediaItems.length}
                        </span>
                        
                        {/* Dots */}
                        <div className="flex gap-1.5 pointer-events-auto">
                          {mediaItems.map((_, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveIndex(idx);
                              }}
                              className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                                idx === activeIndex
                                  ? "bg-white w-4"
                                  : "bg-white/40 hover:bg-white/60"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {memory.location && (
                  <div className="flex flex-col gap-2 mt-4">
                    {memory.locationName && (
                      <p className="text-sm font-bold text-[#39332c] flex items-center gap-1">
                        📍 <span className="truncate" title={memory.locationName}>{memory.locationName}</span>
                      </p>
                    )}
                    <div className="rounded-2xl overflow-hidden shadow-inner border border-gray-200 h-48 relative">
                      <MapContainer
                        center={memory.location}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                        attributionControl={false}
                        zoomControl={true}
                        dragging={true}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={memory.location} />
                      </MapContainer>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Details */}
              <div className="flex flex-col h-full">
                <div className="mb-6">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="flex items-center justify-center w-6 h-6 bg-[#39332c] text-white text-[11px] font-black rounded-full shrink-0 shadow-sm">
                      {number}
                    </span>
                    <span className="inline-block px-3 py-1 bg-[#39332c]/10 text-[#39332c] rounded-full text-xs font-bold tracking-wider uppercase">
                      {memory.date}
                    </span>
                    {isSpecial && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 border border-amber-200 text-amber-800 rounded-full text-[10px] font-black tracking-wide uppercase shrink-0 shadow-sm animate-pulse">
                        ✨ Mây Đặc Biệt
                      </span>
                    )}
                  </div>
                  <h2 className="text-3xl font-black text-[#39332c] mb-4 tracking-tight">
                    {memory.title}
                  </h2>
                  <div className="w-12 h-1 bg-[#39332c]/30 mb-6 rounded-full" />

                  <div className="prose prose-sm max-w-none text-[#39332c]/80 overflow-y-auto max-h-[40vh] pr-2 custom-scrollbar">
                    <p className="leading-relaxed text-base whitespace-pre-line font-medium">
                      {memory.fullStory}
                    </p>
                  </div>

                </div>

                <div className="mt-auto pt-6 flex gap-3 border-t border-[#39332c]/10">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(memory)}
                      className="px-6 py-3 bg-white text-[#39332c] border-2 border-[#39332c] rounded-xl font-bold hover:bg-[#39332c]/5 transition-all"
                    >
                      Chỉnh sửa
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="flex-1 px-8 py-3 bg-[#39332c] text-white rounded-xl font-bold shadow-xl shadow-[#39332c]/20 hover:scale-105 transition-transform active:scale-95"
                  >
                    Gửi vào mây trời ✨
                  </button>
                </div>
              </div>

            </div>
          </div>
        </motion.div>
    </motion.div>
  );
}
