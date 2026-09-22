# Kế Hoạch Triển Khai Nâng Cấp "Love Story" (Giai Đoạn 2)

Dựa trên sự lựa chọn của bạn, chúng ta sẽ tiến hành xây dựng 4 tính năng vô cùng lãng mạn và mang đậm dấu ấn cá nhân. Dưới đây là kế hoạch chi tiết về kỹ thuật, thư viện và chiến lược CSS phù hợp với nền tảng hiện tại của dự án.

## 📦 1. Đánh Giá Dependencies (Thư Viện)

Tin vui là kiến trúc dự án hiện tại của bạn đã rất mạnh mẽ. Chúng ta **KHÔNG CẦN** cài đặt thêm thư viện nặng nề nào để tránh làm chậm trang web. Mọi thứ sẽ được xử lý tối ưu nhất:

*   **Animation & Tương tác:** Sử dụng tiếp `framer-motion` (đã có sẵn).
*   **Giao diện & Reponsive:** Sử dụng Tailwind CSS v4 (đã cấu hình chuẩn).
*   **Xử lý thời gian (Counter / Day-Night):** Dùng Native JavaScript `Date` API (nhẹ, nhanh, không cần cài thêm thư viện như `moment.js` hay `date-fns`).
*   **Trình phát nhạc:** Sử dụng Native HTML5 `<audio>` API kết hợp với React `useRef`.
*   **Icons:** Tiếp tục sử dụng `react-icons` (đã có sẵn).

---

## 🛠️ 2. Chi Tiết Triển Khai & Chiến Lược CSS

### Phân hệ 1: 🎵 Trình phát nhạc nền (Mini Music Player)
*   **Component mới:** `src/components/MusicPlayer.jsx`
*   **Logic:**
    *   Sử dụng thẻ `<audio>` ẩn. Quản lý trạng thái `isPlaying` bằng `useState`.
    *   Sử dụng `framer-motion` để tạo hiệu ứng quay đĩa than: `animate={{ rotate: isPlaying ? 360 : 0 }}` kết hợp `repeat: Infinity, duration: 4, ease: "linear"`.
*   **CSS Strategy:**
    *   Đặt ở góc dưới màn hình: `fixed bottom-6 right-6 z-50`.
    *   Thiết kế dạng Glassmorphism mini: `bg-white/30 backdrop-blur-md rounded-full shadow-lg border border-white/40`.

### Phân hệ 2: ⏳ Bộ đếm thời gian (Love Counter)
*   **Component mới:** `src/components/LoveCounter.jsx` (Hoặc nhúng thẳng vào `Journey.jsx` / `Home.jsx`).
*   **Logic:**
    *   `useEffect` với `setInterval(..., 1000)` để cập nhật thời gian thực mỗi giây.
    *   Thuật toán tính chênh lệch ngày, giờ, phút, giây từ gốc `19/02/2025`.
*   **CSS Strategy:**
    *   Layout hiển thị dạng các ô block (Năm, Tháng, Ngày...) dùng CSS Grid: `grid grid-cols-3 md:grid-cols-6 gap-4`.
    *   Icon trái tim ở giữa đập nhịp nhàng bằng Tailwind: `animate-pulse` hoặc keyframes tự định nghĩa `animate-heartbeat`.

### Phân hệ 3: 🌙 Bầu trời Day/Night Cycle (Cloud Memory)
*   **Cập nhật:** `src/components/CloudMemory.jsx`
*   **Logic:**
    *   Lấy giờ hiện tại: `const hour = new Date().getHours()`.
    *   Phân loại: `isDay (6-17)`, `isSunset (17-19)`, `isNight (19-6)`.
*   **CSS Strategy:**
    *   *Day:* Giữ nguyên gradient `from-sky-200 via-sky-100 to-indigo-50`.
    *   *Sunset:* `from-orange-300 via-rose-300 to-purple-400`.
    *   *Night:* `from-slate-900 via-indigo-950 to-blue-900`.
    *   *Night Animations:* Render thêm Component `<Stars />` (chỉ xuất hiện vào ban đêm) với các đốm trắng li ti có thuộc tính `opacity` thay đổi ngẫu nhiên. Mây vào ban đêm sẽ thêm class `brightness-75`.

### Phân hệ 4: 📌 Bảng "Bucket List" (Corkboard)
*   **Component mới:** `src/components/BucketList.jsx`
*   **Logic:**
    *   Quản lý danh sách các mục tiêu bằng mảng Object (có cờ `isCompleted`).
*   **CSS Strategy:**
    *   **Nền Bảng Bần (Corkboard):** Sử dụng màu nền `#d4b58e` kết hợp với một chút CSS Pattern (dots) mờ để tạo cảm giác sần sùi của gỗ bần.
    *   **Polaroid:** Bố cục dạng thẻ card nền trắng dày, viền xám, thả bóng: `bg-white p-3 pb-8 shadow-xl rounded-sm border border-gray-100`.
    *   **Độ nghiêng tự nhiên:** Áp dụng random rotation (Ví dụ: `rotate-[-3deg]`, `rotate-[4deg]`) cho mỗi bức ảnh để trông như được ghim bằng tay.
    *   **Ghim (Pins):** Dùng một khối `div` nhỏ hình tròn với hiệu ứng đổ bóng ở góc trên bức ảnh.
    *   **Tem "Done":** Dùng text đỏ, font chữ kiểu Handwriting (ví dụ Caveat hoặc brush script), xoay chéo `rotate-[-15deg]`, thêm hiệu ứng `mix-blend-multiply` để trông như được đóng mộc thật.

---

## 🚀 Thứ Tự Ưu Tiên Triển Khai
1.  **Phase 1:** Mini Music Player (Rất dễ, tăng ngay độ lãng mạn cho toàn bộ trang).
2.  **Phase 2:** Day/Night Cycle cho Cloud Memory (Tận dụng code hiện có, dễ nâng cấp hình ảnh).
3.  **Phase 3:** Love Counter (Thêm logic tính toán thời gian chuẩn xác).
4.  **Phase 4:** Bucket List (Cần code CSS chi tiết cho UI Polaroid và Corkboard).
