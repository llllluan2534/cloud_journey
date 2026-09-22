import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaTimes, FaPlus } from "react-icons/fa";
import { supabaseService } from "../utils/supabaseService";

export default function Gallery({ isEmbedded = false }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mediaByDate, setMediaByDate] = useState({});
  const [selectedDateStr, setSelectedDateStr] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    fetchGalleryData();
  }, []);

  const fetchGalleryData = async () => {
    setIsLoading(true);
    try {
      const data = await supabaseService.getGallery();
      // Chuyển đổi mảng phẳng thành object mediaByDate
      const grouped = data.reduce((acc, item) => {
        const dateStr = item.date;
        if (!acc[dateStr]) acc[dateStr] = [];
        acc[dateStr].push(item);
        return acc;
      }, {});
      setMediaByDate(grouped);
    } catch (err) {
      console.error("Error fetching gallery:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMediaUpload = async (e) => {
    if (!selectedDateStr) return;
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of files) {
        await supabaseService.addGalleryMedia(selectedDateStr, file);
      }
      await fetchGalleryData(); // Refresh data
    } catch (err) {
      console.error("Error uploading media:", err);
      alert("Lỗi khi tải ảnh lên. Vui lòng thử lại!");
    } finally {
      setIsUploading(false);
    }
  };

  const removeMedia = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa kỷ niệm này?")) return;
    try {
      await supabaseService.deleteGalleryMedia(id);
      await fetchGalleryData();
    } catch (err) {
      console.error("Error deleting media:", err);
    }
  };

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const monthNames = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  function handlePrevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function handleNextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function getDateString(d) {
    const pad = (n) => n.toString().padStart(2, "0");
    return `${year}-${pad(month + 1)}-${pad(d)}`;
  }

  function handleDayClick(day) {
    if (!day) return;
    setSelectedDateStr(getDateString(day));
  }

  return (
    <div className={`w-full ${isEmbedded ? "p-2 bg-transparent" : "min-h-screen bg-[#fafaf9] py-12 px-4 md:px-8"}`}>
      <div className="max-w-5xl mx-auto">
        {!isEmbedded && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-4xl md:text-5xl font-black text-[#39332c] tracking-tight">
              THƯ VIỆN THỜI GIAN
            </h1>
            <p className="mt-2 text-gray-600 font-medium tracking-wide">
              Lưu giữ từng khoảnh khắc theo dòng thời gian
            </p>
          </motion.div>
        )}

        {/* Calendar UI - Fixed Height Scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-28 px-2 md:px-4">
          <div className="bg-white rounded-[2rem] shadow-xl p-4 md:p-10 border border-gray-100">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <button
                onClick={handlePrevMonth}
                className="p-2 md:p-3 bg-gray-50 hover:bg-stone-100 rounded-full transition-colors"
              >
                <FaChevronLeft size={14} />
              </button>
              <h2 className="text-lg md:text-2xl font-bold text-gray-800">
                {monthNames[month]} - {year}
              </h2>
              <button
                onClick={handleNextMonth}
                className="p-2 md:p-3 bg-gray-50 hover:bg-stone-100 rounded-full transition-colors"
              >
                <FaChevronRight size={14} />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 md:gap-4">
              {/* Days of week */}
              {dayNames.map(d => (
                <div key={d} className="text-center font-bold text-gray-400 text-[10px] md:text-sm py-2">
                  {d}
                </div>
              ))}

              {/* Empty slots for start of month */}
              {Array(firstDay).fill(null).map((_, i) => (
                <div key={`empty-${i}`} className="h-16 md:h-32 rounded-xl md:rounded-2xl bg-gray-50/50 border border-dashed border-gray-200 opacity-50" />
              ))}

              {/* Days in month */}
              {isLoading ? (
                <div className="col-span-7 py-20 text-center text-gray-400 font-medium">Đang tải dữ liệu...</div>
              ) : Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = getDateString(day);
                const dayMedia = mediaByDate[dateStr] || [];
                const hasMedia = dayMedia.length > 0;
                const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

                return (
                  <motion.div
                    key={day}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDayClick(day)}
                    className={`
                      relative h-16 md:h-32 rounded-xl md:rounded-2xl border-2 transition-all cursor-pointer overflow-hidden group
                      ${isToday ? 'border-[#39332c] shadow-md bg-stone-50' : 'border-gray-100 bg-white hover:border-stone-200'}
                      ${hasMedia ? 'shadow-md' : 'shadow-sm'}
                    `}
                  >
                    <span className={`absolute top-2 left-2 font-bold text-sm z-10 
                    ${isToday ? 'text-pink-600 bg-white/80 backdrop-blur px-2 py-0.5 rounded-full' : 'text-gray-500 group-hover:text-pink-500'}
                  `}>
                      {day}
                    </span>

                    {/* Render thumbnail if media exists */}
                    {hasMedia ? (
                      <div className="w-full h-full">
                        {dayMedia[0].type === "video" ? (
                          <video src={dayMedia[0].url} className="w-full h-full object-cover opacity-80" />
                        ) : (
                          <img src={dayMedia[0].url} className="w-full h-full object-cover opacity-80" />
                        )}

                        {/* Badge showing count */}
                        {dayMedia.length > 1 && (
                          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-full backdrop-blur z-10">
                            +{dayMedia.length - 1}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <FaPlus className="text-gray-300 text-xl" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Upload/View Modal */}
      <AnimatePresence>
        {selectedDateStr && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDateStr(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Kỷ niệm ngày {selectedDateStr.split('-').reverse().join('/')}</h3>
                  <p className="text-sm text-gray-500">Thêm ảnh hoặc video bạn đã chụp vào ngày này</p>
                </div>
                <button
                  onClick={() => setSelectedDateStr(null)}
                  className="p-2 bg-gray-100 hover:bg-pink-100 hover:text-pink-600 rounded-full transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Add New Button */}
                  <div
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className={`aspect-square rounded-2xl border-2 border-dashed border-pink-300 bg-pink-50/50 flex flex-col items-center justify-center cursor-pointer hover:bg-pink-100/50 transition-colors group ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isUploading ? (
                      <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                          <FaPlus className="text-pink-500" />
                        </div>
                        <span className="text-pink-600 font-bold text-sm">Thêm kỷ niệm</span>
                      </>
                    )}
                  </div>

                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleMediaUpload}
                    disabled={isUploading}
                  />

                  {/* Render Media */}
                  {(mediaByDate[selectedDateStr] || []).map((media, idx) => (
                    <div key={media.id || idx} className="aspect-square rounded-2xl overflow-hidden shadow-sm relative group bg-black">
                      {media.type === "video" ? (
                        <video src={media.url} controls className="w-full h-full object-cover" />
                      ) : (
                        <img src={media.url} className="w-full h-full object-cover" />
                      )}

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeMedia(media.id);
                        }}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
