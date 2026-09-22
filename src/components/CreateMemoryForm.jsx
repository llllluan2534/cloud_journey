import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";

// Fix default icon for Leaflet in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

function LocationPicker({ location, setLocation, setLocationName }) {
  const markerRef = React.useRef(null);

  const eventHandlers = React.useMemo(
    () => ({
      async dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newLatLng = marker.getLatLng();
          setLocation(newLatLng);
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLatLng.lat}&lon=${newLatLng.lng}`);
            const data = await res.json();
            if (data && data.display_name) {
              setLocationName(data.display_name);
            } else {
              setLocationName("Vị trí đã chọn trên bản đồ");
            }
          } catch (err) {
            setLocationName("Vị trí đã chọn trên bản đồ");
          }
        }
      },
    }),
    [setLocation, setLocationName]
  );

  useMapEvents({
    async click(e) {
      setLocation(e.latlng);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`);
        const data = await res.json();
        if (data && data.display_name) {
          setLocationName(data.display_name);
        } else {
          setLocationName("Vị trí đã chọn trên bản đồ");
        }
      } catch (err) {
        setLocationName("Vị trí đã chọn trên bản đồ");
      }
    },
  });

  return location ? (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={location}
      ref={markerRef}
    />
  ) : null;
}

function MapUpdater({ location }) {
  const map = useMap();
  React.useEffect(() => {
    if (location) {
      map.flyTo(location, 14);
    }
  }, [location, map]);
  return null;
}

// Smart search function with multiple Vietnamese address fallbacks
async function searchAddress(query) {
  if (!query || !query.trim()) return [];

  const cleanQuery = query.trim();
  const headers = { 'User-Agent': 'LoveStoryApp/1.0' };

  // 1. Try exact query
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanQuery)}&addressdetails=1&limit=5`;
    const res = await fetch(url, { headers });
    const data = await res.json();
    if (data && data.length > 0) return data;
  } catch (e) {
    console.error("Lỗi tìm kiếm chính xác:", e);
  }

  // 2. Try fallbacks if exact query returned no results
  const fallbacks = [];

  // If query has commas, let's try removing components
  if (cleanQuery.includes(',')) {
    const parts = cleanQuery.split(',').map(p => p.trim()).filter(Boolean);

    if (parts.length >= 3) {
      // Let's remove the ward/sub-district (usually parts[1])
      const noWard = [parts[0], ...parts.slice(2)].join(', ');
      fallbacks.push(noWard);

      // Let's keep only street and city/district
      const streetAndCity = [parts[0], parts[parts.length - 2] || parts[parts.length - 1]].join(', ');
      fallbacks.push(streetAndCity);

      // Let's remove ward AND country
      if (parts.length >= 4) {
        const localNoWard = [parts[0], ...parts.slice(2, parts.length - 1)].join(', ');
        fallbacks.push(localNoWard);
      }
    }
  }

  // Fallback for house number: if query starts with numbers, let's try stripping the house number
  const houseNumberRegex = /^\d+[\/\w-]*\s+/;
  if (houseNumberRegex.test(cleanQuery)) {
    const strippedHouseNum = cleanQuery.replace(houseNumberRegex, '');
    fallbacks.push(strippedHouseNum);

    // Also try stripping house number on comma-based parts
    if (cleanQuery.includes(',')) {
      const parts = cleanQuery.split(',').map(p => p.trim()).filter(Boolean);
      const streetPartStripped = parts[0].replace(houseNumberRegex, '');

      if (parts.length >= 3) {
        const strippedWithLocal = [streetPartStripped, parts[parts.length - 2] || parts[parts.length - 1]].join(', ');
        fallbacks.push(strippedWithLocal);
      }
    }
  }

  // Remove duplicates from fallbacks
  const uniqueFallbacks = [...new Set(fallbacks)].filter(f => f !== cleanQuery);

  // Try fallbacks in order
  for (const fallbackQuery of uniqueFallbacks) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fallbackQuery)}&addressdetails=1&limit=5`;
      const res = await fetch(url, { headers });
      const data = await res.json();
      if (data && data.length > 0) {
        return data.map(item => ({ ...item, isFallback: true, fallbackQuery }));
      }
    } catch (e) {
      console.error(`Lỗi tìm kiếm fallback "${fallbackQuery}":`, e);
    }
  }

  return [];
}

export default function CreateMemoryForm({ initialData, onCreate, onClose }) {
  const [isSpecial, setIsSpecial] = useState(initialData?.layer?.endsWith("_special") || false);
  const getInitialMood = (layerStr) => {
    if (!layerStr) return "normal";
    if (layerStr.includes("_special")) return "normal";
    if (layerStr.includes("_rainy")) return "rainy";
    if (layerStr.includes("_stormy")) return "stormy";
    return "normal";
  };
  const [selectedMood, setSelectedMood] = useState(getInitialMood(initialData?.layer));
  const [title, setTitle] = useState(initialData?.title || "");
  const [date, setDate] = useState(initialData?.date || "");
  const [fullStory, setFullStory] = useState(initialData?.fullStory || "");
  const [mediaList, setMediaList] = useState(initialData?.media || (initialData?.imageUrl ? [{ type: 'image', url: initialData.imageUrl }] : []));
  const [location, setLocation] = useState(initialData?.location || null);
  const [locationName, setLocationName] = useState(initialData?.locationName || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState("");
  const fileInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !date || !fullStory) return;

    setIsSubmitting(true);
    try {
      const getBaseLayer = (layerStr) => {
        if (!layerStr) return "middle";
        return layerStr.replace("_special", "").replace("_rainy", "").replace("_stormy", "");
      };

      const baseLayer = getBaseLayer(initialData?.layer) || ["background", "middle", "foreground"][
        Math.floor(Math.random() * 3)
      ];

      let finalLayer = baseLayer;
      if (isSpecial) {
        finalLayer = `${baseLayer}_special`;
      } else if (selectedMood === "rainy") {
        finalLayer = `${baseLayer}_rainy`;
      } else if (selectedMood === "stormy") {
        finalLayer = `${baseLayer}_stormy`;
      }

      const memoryData = {
        title: title.trim(),
        date,
        fullStory,
        location,
        locationName,
        x: initialData?.x || Math.floor(Math.random() * 70) + 15,
        y: initialData?.y || Math.floor(Math.random() * 60) + 15,
        layer: finalLayer,
      };

      // onCreate now handles the Firebase logic
      await onCreate(memoryData, mediaList);
      onClose();
    } catch (error) {
      alert("Có lỗi khi lưu kỷ niệm. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isDragActive, setIsDragActive] = useState(false);

  const addFiles = (files) => {
    files.forEach((file) => {
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) return;
      const type = file.type.startsWith("video/") ? "video" : "image";
      const url = URL.createObjectURL(file);
      setMediaList((prev) => [...prev, { type, url, file }]);
    });
  };

  const handleMediaChange = (e) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const pastedFiles = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/") || items[i].type.startsWith("video/")) {
          const file = items[i].getAsFile();
          if (file) {
            pastedFiles.push(file);
          }
        }
      }

      if (pastedFiles.length > 0) {
        addFiles(pastedFiles);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, []);

  const removeMedia = (index) => {
    const item = mediaList[index];
    if (item.url && item.url.startsWith("blob:")) {
      URL.revokeObjectURL(item.url);
    }
    setMediaList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError("");
    setSearchResults([]);
    try {
      const results = await searchAddress(searchQuery);
      if (results && results.length > 0) {
        setSearchResults(results);
        // Tự động chọn kết quả đầu tiên để bay bản đồ tới, nhưng vẫn mở dropdown gợi ý để người dùng chọn cái khác nếu muốn
        const first = results[0];
        setLocation({ lat: parseFloat(first.lat), lng: parseFloat(first.lon) });
        setLocationName(first.display_name);
      } else {
        setSearchError("Không tìm thấy địa chỉ chính xác. Thử tìm theo tên đường phố hoặc khu vực gần đó nhé!");
      }
    } catch (error) {
      console.error("Lỗi tìm kiếm địa điểm:", error);
      setSearchError("Đã xảy ra lỗi khi tìm kiếm địa điểm.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLocation = (item) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    setLocation({ lat, lng: lon });
    setLocationName(item.display_name);
    setSearchResults([]); // đóng dropdown gợi ý
  };

  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState("");

  const handleNextToStep2 = () => {
    if (!title.trim()) {
      setStepError("Vui lòng nhập tiêu đề kỷ niệm!");
      return;
    }
    if (!date) {
      setStepError("Vui lòng chọn ngày diễn ra kỷ niệm!");
      return;
    }
    if (!fullStory.trim()) {
      setStepError("Hãy viết đôi dòng câu chuyện/cảm xúc nhé!");
      return;
    }
    setStepError("");
    setStep(2);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-4"
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
        className="absolute inset-0 bg-sky-900/25 backdrop-blur-md"
      />

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
        className="relative bg-white/95 backdrop-blur-2xl rounded-3xl md:rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-white/60"
      >
        {/* Decorative background glows */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-200 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-amber-200 rounded-full blur-3xl" />
        </div>

        <form onSubmit={handleSubmit} className="p-5 md:p-8 relative flex flex-col max-h-[92vh] overflow-hidden">
          {/* Header */}
          <div className="text-center mb-4">
            <h2 className="text-xl md:text-3xl font-black text-[#39332c] tracking-tight">
              {initialData ? "Chỉnh Sửa Kỷ Niệm" : "Tạo Mây Kỷ Niệm"}
            </h2>
            <p className="text-stone-500 text-xs md:text-sm font-medium mt-0.5">
              Gửi gắm khoảnh khắc lãng mạn vào bầu trời
            </p>
          </div>

          {/* STEP INDICATOR */}
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-5">
            {[
              { num: 1, label: "Cảm xúc" },
              { num: 2, label: "Ảnh & Vị trí" },
              { num: 3, label: "Xem trước" },
            ].map((s) => (
              <div key={s.num} className="flex items-center gap-1.5 md:gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (s.num === 1) setStep(1);
                    else if (s.num === 2 && title.trim() && date && fullStory.trim()) setStep(2);
                    else if (s.num === 3 && title.trim() && date && fullStory.trim()) setStep(3);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    step === s.num
                      ? "bg-[#39332c] text-white shadow-xs"
                      : step > s.num
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-stone-100 text-stone-400"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-white/20">
                    {step > s.num ? "✓" : s.num}
                  </span>
                  <span>{s.label}</span>
                </button>
                {s.num < 3 && <div className="w-3 md:w-6 h-[1.5px] bg-stone-200" />}
              </div>
            ))}
          </div>

          {/* STEP CONTENT CONTAINER */}
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-[340px]">
            <AnimatePresence mode="wait">
              {/* STEP 1: CẢM XÚC & LỜI TỰ SỰ */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#39332c] ml-1">Ngày kỷ niệm *</label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => {
                          setDate(e.target.value);
                          if (stepError) setStepError("");
                        }}
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-200 outline-none text-xs text-[#39332c]"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#39332c] ml-1">Tiêu đề khoảnh khắc *</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => {
                          setTitle(e.target.value);
                          if (stepError) setStepError("");
                        }}
                        placeholder="VD: Lần đầu đi xem phim cùng nhau..."
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-200 outline-none text-xs text-[#39332c]"
                        required
                      />
                    </div>
                  </div>

                  {/* Option for Special Cloud */}
                  <div className="flex items-center gap-3 p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl">
                    <input
                      type="checkbox"
                      id="isSpecial"
                      checked={isSpecial}
                      onChange={(e) => setIsSpecial(e.target.checked)}
                      className="w-4 h-4 rounded border-amber-300 text-amber-500 focus:ring-amber-200 cursor-pointer accent-amber-500"
                    />
                    <label htmlFor="isSpecial" className="text-xs font-bold text-amber-900 cursor-pointer select-none">
                      Mây Đặc Biệt (Cầu vồng & Ngôi sao lấp lánh ✨)
                    </label>
                  </div>

                  {/* Mood Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#39332c] ml-1 block">Cảm xúc của mây</label>
                    {isSpecial ? (
                      <div className="text-xs text-amber-800 font-bold bg-amber-100/70 px-3 py-1.5 rounded-xl border border-amber-200 inline-block">
                        Mây Vui vẻ / Lãng mạn
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "normal", label: "Bình yên", activeBg: "bg-[#39332c] text-white", inactiveBg: "bg-stone-50 border border-stone-200 text-[#39332c] hover:bg-stone-100" },
                          { id: "rainy", label: "Buồn / Mưa", activeBg: "bg-blue-600 text-white", inactiveBg: "bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100" },
                          { id: "stormy", label: "Giông bão", activeBg: "bg-zinc-800 text-white", inactiveBg: "bg-zinc-100 border border-zinc-300 text-zinc-800 hover:bg-zinc-200" },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setSelectedMood(m.id)}
                            className={`py-2 px-2 text-xs font-bold rounded-xl transition-all text-center ${
                              selectedMood === m.id ? `${m.activeBg} shadow-xs` : m.inactiveBg
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Story Textarea */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#39332c] ml-1">Câu chuyện / Cảm xúc *</label>
                    <textarea
                      value={fullStory}
                      onChange={(e) => {
                        setFullStory(e.target.value);
                        if (stepError) setStepError("");
                      }}
                      rows={5}
                      placeholder="Hôm đó đã xảy ra chuyện gì thế? Cảm xúc của bạn lúc đó như thế nào..."
                      className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-200 outline-none text-xs text-[#39332c] resize-none leading-relaxed"
                      required
                    />
                  </div>

                  {stepError && (
                    <p className="text-xs text-rose-500 font-bold bg-rose-50 p-2 rounded-lg border border-rose-200">
                      ⚠️ {stepError}
                    </p>
                  )}
                </motion.div>
              )}

              {/* STEP 2: ẢNH & ĐỊA ĐIỂM */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* Photo / Video Upload */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#39332c] ml-1 block">Hình ảnh / Video kỷ niệm</label>
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`relative w-full flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl transition-all group cursor-pointer ${
                        isDragActive
                          ? "border-amber-500 bg-amber-50/50"
                          : "border-stone-300 hover:border-stone-500 bg-stone-50/50"
                      }`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <svg className="w-6 h-6 text-stone-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-bold text-xs text-[#39332c]">
                        Chọn ảnh từ thiết bị hoặc Kéo thả / Dán (Ctrl+V) vào đây
                      </span>
                      <span className="text-[10px] text-stone-400 mt-0.5">Hỗ trợ ảnh và video</span>
                    </div>

                    {mediaList.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto py-2 custom-scrollbar">
                        {mediaList.map((media, idx) => (
                          <div key={idx} className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden shadow-xs border border-stone-200 relative group bg-stone-100">
                            {media.type === "video" ? (
                              <video src={media.url} className="w-full h-full object-cover" />
                            ) : (
                              <img src={media.url} alt="Kỷ niệm" className="w-full h-full object-cover" />
                            )}
                            <button
                              type="button"
                              onClick={() => removeMedia(idx)}
                              className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleMediaChange}
                      className="hidden"
                      ref={fileInputRef}
                    />
                  </div>

                  {/* Location Picker */}
                  <div className="space-y-1.5 relative z-20">
                    <label className="text-xs font-bold text-[#39332c] ml-1 block">📍 Đánh dấu địa điểm</label>
                    <div ref={searchContainerRef} className="relative flex gap-1.5 z-20">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          if (searchError) setSearchError("");
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchLocation())}
                        placeholder="Nhập địa chỉ (VD: Chicken Plus Q7)..."
                        className="flex-1 p-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-200 outline-none text-xs text-[#39332c]"
                      />
                      <button
                        type="button"
                        onClick={handleSearchLocation}
                        disabled={isSearching}
                        className="px-3 py-2 bg-[#39332c] text-white rounded-xl font-bold hover:bg-[#39332c]/85 transition-colors text-xs whitespace-nowrap"
                      >
                        {isSearching ? "Đang tìm..." : "Tìm"}
                      </button>

                      {/* Suggestions Dropdown */}
                      <AnimatePresence>
                        {searchResults.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute left-0 right-0 top-full mt-1 bg-white border border-stone-200 rounded-xl shadow-xl max-h-48 overflow-y-auto z-[150] custom-scrollbar"
                          >
                            {searchResults.map((item, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSelectLocation(item)}
                                className="w-full text-left p-2.5 hover:bg-stone-50 border-b border-stone-100 last:border-b-0 text-xs text-[#39332c]"
                              >
                                <span className="font-bold block truncate">{item.name || item.display_name.split(',')[0]}</span>
                                <span className="text-[10px] text-stone-400 block truncate">{item.display_name}</span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Leaflet Map */}
                    <div className="h-36 w-full rounded-xl overflow-hidden border border-stone-200 shadow-inner bg-stone-100 z-0 relative">
                      <MapContainer
                        center={[10.762622, 106.660172]}
                        zoom={12}
                        style={{ height: '100%', width: '100%' }}
                        attributionControl={false}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <MapUpdater location={location} />
                        <LocationPicker location={location} setLocation={setLocation} setLocationName={setLocationName} />
                      </MapContainer>
                    </div>

                    {location && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 ml-1 block">Tên hiển thị địa điểm:</label>
                        <input
                          type="text"
                          value={locationName}
                          onChange={(e) => setLocationName(e.target.value)}
                          placeholder="VD: Quán ăn kỷ niệm..."
                          className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-200 outline-none text-xs text-[#39332c]"
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* STEP 3: XEM TRƯỚC & THẢ MÂY */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="p-4 bg-gradient-to-b from-stone-50 to-amber-50/30 rounded-2xl border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-500">Xem trước mây kỷ niệm</span>
                      <span className="text-xs font-black text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                        {isSpecial ? "Mây đặc biệt" : selectedMood === "rainy" ? "Mây buồn" : selectedMood === "stormy" ? "Mây giận" : "Mây bình yên"}
                      </span>
                    </div>

                    <div className="border-t border-stone-200/60 pt-2">
                      <h4 className="text-base font-black text-[#39332c]">{title}</h4>
                      <p className="text-xs text-stone-500 font-medium mt-0.5">Ngày: {date}</p>
                      {locationName && (
                        <p className="text-xs text-stone-600 mt-0.5 flex items-center gap-1">
                          <span>📍</span> <span className="truncate">{locationName}</span>
                        </p>
                      )}
                      <p className="text-xs text-stone-700 mt-2 line-clamp-3 bg-white/70 p-2.5 rounded-xl border border-stone-200/50 leading-relaxed italic">
                        "{fullStory}"
                      </p>
                      {mediaList.length > 0 && (
                        <p className="text-[11px] text-stone-500 mt-2 font-bold">
                          📸 Đã đính kèm {mediaList.length} tệp hình ảnh/video
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-center p-2 bg-amber-50/60 rounded-xl border border-amber-200/50">
                    <p className="text-xs text-amber-900 font-medium">
                      ✨ Bấm <strong>"Thả lên bầu trời"</strong> để lưu giữ khoảnh khắc này mãi mãi!
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-3 mt-4 pt-3 border-t border-stone-100">
            {step === 1 && (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 p-2.5 rounded-xl font-bold text-xs text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  Để sau nhé
                </button>
                <button
                  type="button"
                  onClick={handleNextToStep2}
                  className="flex-[2] p-2.5 bg-[#39332c] text-white rounded-xl font-bold text-xs shadow-md hover:bg-[#39332c]/85 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Tiếp tục (Ảnh & Vị trí)</span>
                  <span>→</span>
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 p-2.5 rounded-xl font-bold text-xs text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  ← Quay lại
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-[2] p-2.5 bg-[#39332c] text-white rounded-xl font-bold text-xs shadow-md hover:bg-[#39332c]/85 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Tiếp tục (Xem trước)</span>
                  <span>→</span>
                </button>
              </>
            )}

            {step === 3 && (
              <>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 p-2.5 rounded-xl font-bold text-xs text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  ← Chỉnh sửa
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-[2] p-2.5 ${isSubmitting ? 'bg-stone-400' : 'bg-[#39332c]'} text-white rounded-xl font-bold text-xs shadow-md hover:bg-[#39332c]/85 transition-all flex items-center justify-center gap-1.5`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Đang bay lên mây...</span>
                    </>
                  ) : (
                    <span>Thả lên bầu trời ☁️✨</span>
                  )}
                </button>
              </>
            )}
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
