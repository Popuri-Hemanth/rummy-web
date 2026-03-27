import React from "react";
import { io } from "socket.io-client";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { BASE_URL } from "./config";
import Lobby from "./Lobby";
import Game from "./Game";

function getUserId() {
  let id = sessionStorage.getItem("rummy_userId");
  if (!id) {
    id = "web_" + Math.random().toString(36).slice(2, 12);
    sessionStorage.setItem("rummy_userId", id);
  }
  return id;
}

export default function App() {
  const [socket, setSocket] = React.useState(null);
  const [connected, setConnected] = React.useState(false);
  const [screen, setScreen] = React.useState("lobby");
  const [roomId, setRoomId] = React.useState(null);
  const [gameType, setGameType] = React.useState(13);
  const [room, setRoom] = React.useState(null);
  const [isCreator, setIsCreator] = React.useState(false);
  const userId = React.useMemo(getUserId, []);

  React.useEffect(() => {
    const s = io(BASE_URL, { autoConnect: true });
    s.on("connect", () => setConnected(true));
    s.on("disconnect", () => setConnected(false));
    setSocket(s);
    return () => {
      s.off("connect");
      s.off("disconnect");
      s.disconnect();
    };
  }, []);

  const handleJoinRoom = React.useCallback((data) => {
    setRoomId(data.roomId ?? "");
    setGameType(data.gameType ?? 13);
    setRoom(data.room ?? null);
    setIsCreator(data.isCreator ?? false);
    setScreen("game");
  }, []);

  const handleBackToLobby = React.useCallback(() => {
    setRoomId(null);
    setRoom(null);
    setScreen("lobby");
  }, []);

  return (
    <div className="app">
      <div className="app-status">
        {connected ? (
          <span className="status-connected">Connected</span>
        ) : (
          <span className="status-disconnected">Disconnected</span>
        )}
      </div>

      {screen === "lobby" && (
        <Lobby socket={socket} userId={userId} onJoinRoom={handleJoinRoom} />
      )}

      {screen === "game" && socket && (
        <Game
          socket={socket}
          roomId={roomId ?? ""}
          gameType={gameType}
          initialRoom={room}
          isCreator={isCreator}
          userId={userId}
          onBackToLobby={handleBackToLobby}
        />
      )}
      <SpeedInsights />
    </div>
  );
}
