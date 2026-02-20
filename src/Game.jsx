import React from "react";
import Card from "./components/Card";
import PlayerList from "./components/PlayerList";
import Timer from "./components/Timer";

export default function Game({
  socket,
  roomId,
  gameType,
  initialRoom,
  isCreator,
  userId,
  onBackToLobby,
}) {
  const [room, setRoom] = React.useState(initialRoom || null);
  const [hand, setHand] = React.useState([]);
  const [discardPile, setDiscardPile] = React.useState(initialRoom?.discardPile || []);
  const [joker, setJoker] = React.useState(initialRoom?.joker ?? null);
  const [turnExpiresAt, setTurnExpiresAt] = React.useState(null);
  const [gameState, setGameState] = React.useState(initialRoom?.gameState || "waiting");
  const [hasPickedThisTurn, setHasPickedThisTurn] = React.useState(false);
  const [gameOver, setGameOver] = React.useState(null);

  React.useEffect(() => {
    if (initialRoom) {
      setRoom(initialRoom);
      setDiscardPile(initialRoom.discardPile || []);
      setJoker(initialRoom.joker ?? null);
      setGameState(initialRoom.gameState || "waiting");
    }
  }, [initialRoom]);

  const players = room?.players || [];
  const currentTurnIndex = room?.currentTurnIndex ?? 0;
  const currentPlayerId = players[currentTurnIndex]?.id;
  const isMyTurn = currentPlayerId === socket?.id;

  React.useEffect(() => {
    if (!socket || !roomId) return;

    const onDealCards = (data) => {
      setGameState("playing");
      if (data.discardPile) setDiscardPile(data.discardPile);
      if (data.joker != null) setJoker(data.joker);
      setRoom((r) => (r ? { ...r, currentTurnIndex: data.currentTurnIndex ?? r.currentTurnIndex } : r));
    };

    const onYourHand = (data) => {
      if (data.hand) setHand(Array.isArray(data.hand) ? data.hand : []);
    };

    const onPlayerTurn = (data) => {
      setRoom((r) => {
        if (!r) return r;
        return {
          ...r,
          currentTurnIndex: data.currentTurnIndex ?? r.currentTurnIndex,
          discardPile: data.discardPile ?? r.discardPile,
        };
      });
      setDiscardPile((prev) => data.discardPile ?? prev);
      setHasPickedThisTurn(false);
      setTurnExpiresAt(null);
    };

    const onTurnTimerStart = (data) => {
      if (data.expiresAt != null) setTurnExpiresAt(data.expiresAt);
    };

    const onTurnAutoPlay = () => {
      setTurnExpiresAt(null);
    };

    const onGameOver = (data) => {
      setGameOver(data);
      setGameState("ended");
    };

    const onPlayerJoined = (data) => {
      if (data.room) setRoom(data.room);
    };

    const onPlayerDisconnected = (data) => {
      if (data.room) setRoom(data.room);
    };

    const onPlayerRejoined = (data) => {
      if (data.room) setRoom(data.room);
    };

    const onPreviewResult = () => {};

    socket.on("deal_cards", onDealCards);
    socket.on("your_hand", onYourHand);
    socket.on("player_turn", onPlayerTurn);
    socket.on("turn_timer_start", onTurnTimerStart);
    socket.on("turn_auto_play", onTurnAutoPlay);
    socket.on("game_over", onGameOver);
    socket.on("player_joined", onPlayerJoined);
    socket.on("player_disconnected", onPlayerDisconnected);
    socket.on("player_rejoined", onPlayerRejoined);
    socket.on("preview_result", onPreviewResult);

    return () => {
      socket.off("deal_cards", onDealCards);
      socket.off("your_hand", onYourHand);
      socket.off("player_turn", onPlayerTurn);
      socket.off("turn_timer_start", onTurnTimerStart);
      socket.off("turn_auto_play", onTurnAutoPlay);
      socket.off("game_over", onGameOver);
      socket.off("player_joined", onPlayerJoined);
      socket.off("player_disconnected", onPlayerDisconnected);
      socket.off("player_rejoined", onPlayerRejoined);
      socket.off("preview_result", onPreviewResult);
    };
  }, [socket, roomId]);

  const handlePickFromDeck = () => {
    if (!isMyTurn) return;
    socket.emitWithAck("pick_card", { roomId, source: "deck" }, (res) => {
      if (res && res.ok) setHasPickedThisTurn(true);
    });
  };

  const handlePickFromDiscard = () => {
    if (!isMyTurn) return;
    socket.emitWithAck("pick_card", { roomId, source: "discard" }, (res) => {
      if (res && res.ok) setHasPickedThisTurn(true);
    });
  };

  const handleDiscard = (card) => {
    if (!isMyTurn || !hasPickedThisTurn) return;
    socket.emitWithAck("discard_card", { roomId, card }, (res) => {
      if (res && res.ok) setHasPickedThisTurn(false);
    });
  };

  const handleDeclare = () => {
    if (!isMyTurn) return;
    socket.emitWithAck("declare", { roomId, cards: hand }, (res) => {
      if (!res || !res.ok) {
        setGameOver((g) => ({ ...g, declareError: res?.reason }));
      }
    });
  };

  const handleStartGame = () => {
    if (!isCreator) return;
    socket.emitWithAck("start_game", { roomId }, () => {});
  };

  const handleLeave = () => {
    socket.emit("leave_room", { roomId });
    onBackToLobby();
  };

  if (gameOver && gameState === "ended") {
    const winnerIndex = gameOver.winnerIndex;
    const winnerId = players[winnerIndex]?.id;
    const isWinner = winnerId === socket?.id;
    return (
      <div className="game">
        <h1 className="game-title">{isWinner ? "You won!" : "Game over"}</h1>
        <button type="button" className="btn btn-primary" onClick={handleLeave}>
          Back to Lobby
        </button>
      </div>
    );
  }

  const waiting = gameState === "waiting" && players.length < (room?.maxPlayers ?? 2);

  return (
    <div className="game">
      <div className="game-header">
        <h1 className="game-title">
          Room {roomId} · {gameType} card
        </h1>
        {joker && <span className="game-joker">Joker: {joker}</span>}
        <button type="button" className="btn btn-sm" onClick={handleLeave}>
          Leave
        </button>
      </div>

      <PlayerList players={players} currentTurnIndex={currentTurnIndex} />

      {isMyTurn && turnExpiresAt != null && <Timer expiresAt={turnExpiresAt} />}

      {waiting && (
        <div className="game-waiting">
          <p>Players: {players.length} / {room?.maxPlayers ?? 2}</p>
          {isCreator && (
            <button type="button" className="btn btn-primary" onClick={handleStartGame}>
              Start game
            </button>
          )}
        </div>
      )}

      {gameState === "playing" && (
        <>
          <div className="game-board">
            <button
              type="button"
              className="btn btn-deck"
              disabled={!isMyTurn}
              onClick={handlePickFromDeck}
            >
              Deck
            </button>
            <div className="discard-pile">
              <span className="label">Discard</span>
              {discardPile.length > 0 ? (
                <Card
                  card={discardPile[discardPile.length - 1]}
                  size="small"
                  onClick={isMyTurn ? handlePickFromDiscard : undefined}
                />
              ) : (
                <div className="card-placeholder">—</div>
              )}
            </div>
          </div>

          <div className="game-hand">
            <span className="label">Your hand</span>
            <div className="hand-cards">
              {hand.map((c, i) => (
                <Card
                  key={`${c}-${i}`}
                  card={c}
                  onClick={
                    isMyTurn && hasPickedThisTurn ? () => handleDiscard(c) : undefined
                  }
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            disabled={!isMyTurn}
            onClick={handleDeclare}
          >
            Declare
          </button>
        </>
      )}
    </div>
  );
}
