import React from "react";

const CloudSVG = ({ size, opacity = 0.8 }) => {
  // Cloud size mapping
  const cloudSizes = {
    small: { width: 60, height: 40 },
    medium: { width: 100, height: 65 },
    large: { width: 150, height: 100 },
  };

  return (
    <svg
      width={cloudSizes[size].width}
      height={cloudSizes[size].height}
      viewBox="0 0 100 60"
      style={{ opacity }}
    >
      <g fill="white" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))">
        <circle cx="20" cy="35" r="15" />
        <circle cx="35" cy="25" r="20" />
        <circle cx="55" cy="25" r="18" />
        <circle cx="70" cy="30" r="12" />
        <circle cx="80" cy="35" r="10" />
        <rect x="15" y="30" width="70" height="20" rx="10" />
      </g>
    </svg>
  );
};

export default CloudSVG;
