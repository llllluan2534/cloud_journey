import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function TimelineItem({
  date,
  title,
  description,
  fullStory,
  mediaType,
  mediaUrl,
  forceOpen = false,
  onClose,
  boardTop = 100,
}) {
  const itemRef = useRef();
  const [showModal, setShowModal] = useState(forceOpen);

  useEffect(() => {
    if (!forceOpen) {
      ScrollTrigger.batch(".timeline-item", {
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            stagger: 0.15,
            duration: 0.8,
            ease: "power2.out",
          }),
        start: "top 90%",
      });

      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);
    }
  }, [forceOpen]);

  useEffect(() => {
    setShowModal(forceOpen);
  }, [forceOpen]);

  return (
    <>
      {!forceOpen && (
        <div
          ref={itemRef}
          className="timeline-item bg-[#fdfbee] border border-pink-300 rounded-2xl p-6 shadow-lg mb-8 max-w-xl mx-auto opacity-0 translate-y-4 transition duration-500 cursor-pointer hover:shadow-xl"
          onClick={() => setShowModal(true)}
        >
          <h3 className="text-xl font-extrabold text-pink-600 mb-1">{title}</h3>
          <p className="text-sm text-gray-500 mb-3">{date}</p>
          <p className="text-gray-700 mb-4">{description}</p>
        </div>
      )}

      {showModal && (
        <div
          className="fixed z-50 w-[360px] bg-white rounded-xl shadow-xl border border-pink-300 overflow-y-auto max-h-[80vh]"
          style={{ top: `${boardTop}px`, right: "30px" }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl z-10"
            onClick={() => {
              setShowModal(false);
              if (onClose) onClose();
            }}
          >
            ✖
          </button>

          <div className="p-4 space-y-3">
            <div className="bg-[#fdfbee] border border-pink-300 rounded-2xl p-4 shadow space-y-2">
              <h3 className="text-lg font-extrabold text-pink-600">{title}</h3>
              <p className="text-xs text-gray-500">{date}</p>
              <p className="text-sm text-gray-700">{description}</p>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                {fullStory}
              </p>
              {mediaType === "image" && (
                <img
                  src={mediaUrl}
                  alt={title}
                  className="w-full h-auto rounded-lg border"
                />
              )}
              {mediaType === "video" && (
                <video
                  src={mediaUrl}
                  controls
                  className="w-full h-auto rounded-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
