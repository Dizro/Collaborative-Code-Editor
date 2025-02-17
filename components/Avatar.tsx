import React from "react";
import Image from "next/image";

type Props = {
  variant?: "avatar" | "more";
  size?: number;
  src?: string;
  name?: string;
  color?: [string, string];
  count?: number;
  style?: React.CSSProperties;
};

export function Avatar({
  variant = "avatar",
  src,
  name = "",
  color = ["#000", "#000"],
  size = 20,
  count,
  style,
}: Props) {
  if (variant === "more") {
    return (
      <div
        style={{
          width: size,
          height: size,
          backgroundColor: "#4B5563",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: `${size * 0.5}px`,
          ...style,
        }}
      >
        +{count}
      </div>
    );
  }

  if (src) {
    return (
      <div style={{ width: size, height: size, ...style }}>
        <Image
          src={src}
          alt={name}
          width={size}
          height={size}
          className="rounded-full"
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${color[0]}, ${color[1]})`,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: `${size * 0.5}px`,
        ...style,
      }}
    >
      {name.charAt(0)}
    </div>
  );
} 