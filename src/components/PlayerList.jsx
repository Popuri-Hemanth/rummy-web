import React from "react";

export default function PlayerList({ players, currentTurnIndex }) {
  if (!players || !players.length) return null;
  return (
    <div className="player-list">
      {players.map((p, i) => (
        <div
          key={p.id || p.userId || i}
          className={`player-item ${i === currentTurnIndex ? "player-turn" : ""}`}
        >
          <span className="player-name">{p.name || `Player ${i + 1}`}</span>
          {p.isBot && <span className="player-bot">Bot</span>}
          {i === currentTurnIndex && <span className="turn-badge">Turn</span>}
        </div>
      ))}
    </div>
  );
}
