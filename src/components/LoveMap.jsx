import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, Tooltip, ImageOverlay } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Khi nào bạn có hình, hãy bỏ vào src/assets/ocean_mask.png 
// Và hệ thống sẽ tự nhận diện nếu file tồn tại ở đường dẫn này
const oceanMaskImage = "/src/assets/ocean_mask.jpg";

// Fix Leaflet Default Icon
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const VN_GEOJSON_URL = "https://raw.githubusercontent.com/leakyMirror/map-of-vietnam/master/vietnam.geojson";

const SOVEREIGNTY_POINTS = [
  { id: "hoang-sa", name: "Quần đảo Hoàng Sa (Việt Nam)", coords: [16.5, 112.0] },
  { id: "truong-sa", name: "Quần đảo Trường Sa (Việt Nam)", coords: [10.0, 114.5] }
];

export default function LoveMap({ items, onPinClick, getCoords }) {
  const [vnGeoJson, setVnGeoJson] = useState(null);
  const mapCenter = [16.4637, 107.5908];

  useEffect(() => {
    fetch(VN_GEOJSON_URL)
      .then(res => res.json())
      .then(data => setVnGeoJson(data))
      .catch(err => console.error("Error loading VN GeoJSON:", err));
  }, []);

  const vnBounds = [[6.0, 101.0], [24.0, 118.0]];

  // Dịch vùng ảnh sang phải (tăng kinh độ)
  const maskBounds = [[13.0, 113.0], [17.0, 117.0]];

  const sovereigntyIcon = L.divIcon({
    className: "sovereignty-marker",
    html: `<div class="vn-flag-dot shadow-xl">
            <div class="star">★</div>
           </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  return (
    <div className="w-full h-[600px] md:h-[850px] rounded-[3.5rem] overflow-hidden shadow-2xl border-4 border-white relative z-0 bg-[#f9f8f6]">
      <div className="w-full h-full">
        <MapContainer
          center={mapCenter}
          zoom={6}
          minZoom={5}
          maxZoom={12}
          maxBounds={vnBounds}
          maxBoundsViscosity={1.0}
          scrollWheelZoom={false}
          className="w-full h-full"
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          {/* ĐÂY LÀ PHẦN HÌNH ẢNH CỦA BẠN SẼ ĐÈ LÊN */}
          {oceanMaskImage && (
            <ImageOverlay
              url={oceanMaskImage}
              bounds={maskBounds}
              opacity={1}
              zIndex={200}
            />
          )}

          {/* VIETNAM BORDER */}
          {vnGeoJson && (
            <GeoJSON
              data={vnGeoJson}
              style={{
                color: "#39332c",
                weight: 2.5,
                fillColor: "#39332c",
                fillOpacity: 0.05,
              }}
            />
          )}

          {/* SOVEREIGNTY MARKERS */}
          {SOVEREIGNTY_POINTS.map(point => (
            <Marker key={point.id} position={point.coords} icon={sovereigntyIcon} interactive={false}>
              <Tooltip permanent direction="top" className="sovereignty-tooltip">
                <span className="font-black text-[11px] uppercase tracking-tighter text-[#39332c] drop-shadow-sm">{point.name}</span>
              </Tooltip>
            </Marker>
          ))}

          {items.map((item) => {
            const locationToSearch = item.location_name || item.text;
            const coords = getCoords(locationToSearch);
            if (!coords) return null;

            const icon = L.divIcon({
              className: "art-marker",
              html: `<div class="marker-container ${item.is_completed ? 'completed' : 'pending'}">
                      <div class="dot shadow-lg"></div>
                      <div class="pulse"></div>
                      <span class="label-tag">${item.text}</span>
                     </div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            });

            return (
              <Marker
                key={item.id}
                position={coords}
                icon={icon}
                eventHandlers={{ click: () => onPinClick(item.id) }}
              >
                <Popup className="art-popup">
                  <div className="flex flex-col items-center gap-1.5 p-1 min-w-[120px]">
                    <div className="text-[9px] font-black text-blue-600/40 uppercase tracking-[0.2em] mb-1">Destination</div>
                    <p className="font-black text-[#39332c] text-[11px] uppercase tracking-wider leading-tight text-center">
                      {item.text}
                    </p>
                    {item.location_name && (
                      <div className="flex items-center gap-2 mt-1 px-3 py-1 bg-blue-50 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm"></div>
                        <p className="text-[9px] font-bold text-blue-600/70">{item.location_name}</p>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white/60 backdrop-blur-md px-10 py-3 rounded-full border border-white/50 z-[500] shadow-sm pointer-events-none">
        <span className="text-[10px] font-black text-[#39332c] uppercase tracking-[0.5em]">Vietnam Journey Map</span>
      </div>

      {/* Legend */}
      <div className="absolute bottom-10 right-10 bg-white/90 backdrop-blur-md p-6 rounded-[2.5rem] border border-stone-50 z-[500] shadow-xl">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full bg-blue-200"></div>
            <span className="text-[10px] font-black uppercase text-stone-400 tracking-widest">Dự định</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full bg-blue-600 relative">
              <div className="absolute inset-0 bg-blue-600 rounded-full animate-ping opacity-20"></div>
            </div>
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-widest">Đã đi</span>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        /* Chỉ áp dụng hiệu ứng trắng đen lên lớp gạch (tiles) của bản đồ */
        .leaflet-tile-pane {
          filter: grayscale(1) contrast(1.1) brightness(1.05) saturate(0);
        }
        
        .vn-flag-dot {
          width: 14px; height: 14px; background: #da251d; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid white; box-shadow: 0 5px 15px rgba(218, 37, 29, 0.5);
        }
        .vn-flag-dot .star { color: #ffff00; font-size: 9px; line-height: 1; }
        
        .sovereignty-tooltip {
          background: transparent !important; border: none !important; box-shadow: none !important;
          color: #39332c !important; font-size: 11px !important; margin-top: -12px !important;
        }
        .sovereignty-tooltip::before { display: none !important; }

        .art-marker { transition: all 0.3s ease; }
        .marker-container { display: flex; align-items: center; justify-content: center; position: relative; }
        .dot { 
          width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; 
          box-shadow: 0 4px 15px rgba(0,0,0,0.2); transition: all 0.3s;
        }
        .marker-container.pending .dot { background: #93c5fd; }
        .marker-container.completed .dot { background: #2563eb; width: 16px; height: 16px; }
        .marker-container.completed .pulse {
          position: absolute; width: 40px; height: 40px; border-radius: 50%;
          background: rgba(15, 68, 182, 1); animation: pulse-ring 2s infinite;
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.3); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .label-tag {
          position: absolute; bottom: 25px; white-space: nowrap; font-size: 10px; font-weight: 900;
          text-transform: uppercase; letter-spacing: 0.1em; color: #39332c;
          background: rgba(255,255,255,0.9); padding: 4px 12px; border-radius: 20px;
          opacity: 0; transform: translateY(10px); transition: all 0.3s ease;
          border: 1px solid #f5f5f0;
        }
        .art-marker:hover .label-tag { opacity: 1; transform: translateY(0); }
      `}} />
    </div>
  );
}
