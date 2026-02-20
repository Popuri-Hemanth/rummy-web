import React from "react";

export default function Timer({ expiresAt }) {
  const [secondsLeft, setSecondsLeft] = React.useState(null);

  React.useEffect(() => {
    if (expiresAt == null) {
      setSecondsLeft(null);
      return;
    }
    const tick = () => {
      const now = Date.now();
      const left = Math.max(0, Math.ceil((expiresAt - now) / 1000));
      setSecondsLeft(left);
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (secondsLeft == null) return null;
  return (
    <div className="timer">
      <span className="timer-label">Time:</span> {secondsLeft}s
    </div>
  );
}
