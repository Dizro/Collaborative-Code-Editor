import React from "react";

interface UserCursorProps {
  x: number;
  y: number;
  username: string;
  color: string;
}

export default function UserCursor({ x, y, username, color }: UserCursorProps) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        transform: `translate(${x}px, ${y}px)`,
        transition: 'transform 0.1s linear',
      }}
    >
      <svg
        width="24"
        height="36"
        viewBox="0 0 24 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
          transform: 'translateY(-2px)'
        }}
      >
        <path
          d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
          fill={color}
          stroke="white"
          strokeWidth="1"
        />
      </svg>

      <div
        className="absolute left-4 top-0 px-3 py-1.5 rounded-lg text-white text-sm whitespace-nowrap"
        style={{
          backgroundColor: color,
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          transform: 'translateY(18px)'
        }}
      >
        {username}
      </div>
    </div>
  );
}
