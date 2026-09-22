import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/logo.png";

const navItems = [
  { name: "Hành trình", shortName: "Hành trình", path: "/" },
  { name: "Đám mây kỷ niệm", shortName: "Kỷ niệm", path: "/timeline" },
  { name: "Thư viện", shortName: "Thư viện", path: "/gallery" },
  { name: "Bản đồ mơ ước", shortName: "Mơ ước", path: "/bucket-list" },
  { name: "Bức thư", shortName: "Bức thư", path: "/letter" },
];

export default function Header() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  return (
    <>
      {/* ================= DESKTOP NAVBAR (STAYS AT TOP OF PAGE, DOES NOT FOLLOW SCROLL) ================= */}
      <header className="absolute top-5 left-1/2 -translate-x-1/2 z-50 hidden md:flex items-center p-1.5 bg-white/80 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.06)] rounded-full transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.09)] hover:bg-white/90">
        {/* Brand Logo & Name */}
        <Link
          to="/"
          className="flex items-center gap-2.5 pl-3.5 pr-4 py-2 rounded-full hover:bg-stone-100/70 transition-all duration-200 group whitespace-nowrap"
          title="Trang chủ Our Story"
        >
          <img
            src={logo}
            alt="Logo"
            className="w-6 h-6 object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300"
          />
          <span className="font-black text-[#39332c] text-xs tracking-widest uppercase whitespace-nowrap">
            Our Story
          </span>
        </Link>

        {/* Subtle Vertical Divider */}
        <div className="w-[1px] h-4 bg-stone-300/70 mx-1.5" />

        {/* Navigation Links with Sliding Pill Indicator (NO ICONS) */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-200 select-none whitespace-nowrap ${
                  active
                    ? "text-white"
                    : "text-stone-600 hover:text-[#39332c] hover:bg-stone-100/60"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="desktop-active-pill"
                    className="absolute inset-0 bg-[#39332c] rounded-full -z-10 shadow-md shadow-[#39332c]/20"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </header>

      {/* ================= MOBILE TOP BRAND BAR ================= */}
      <header className="absolute top-3 left-4 right-4 z-40 md:hidden flex items-center justify-between px-4 py-2.5 bg-white/85 backdrop-blur-xl border border-white/70 shadow-sm rounded-2xl">
        <Link to="/" className="flex items-center gap-2 whitespace-nowrap">
          <img src={logo} alt="Logo" className="w-6 h-6 object-contain" />
          <span className="font-black text-[#39332c] text-xs tracking-wider uppercase whitespace-nowrap">
            Our Story
          </span>
        </Link>
        <div className="flex items-center gap-1.5 text-pink-600 bg-pink-50/80 px-2.5 py-1 rounded-full border border-pink-100 text-[10px] font-bold whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
          <span>19.02.2025</span>
        </div>
      </header>

      {/* ================= MOBILE FLOATING BOTTOM DOCK (TEXT ONLY) ================= */}
      <nav
        aria-label="Mobile Navigation Dock"
        className="fixed bottom-4 left-3 right-3 z-40 md:hidden bg-white/85 backdrop-blur-2xl border border-white/80 shadow-[0_12px_40px_rgba(0,0,0,0.12)] rounded-3xl p-1.5 flex justify-around items-center gap-1"
      >
        {navItems.map((item) => {
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex-1 py-2.5 px-1 flex items-center justify-center rounded-2xl transition-all duration-200 select-none whitespace-nowrap ${
                active ? "text-white font-bold" : "text-stone-500 hover:text-stone-800"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="mobile-active-pill"
                  className="absolute inset-0 bg-[#39332c] rounded-2xl -z-10 shadow-md shadow-[#39332c]/20"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                />
              )}
              <span className="text-[11px] font-bold tracking-tight">
                {item.shortName}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
