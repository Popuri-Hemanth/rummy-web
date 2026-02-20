import React from "react";

export default function Card({ card, selected, onClick, size = "normal" }) {
  const sizeClass = size === "small" ? "card-small" : "card-normal";
  return (
    <div
      className={`card ${sizeClass} ${selected ? "card-selected" : ""} ${onClick ? "card-clickable" : ""}`}
      onClick={onClick || undefined}
      role={onClick ? "button" : undefined}
      title={card}
    >
      {card}
    </div>
  );
}
