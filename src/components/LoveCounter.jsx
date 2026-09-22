import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaHeart } from "react-icons/fa";

export default function LoveCounter() {
  const [timeElapsed, setTimeElapsed] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Ngày bắt đầu yêu nhau: 19/02/2025
    // Bạn có thể chỉnh sửa lại giờ phút nếu muốn chính xác hơn
    const startDate = new Date("2025-02-19T00:00:00");

    const calculateTime = () => {
      const now = new Date();
      let years = now.getFullYear() - startDate.getFullYear();
      let months = now.getMonth() - startDate.getMonth();
      let days = now.getDate() - startDate.getDate();
      let hours = now.getHours() - startDate.getHours();
      let minutes = now.getMinutes() - startDate.getMinutes();
      let seconds = now.getSeconds() - startDate.getSeconds();

      if (seconds < 0) {
        minutes -= 1;
        seconds += 60;
      }
      if (minutes < 0) {
        hours -= 1;
        minutes += 60;
      }
      if (hours < 0) {
        days -= 1;
        hours += 24;
      }
      if (days < 0) {
        months -= 1;
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
        days += prevMonth;
      }
      if (months < 0) {
        years -= 1;
        months += 12;
      }

      // Ngăn trường hợp ngày hiện tại trước ngày bắt đầu (âm)
      if (now < startDate) {
        return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return { years, months, days, hours, minutes, seconds };
    };

    const timer = setInterval(() => {
      setTimeElapsed(calculateTime());
    }, 1000);

    // Initial call
    setTimeElapsed(calculateTime());

    return () => clearInterval(timer);
  }, []);

  const timeBlocks = [
    { label: "Năm", value: timeElapsed.years },
    { label: "Tháng", value: timeElapsed.months },
    { label: "Ngày", value: timeElapsed.days },
    { label: "Giờ", value: timeElapsed.hours },
    { label: "Phút", value: timeElapsed.minutes },
    { label: "Giây", value: timeElapsed.seconds },
  ];

  return (
    <div className="w-full mt-3 md:mt-6">
      <div className="flex justify-center items-center gap-3 mb-3 md:mb-4">
        <div className="h-[1px] bg-gradient-to-r from-transparent to-pink-300 flex-1"></div>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
        >
          <FaHeart className="text-pink-500 text-xl md:text-2xl drop-shadow-xs" />
        </motion.div>
        <div className="h-[1px] bg-gradient-to-l from-transparent to-pink-300 flex-1"></div>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
        {timeBlocks.map((block, index) => (
          <motion.div
            key={block.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="flex flex-col items-center justify-center bg-[#faf8f5] rounded-xl p-2 md:p-3 border border-stone-200/80 shadow-2xs hover:border-pink-300 transition-all"
          >
            <span className="text-xl md:text-3xl font-black text-[#39332c]">
              {block.value.toString().padStart(2, "0")}
            </span>
            <span className="text-[10px] md:text-xs font-bold text-stone-500 uppercase tracking-wider mt-0.5">
              {block.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
