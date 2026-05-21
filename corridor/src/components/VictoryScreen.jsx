import { useGameStore } from '../store/gameStore';
import './VictoryScreen.css';

export default function VictoryScreen() {
  const { players, winner, restartGame } = useGameStore();
  const w = players[winner];

  return (
    <div className="victory-screen">
      <div className="victory-card">
        <div className="victory-confetti">
          {Array.from({ length: 18 }, (_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                '--c-delay': `${(i * 0.13) % 1.8}s`,
                '--c-x': `${(i * 41 + 8) % 100}%`,
                '--c-color': i % 3 === 0 ? w.hex : i % 3 === 1 ? 'rgba(255,255,255,0.4)' : 'rgba(200,255,87,0.6)',
              }}
            />
          ))}
        </div>

        <div className="victory-pawn" style={{ '--pawn-color': w.hex }}>
          {w.name.charAt(0).toUpperCase()}
        </div>

        <div className="victory-winner" style={{ color: w.hex }}>{w.name}</div>
        <div className="victory-sub">a remporté la partie !</div>

        <button className="victory-replay-btn" onClick={restartGame}>
          Rejouer
        </button>
      </div>
    </div>
  );
}
