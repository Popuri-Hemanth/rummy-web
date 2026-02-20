import React from "react";

export default function Lobby({ socket, userId, onJoinRoom }) {
  const [gameType, setGameType] = React.useState(13);
  const [joinId, setJoinId] = React.useState("");
  const [connecting, setConnecting] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleCreateRoom = () => {
    if (!socket) return;
    setError("");
    setConnecting(true);
    socket.emitWithAck(
      "create_room",
      {
        gameType,
        maxPlayers: 2,
        practiceMode: true,
        userId,
        username: "WebPlayer",
      },
      (res) => {
        setConnecting(false);
        if (res && res.ok) {
          onJoinRoom({
            roomId: res.roomId,
            gameType,
            room: res.room,
            isCreator: true,
          });
        } else {
          setError(res?.reason || "Create room failed");
        }
      }
    );
  };

  const handleJoinRoom = () => {
    if (!socket) return;
    const id = joinId.trim().toUpperCase();
    if (!id) {
      setError("Enter room ID");
      return;
    }
    setError("");
    setConnecting(true);
    socket.emitWithAck(
      "join_room",
      {
        roomId: id,
        username: "WebPlayer",
        userId,
      },
      (res) => {
        setConnecting(false);
        if (res && res.ok) {
          onJoinRoom({
            roomId: id,
            gameType: res.room?.gameType ?? 13,
            room: res.room,
            isCreator: false,
          });
        } else {
          setError(res?.reason || "Join failed");
        }
      }
    );
  };

  return (
    <div className="lobby">
      <h1 className="lobby-title">Rummy</h1>

      <div className="lobby-section">
        <h2>Create room</h2>
        <div className="lobby-buttons">
          <button
            type="button"
            className={gameType === 13 ? "btn btn-primary" : "btn"}
            onClick={() => setGameType(13)}
          >
            13 Card
          </button>
          <button
            type="button"
            className={gameType === 21 ? "btn btn-primary" : "btn"}
            onClick={() => setGameType(21)}
          >
            21 Card
          </button>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-block"
          disabled={connecting || !socket}
          onClick={handleCreateRoom}
        >
          {connecting ? "..." : "Create room"}
        </button>
      </div>

      <div className="lobby-section">
        <h2>Join room</h2>
        <input
          type="text"
          className="input"
          placeholder="Room ID"
          value={joinId}
          onChange={(e) => setJoinId(e.target.value.toUpperCase())}
          maxLength={6}
        />
        <button
          type="button"
          className="btn btn-block"
          disabled={connecting || !joinId.trim() || !socket}
          onClick={handleJoinRoom}
        >
          {connecting ? "..." : "Join room"}
        </button>
      </div>

      {error && <p className="lobby-error">{error}</p>}
    </div>
  );
}
