import { Typewriter } from "react-simple-typewriter";

export default function Letter() {
  return (
    <div className="max-w-2xl mx-auto mt-10 text-lg text-gray-800 px-4">
      <h2 className="text-center text-2xl text-pink-600 mb-4">
        Lá thư gửi em 💌
      </h2>
      <p>
        <Typewriter
          words={[
            "Em yêu à, từ ngày có em, anh như sống trong một thế giới khác...",
            "Nơi có nụ cười của em, là nơi bình yên nhất.",
            "Cảm ơn em vì đã bước vào cuộc đời anh. Anh yêu em rất nhiều 💖",
          ]}
          loop={1}
          cursor
          cursorStyle="|"
          typeSpeed={40}
          deleteSpeed={0}
          delaySpeed={2000}
        />
      </p>
    </div>
  );
}
