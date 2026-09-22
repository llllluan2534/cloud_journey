import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import LoveCounter from "./LoveCounter";
import messageData from "../data/messages.json";

const labels = [
  "How we know about each other",
  "First Message",
  "Until one day in October",
  "And then",
  "Finally",
];

export default function Journey() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const navigate = useNavigate();

  const nextStep = () => {
    if (activeIndex < labels.length - 1) {
      setDirection(1);
      setActiveIndex((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (activeIndex > 0) {
      setDirection(-1);
      setActiveIndex((prev) => prev - 1);
    }
  };

  const goToStep = (index) => {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  };

  const handleDragEnd = (e, { offset }) => {
    const swipeThreshold = 40;
    if (offset.x < -swipeThreshold) {
      nextStep();
    } else if (offset.x > swipeThreshold) {
      prevStep();
    }
  };

  const octoberLines = messageData.october ? messageData.october.split("\n") : [];

  // Content for each step matching original desktop version exactly, optimized for mobile height
  const contents = [
    // === Content 0: How we know about each other ===
    <p key="0" className="whitespace-pre-line text-xs md:text-base leading-relaxed text-stone-700 font-medium text-left">
      {messageData.intro}
    </p>,

    // === Content 1: First Message ===
    <div key="1" className="w-full text-left space-y-2 md:space-y-3">
      {messageData.messages.map((msg, index) => (
        <div key={index} className="space-y-1">
          {/* Label & Timestamp in one compact row on mobile */}
          <div className={`flex items-center justify-between text-[11px] md:text-xs font-bold text-stone-500 px-1 ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"
            }`}>
            <span className="text-[#39332c] font-black">{msg.label}</span>
            <span className="text-stone-400 text-[10px]">{msg.timestamp}</span>
          </div>

          {/* Name tag */}
          <div className={`text-[10px] md:text-xs text-stone-400 font-semibold px-1 ${index % 2 === 0 ? "text-left" : "text-right"
            }`}>
            {msg.name}
          </div>

          {/* Message bubble */}
          <div className={`flex ${index % 2 === 0 ? "justify-start" : "justify-end"}`}>
            <div className={`px-3.5 py-2 md:px-4 md:py-2.5 rounded-xl md:rounded-2xl shadow-2xs max-w-[90%] md:max-w-md border border-stone-200/80 ${index % 2 === 0
                ? "bg-[#faf8f5] text-stone-800 rounded-tl-xs"
                : "bg-[#39332c] text-white rounded-tr-xs"
              }`}>
              <p className={`text-xs md:text-sm font-medium ${index % 2 === 0 ? "text-stone-800" : "text-white"}`}>
                {msg.text}
              </p>
            </div>
          </div>

          {/* Line separator after first message */}
          {index === 0 && (
            <div className="pt-1.5 pb-0.5">
              <div className="h-[1px] bg-stone-200 w-full"></div>
            </div>
          )}
        </div>
      ))}

      {messageData.quote && (
        <div className="bg-[#faf8f5] p-2.5 md:p-3 rounded-xl border border-stone-200/70 text-center mt-2">
          <p className="italic text-[11px] md:text-xs text-stone-600 font-medium">
            "{messageData.quote}"
          </p>
        </div>
      )}
    </div>,

    // === Content 2: Until one day in October ===
    <div key="2" className="whitespace-pre-line text-left space-y-1.5 md:space-y-2 text-xs md:text-sm text-stone-700 leading-relaxed font-medium">
      <p>{octoberLines[0]}</p>
      <p className="font-black text-[#39332c] text-xs md:text-base">{octoberLines[1]}</p>
      <p className="italic text-[11px] md:text-xs text-stone-500">{octoberLines[2]}</p>
      <div className="h-[1px] bg-stone-200 w-full my-2"></div>
      <p>{octoberLines[3]}</p>
      <p>{octoberLines[4]}</p>
      <div className="mt-2 flex justify-end items-center gap-2 pr-1">
        <span className="text-[10px] text-stone-400 italic">Ảnh minh họa</span>
        <div className="w-14 h-14 md:w-20 md:h-20 rounded-xl overflow-hidden shadow-sm border border-stone-200 shrink-0">
          <img
            src="/images/bear.png"
            alt="Ảnh reels đầu tiên"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>,

    // === Content 3: And then ===
    <div key="3" className="whitespace-pre-line text-center space-y-2.5 md:space-y-3 py-1">
      <p className="italic text-xs md:text-base font-bold text-stone-800">
        "Thế rồi ... không biết từ khi nào, em bắt đầu flirt chị ^v^"
      </p>
      <p className="text-xs md:text-sm text-stone-600 font-medium max-w-lg mx-auto">
        Trải qua nhiều buổi nói chuyện, "trải lòng" với em, và rồi chúng ta có...
      </p>
      <div className="flex justify-center pt-2 w-full">
        <button
          onClick={() => navigate("/timeline")}
          className="flex flex-col items-center p-0 m-0 bg-transparent border-none hover:opacity-80 transition cursor-pointer"
        >
          <img
            src="/icons/pointer.png"
            alt="pointer"
            className="w-12 h-12 md:w-16 md:h-16 animate-blink"
          />
          <p className="text-center mt-1 text-[11px] md:text-xs text-stone-500 font-medium">
            (Muốn biết có gì thì chọt dô nhỏ Mây i)
          </p>
        </button>
      </div>
    </div>,

    // === Content 4: Finally ===
    <div key="4" className="flex flex-col items-center w-full space-y-2 md:space-y-3">
      <p className="text-center text-xs md:text-base font-semibold italic text-[#39332c] leading-relaxed">
        Và cuối cùng sau nhiều tháng ngày tìm hiểu nhau thì tụi mình chính thức
        quen nhau vào ngày <span className="text-pink-600 font-black">19/02/2025</span>.
      </p>
      <LoveCounter />
    </div>,
  ];

  // Slide animation variants
  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 25 : -25,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.25, ease: "easeOut" },
    },
    exit: (dir) => ({
      x: dir > 0 ? -25 : 25,
      opacity: 0,
      transition: { duration: 0.2, ease: "easeIn" },
    }),
  };

  return (
    <section id="journey" className="w-full max-w-6xl mx-auto px-3 sm:px-4 pt-1 md:pt-2 pb-4 md:pb-8">
      {/* ================= MOBILE STEPPER (THIẾT BỊ DI ĐỘNG) ================= */}
      <div className="block md:hidden mb-3">
        {/* Horizontal Scrollable Stepper */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-2 px-1">
          {labels.map((label, idx) => {
            const isActive = activeIndex === idx;
            const isCompleted = activeIndex > idx;

            return (
              <button
                key={idx}
                onClick={() => goToStep(idx)}
                className={`relative px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 select-none ${isActive
                    ? "text-white shadow-xs"
                    : isCompleted
                      ? "bg-stone-100 text-[#39332c]"
                      : "bg-white/80 text-stone-400 border border-stone-200/60"
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="journey-mobile-step-pill"
                    className="absolute inset-0 bg-[#39332c] rounded-xl -z-10 shadow-xs"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span
                  className={`w-3.5 h-3.5 rounded-full text-[9px] flex items-center justify-center font-extrabold ${isActive
                      ? "bg-white text-[#39332c]"
                      : isCompleted
                        ? "bg-[#39332c] text-white"
                        : "bg-stone-200 text-stone-600"
                    }`}
                >
                  {idx + 1}
                </span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Swipe Hint */}
        <div className="flex justify-between items-center px-1 text-[10px] text-stone-400 font-medium italic">
          <span>← Vuốt để chuyển câu chuyện →</span>
          <span>{activeIndex + 1}/{labels.length}</span>
        </div>
      </div>

      {/* ================= MAIN CONTAINER (RESPONSIVE PADDING & HEIGHT) ================= */}
      <div className="relative rounded-[2rem] md:rounded-[2.5rem] bg-white/95 backdrop-blur-xl border border-stone-200/90 shadow-xl overflow-hidden p-4 sm:p-6 md:p-10">
        <div className="flex flex-col md:flex-row items-stretch gap-4 md:gap-10 min-h-[340px] md:min-h-[440px]">
          {/* LEFT SIDE: STORY CONTENT (SWIPEABLE CARD) */}
          <div className="flex-1 md:flex-[1.4] flex flex-col justify-between relative min-w-0">
            {/* Step Title Header (Centered & Highlighted Line) */}
            <div className="mb-3 md:mb-5 text-center shrink-0">
              <span className="text-[9px] md:text-[10px] font-extrabold text-stone-400 uppercase tracking-widest block mb-0.5">
                Giai đoạn {activeIndex + 1}
              </span>
              <h2 className="text-base md:text-2xl font-black text-[#39332c] tracking-tight">
                {labels[activeIndex]}
              </h2>
              {/* Highlighted Line */}
              <div className="mt-2 md:mt-3 h-[1.5px] w-full bg-stone-200" />
            </div>

            {/* Swipeable Animated Content Area with safe max-height on mobile */}
            <motion.div
              key={activeIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className="flex-1 flex flex-col justify-center py-1 md:py-2 text-[#39332c] touch-pan-y select-none max-h-[58vh] md:max-h-none overflow-y-auto custom-scrollbar px-0.5"
            >
              {contents[activeIndex]}
            </motion.div>

            {/* Bottom Card Navigation (Trước đó / Kế tiếp) */}
            <div className="pt-2.5 md:pt-4 border-t border-stone-200 flex items-center justify-between mt-2 md:mt-4 shrink-0">
              <button
                onClick={prevStep}
                disabled={activeIndex === 0}
                className={`flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs font-bold transition-all ${activeIndex === 0
                    ? "opacity-25 cursor-not-allowed text-stone-400 bg-stone-100"
                    : "text-[#39332c] bg-stone-100 hover:bg-stone-200 active:scale-95 cursor-pointer"
                  }`}
              >
                <FaChevronLeft size={10} />
                <span>Trước đó</span>
              </button>

              <div className="flex items-center gap-1.5">
                {labels.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToStep(idx)}
                    className={`h-1.5 rounded-full transition-all ${activeIndex === idx
                        ? "w-5 md:w-6 bg-[#39332c]"
                        : "w-1.5 md:w-2 bg-stone-300 hover:bg-stone-400"
                      }`}
                  />
                ))}
              </div>

              {activeIndex < labels.length - 1 ? (
                <button
                  onClick={nextStep}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 md:px-5 md:py-2 rounded-full text-xs font-bold text-white bg-[#39332c] hover:bg-[#25211c] shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  <span>Tiếp theo</span>
                  <FaChevronRight size={10} />
                </button>
              ) : (
                <button
                  onClick={() => navigate("/timeline")}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 md:px-5 md:py-2 rounded-full text-xs font-bold text-white bg-[#39332c] hover:bg-[#25211c] shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  <span>Khám phá mây</span>
                </button>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: DESKTOP TIMELINE (CỘT MỐC DỌC TRÊN MÁY TÍNH) */}
          <div className="hidden md:flex flex-1 flex-col justify-center pl-8 border-l border-stone-200/70 relative">
            <div className="relative space-y-5">
              {/* Vertical connecting line */}
              <div className="absolute left-4 top-3 bottom-3 w-0.5 bg-stone-200 -z-0" />

              {labels.map((label, idx) => {
                const isActive = activeIndex === idx;
                const isCompleted = activeIndex > idx;

                return (
                  <motion.div
                    key={idx}
                    onClick={() => goToStep(idx)}
                    whileHover={{ x: 4 }}
                    className={`relative flex items-center gap-4 cursor-pointer p-3 rounded-2xl transition-all select-none ${isActive
                        ? "bg-[#faf8f5] shadow-sm border border-stone-200/80"
                        : "hover:bg-stone-50/80"
                      }`}
                  >
                    {/* Node Dot */}
                    <div
                      className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all shrink-0 ${isActive
                          ? "bg-[#39332c] text-white ring-4 ring-stone-200/80 shadow-md"
                          : isCompleted
                            ? "bg-[#39332c] text-white"
                            : "bg-white text-stone-400 border-2 border-stone-300"
                        }`}
                    >
                      {isCompleted ? "✓" : idx + 1}
                    </div>

                    {/* Node Label */}
                    <div className="min-w-0 flex-1 text-left">
                      <h4
                        className={`text-sm font-black transition-colors ${isActive ? "text-[#39332c]" : "text-stone-600"
                          }`}
                      >
                        {label}
                      </h4>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
