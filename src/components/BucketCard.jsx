import React, { forwardRef } from "react";
import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";

const BucketCard = forwardRef(({
  item,
  index,
  isFlipped,
  onFlip,
  onDelete,
  onToggleComplete,
  onToggleSubItem,
  isHighlighted
}, ref) => {
  const rotation = ((index * 133) % 9) - 4;

  return (
    <div
      ref={ref}
      className={`relative w-72 md:w-80 h-[26rem] perspective-1000 transition-all duration-500 ${isHighlighted ? "scale-110 z-50" : ""}`}
      style={{
        transform: `rotate(${rotation}deg)`,
      }}
    >
      <motion.div
        initial={false}
        animate={{
          rotateY: isFlipped ? 180 : 0,
          x: isHighlighted ? [0, -5, 5, -5, 5, 0] : 0 // Shake effect if highlighted
        }}
        whileHover={{ scale: 1.02 }}
        transition={{
          rotateY: { type: "spring", stiffness: 260, damping: 20 },
          x: { duration: 0.5 }
        }}
        style={{ transformStyle: "preserve-3d" }}
        className={`w-full h-full relative cursor-pointer group ${isHighlighted ? "ring-4 ring-pink-400 rounded-2xl ring-offset-4" : ""}`}
        onClick={onFlip}
      >
        {/* Front Face */}
        <div
          className="absolute inset-0 w-full h-full bg-white p-4 rounded-2xl shadow-xl border border-gray-100"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Decorative Pin */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 z-30 pointer-events-none">
            <div className="w-full h-full bg-[#FFB7B2] rounded-full shadow-md relative">
              <div className="absolute top-1.5 left-1.5 w-2 h-2 bg-white/60 rounded-full" />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-3 bg-gray-400/50 rounded-full" />
            </div>
          </div>

          {/* Photo Area */}
          <div className="w-full h-60 bg-gray-50 flex items-center justify-center overflow-hidden rounded-xl shadow-inner border border-gray-100">
            {item.image_url ? (
              <img src={item.image_url} alt={item.text} className="w-full h-full object-cover" />
            ) : (
              <div className="text-black-200 flex flex-col items-center">
                <span className="text-3xl mb-2">📸</span>
                <span className="text-xs font-semibold uppercase tracking-widest opacity-80">Chờ có ảnh</span>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-col justify-center h-14">
            <p className="text-center text-[#39332c] font-black text-xl leading-tight px-2">
              {item.text}
            </p>
            {item.location_name && (
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">📍 {item.location_name}</span>
              </div>
            )}
          </div>

          {/* Passport Stamp */}
          {item.is_completed && (
            <motion.div
              initial={{ scale: 2, opacity: 0, rotate: 0 }}
              animate={{ scale: 1, opacity: 1, rotate: -15 }}
              className="absolute bottom-4 right-[-10px] pointer-events-none z-50 w-32"
            >
              <div className="relative aspect-[4/3] border-[2.5px] border-[#2d5a5e] rounded-sm bg-white/80 p-0.5 shadow-md">
                <div className="w-full h-full border border-[#2d5a5e] p-1 flex flex-col relative overflow-hidden text-[#2d5a5e]">
                  <div className="flex justify-between items-start px-1 pt-0.5">
                    <span className="text-[5px] font-black uppercase">boacano</span>
                    <span className="text-[7px] font-black">
                      {item.completed_at ? new Date(item.completed_at).toLocaleDateString('vi-VN').replace(/\//g, '.') : '00.00'}
                    </span>
                  </div>
                  <div className="flex-1 my-0.5 relative flex items-center justify-center overflow-hidden">
                    {(item.stamp_image_url || item.image_url) && (
                      <div className="relative w-full h-full">
                        <img
                          src={item.stamp_image_url || item.image_url}
                          className="w-full h-full object-cover"
                          style={{ filter: 'grayscale(1) brightness(1.1) contrast(1000%)', mixBlendMode: 'multiply' }}
                        />
                        <div className="absolute inset-0 bg-[#2d5a5e] mix-blend-lighten" />
                      </div>
                    )}
                  </div>
                  <div className="text-center text-[10px] font-black tracking-widest uppercase truncate px-1">
                    {item.location_name || "OUR STORY"}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Back Face */}
        <div
          className="absolute inset-0 w-full h-full bg-[#fdfdfb] p-6 rounded-2xl shadow-xl border-2 border-pink-50 flex flex-col overflow-hidden"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
            className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-red-500 hover:text-white text-gray-400 rounded-full flex items-center justify-center transition-all z-40"
          >
            <FaTimes size={12} />
          </button>

          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Checklist</h3>

          <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
            {(item.sub_items || []).map((sub, sIdx) => (
              <div
                key={sub.id || sIdx}
                className="flex items-center gap-3"
                onClick={(e) => { e.stopPropagation(); onToggleSubItem(index, sIdx); }}
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${sub.completed ? 'bg-green-500 border-green-500' : 'bg-white border-gray-200'}`}>
                  {sub.completed && <span className="text-xs text-white">✓</span>}
                </div>
                <span className={`text-sm font-bold transition-all ${sub.completed ? 'text-gray-300 line-through' : 'text-gray-700'}`}>
                  {sub.text}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleComplete(index); }}
              className={`w-full py-3 rounded-xl font-black text-xs tracking-widest border-2 transition-all ${item.is_completed ? 'border-green-200 text-green-600' : 'border-[#39332c] text-[#39332c]'}`}
            >
              {item.is_completed ? "ĐÃ HOÀN THÀNH" : "XÁC NHẬN"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
});

export default BucketCard;
