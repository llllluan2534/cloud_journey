import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaMapMarkedAlt } from "react-icons/fa";
import { supabaseService } from "../utils/supabaseService";
import LoveMap from "../components/LoveMap";
import BucketCard from "../components/BucketCard";

const LOCATIONS = {
  "Ha Noi": [21.0285, 105.8542],
  "Ho Chi Minh": [10.8231, 106.6297],
  "Sai Gon": [10.8231, 106.6297],
  "Da Nang": [16.0471, 108.2062],
  "Hue": [16.4637, 107.5908],
  "Da Lat": [11.9404, 108.4583],
  "Nha Trang": [12.2451, 109.1943],
  "Phu Quoc": [10.2899, 103.9840],
  "Sapa": [22.3364, 103.8438],
  "Ha Long": [20.9501, 107.0733],
  "Vung Tau": [10.3460, 107.0843],
  "Can Tho": [10.0333, 105.7833],
  "Hoi An": [15.8801, 108.3380],
  "Phan Thiet": [10.9275, 108.1000],
  "Mui Ne": [10.9443, 108.2871],
  "Quy Nhon": [13.7767, 109.2243],
  "Tuy Hoa": [13.0950, 109.3000],
  "Phu Yen": [13.0950, 109.3000],
  "Pleiku": [13.9833, 108.0000],
  "Gia Lai": [13.9833, 108.0000],
  "Buon Ma Thuot": [12.6667, 108.0500],
  "Dak Lak": [12.6667, 108.0500],
  "Kon Tum": [14.3500, 108.0000],
  "Dak Nong": [12.0000, 107.6833],
  "Rach Gia": [10.0167, 105.0833],
  "Kien Giang": [10.0167, 105.0833],
  "Ca Mau": [9.1833, 105.1500],
  "Bac Lieu": [9.2833, 105.7167],
  "Soc Trang": [9.6000, 105.9667],
  "Ben Tre": [10.2333, 106.3833],
  "My Tho": [10.3500, 106.3500],
  "Tien Giang": [10.3500, 106.3500],
  "Long An": [10.5333, 106.4167],
  "Tay Ninh": [11.3000, 106.1000],
  "Dong Nai": [10.9500, 106.8167],
  "Bien Hoa": [10.9500, 106.8167],
  "Binh Duong": [10.9833, 106.6500],
  "Thu Dau Mot": [10.9833, 106.6500],
  "Binh Phuoc": [11.5333, 106.8833],
  "Binh Thuan": [10.9275, 108.1000],
  "Ninh Thuan": [11.5667, 108.9833],
  "Phan Rang": [11.5667, 108.9833],
  "Quang Ngai": [15.1167, 108.8000],
  "Quang Nam": [15.5500, 108.3333],
  "Tam Ky": [15.5500, 108.3333],
  "Quang Tri": [16.7500, 107.2000],
  "Dong Ha": [16.8333, 107.1000],
  "Quang Binh": [17.4833, 106.6000],
  "Dong Hoi": [17.4833, 106.6000],
  "Ha Tinh": [18.3333, 105.9000],
  "Nghe An": [18.6667, 105.6667],
  "Vinh": [18.6667, 105.6667],
  "Thanh Hoa": [19.8000, 105.7667],
  "Ninh Binh": [20.2500, 105.9667],
  "Nam Dinh": [20.4167, 106.1667],
  "Thai Binh": [20.4500, 106.3333],
  "Hai Duong": [20.9333, 106.3167],
  "Hai Phong": [20.8561, 106.6822],
  "Quang Ninh": [20.9501, 107.0733],
  "Lang Son": [21.8500, 106.7500],
  "Cao Bang": [22.6667, 106.2500],
  "Ha Giang": [22.8167, 104.9833],
  "Lao Cai": [22.4833, 103.9667],
  "Yen Bai": [21.7000, 104.8667],
  "Tuyen Quang": [21.8167, 105.2167],
  "Phu Tho": [21.3167, 105.2167],
  "Viet Tri": [21.3167, 105.2167],
  "Vinh Phuc": [21.3000, 105.6000],
  "Bac Ninh": [21.1833, 106.0667],
  "Bac Giang": [21.2667, 106.2000],
  "Thai Nguyen": [21.5833, 105.8333],
  "Son La": [21.3333, 103.9167],
  "Dien Bien": [21.3833, 103.0167],
  "Lai Chau": [22.4000, 103.4500],
  "Hoa Binh": [20.8167, 105.3333],
  "An Giang": [10.5333, 105.1167],
  "Long Xuyen": [10.3833, 105.4167],
  "Chau Doc": [10.7000, 105.1167],
  "Tri Ton": [10.4000, 105.0000],
  "Moc Chau": [20.8500, 104.6500],
  "Vinpearl": [12.2451, 109.1943],
  "Nui Ba Den": [11.3853, 106.1300],
};

const normalizeText = (text) => 
  text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const getCoords = (text) => {
  const normalizedSearch = normalizeText(text);
  for (let key in LOCATIONS) {
    if (normalizedSearch.includes(normalizeText(key))) return LOCATIONS[key];
  }
  return null;
};

export default function BucketList({ isEmbedded = false }) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newGoal, setNewGoal] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newSubItems, setNewSubItems] = useState([]);
  const [newSubItemText, setNewSubItemText] = useState("");
  const [newImageFile, setNewImageFile] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState(null);
  const [completingItem, setCompletingItem] = useState(null);
  const [stampFile, setStampFile] = useState(null);
  const [stampPreview, setStampPreview] = useState(null);
  const fileInputRef = useRef(null);
  const stampInputRef = useRef(null);
  
  const [flippedId, setFlippedId] = useState(null);
  const [highlightedId, setHighlightedId] = useState(null);
  const cardRefs = useRef({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await supabaseService.getBucketList();
      setItems(data);
    } catch (err) {
      console.error("Error fetching bucket list:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinClick = (id) => {
    const el = cardRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedId(id);
      setFlippedId(null); // Ensure front side is showing
      setTimeout(() => setHighlightedId(null), 3000); // Remove highlight after 3s
    }
  };

  const handleCardClick = (id) => {
    setFlippedId(flippedId === id ? null : id);
  };

  const toggleComplete = async (index) => {
    const item = items[index];
    if (!item.is_completed) {
      setCompletingItem({ ...item, index });
      return;
    }
    const newItems = [...items];
    newItems[index].is_completed = false;
    newItems[index].completed_at = null;
    newItems[index].stamp_image_url = null;
    setItems(newItems);
    try {
      await supabaseService.toggleBucketItem(item.id, false);
    } catch (err) {
      fetchData();
    }
  };

  const handleConfirmCompletion = async () => {
    if (!completingItem) return;
    setIsLoading(true);
    try {
      const { completedAt, stampImageUrl } = await supabaseService.toggleBucketItem(
        completingItem.id, true, stampFile
      );
      const newItems = [...items];
      newItems[completingItem.index].is_completed = true;
      newItems[completingItem.index].completed_at = completedAt;
      if (stampImageUrl) newItems[completingItem.index].stamp_image_url = stampImageUrl;
      setItems(newItems);
      setCompletingItem(null);
      setStampFile(null);
      setStampPreview(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSubItem = async (itemIndex, subItemIndex) => {
    const newItems = [...items];
    const item = newItems[itemIndex];
    const subItems = [...(item.sub_items || [])];
    subItems[subItemIndex].completed = !subItems[subItemIndex].completed;
    item.sub_items = subItems;
    setItems(newItems);
    try {
      await supabaseService.updateBucketSubItems(item.id, subItems);
    } catch (err) { console.error(err); }
  };

  const handleAddSubItem = () => {
    if (!newSubItemText.trim()) return;
    setNewSubItems([...newSubItems, { id: Date.now().toString(), text: newSubItemText.trim(), completed: false }]);
    setNewSubItemText("");
  };

  const handleDeleteBucketItem = async (id) => {
    if (!window.confirm("Xóa mục tiêu này?")) return;
    try {
      await supabaseService.deleteBucketItem(id);
      setItems(items.filter(item => item.id !== id));
    } catch (err) { console.error(err); }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newGoal) return;
    setIsLoading(true);
    try {
      await supabaseService.addBucketItem(newGoal, newImageFile, newSubItems, newLocation);
      fetchData();
      setNewGoal(""); 
      setNewLocation("");
      setNewSubItems([]); 
      setNewImageFile(null); 
      setNewImagePreview(null); 
      setShowForm(false);
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  };

  return (
    <div className={`w-full ${isEmbedded ? "p-2 bg-transparent" : "min-h-screen bg-[#fafaf9] py-16 px-4 md:px-12 relative overflow-hidden"}`}>
      {/* Decorative BG */}
      {!isEmbedded && (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-pink-100 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-0 w-80 h-80 bg-sky-100 rounded-full blur-3xl" />
        </div>
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        {!isEmbedded && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-black text-[#39332c] tracking-tight uppercase">Our Bucket List</h1>
            <p className="mt-2 text-gray-500 font-medium italic">Hành trình khám phá thế giới cùng nhau</p>
          </motion.div>
        )}

        {/* Map Integration */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-20"
        >
          <LoveMap 
            items={items} 
            getCoords={getCoords} 
            onPinClick={handlePinClick} 
          />
        </motion.div>

        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-black text-[#39332c] uppercase flex items-center gap-3">
            <span className="p-2 bg-white rounded-xl shadow-sm">📍</span>
            Các mục tiêu
          </h2>
          <button
            className="px-6 py-3 bg-[#39332c] text-white font-bold rounded-2xl shadow-lg hover:scale-105 transition-all flex items-center gap-2"
            onClick={() => setShowForm(true)}
          >
            <span className="text-xl">+</span> Ghim mơ ước
          </button>
        </div>

        {isLoading && items.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-10 md:gap-14 pb-20">
            <AnimatePresence>
              {items.map((item, index) => (
                <BucketCard
                  key={item.id}
                  ref={el => cardRefs.current[item.id] = el}
                  item={item}
                  index={index}
                  isFlipped={flippedId === item.id}
                  isHighlighted={highlightedId === item.id}
                  onFlip={() => handleCardClick(item.id)}
                  onDelete={handleDeleteBucketItem}
                  onToggleComplete={toggleComplete}
                  onToggleSubItem={toggleSubItem}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-white p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl">
              <h2 className="text-2xl font-black text-center mb-6">Thêm Mơ Ước</h2>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-stone-400 mb-2 block">Tên mục tiêu</label>
                  <input
                    type="text"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    placeholder="Ví dụ: Đi du lịch..."
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-stone-200 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-stone-400 mb-2 block">Địa điểm (Để cắm Pin lên bản đồ)</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Ví dụ: Đà Lạt, Nha Trang, Sapa..."
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-stone-200 transition-all"
                  />
                </div>
                <div>
                  <div className="flex gap-2 mb-2">
                    <input type="text" value={newSubItemText} onChange={(e) => setNewSubItemText(e.target.value)} placeholder="Điểm nhỏ..." className="flex-1 p-3 bg-gray-50 border rounded-xl" />
                    <button type="button" onClick={handleAddSubItem} className="px-4 bg-[#39332c] text-white rounded-xl">+</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newSubItems.map(s => <span key={s.id} className="text-xs bg-stone-100 px-2 py-1 rounded-lg">{s.text}</span>)}
                  </div>
                </div>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full p-4 border-2 border-dashed rounded-2xl text-gray-400 font-bold">
                  {newImageFile ? "Đã chọn ảnh ✅" : "Chọn ảnh minh họa"}
                </button>
                <input type="file" ref={fileInputRef} onChange={(e) => {
                  const f = e.target.files[0];
                  if (f) { setNewImageFile(f); setNewImagePreview(URL.createObjectURL(f)); }
                }} className="hidden" />
                <button type="submit" className="w-full p-4 bg-[#39332c] text-white rounded-2xl font-bold shadow-xl">Ghim Bucket</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Stamp Modal */}
      <AnimatePresence>
        {completingItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setCompletingItem(null)} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden">
              <h2 className="text-xl font-black text-center mb-6 uppercase tracking-tighter">Đóng dấu hành trình</h2>
              <div onClick={() => stampInputRef.current?.click()} className="w-full aspect-video border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-stone-50 overflow-hidden">
                {stampPreview ? <img src={stampPreview} className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-gray-400">Tải ảnh check-in...</span>}
              </div>
              <input type="file" capture="environment" accept="image/*" ref={stampInputRef} onChange={(e) => {
                const f = e.target.files[0];
                if (f) { setStampFile(f); setStampPreview(URL.createObjectURL(f)); }
              }} className="hidden" />
              <div className="flex gap-4 mt-8">
                <button onClick={() => setCompletingItem(null)} className="flex-1 py-4 bg-gray-100 rounded-2xl font-bold">Hủy</button>
                <button onClick={handleConfirmCompletion} className="flex-[2] py-4 bg-[#39332c] text-white rounded-2xl font-bold shadow-lg">Xác nhận</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
