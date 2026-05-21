import { useGameStore } from './store/gameStore';
import SetupScreen from './components/SetupScreen';
import Board from './components/Board';
import VictoryScreen from './components/VictoryScreen';

export default function App() {
  const { screen, players, currentPlayer, mode, setMode } = useGameStore();

  if (screen === 'setup') return <SetupScreen />;
  if (screen === 'victory') return <VictoryScreen />;

  const active = players[currentPlayer];
  const other = players[1 - currentPlayer];

  return (
    <div className="game-screen">
      {/* Top bar: both player chips */}
      <div className="game-topbar">
        <div
          className={`player-chip ${currentPlayer === 1 ? 'active' : ''}`}
          style={{ '--chip-color': players[1].hex }}
        >
          <div className="chip-dot" />
          <div className="chip-info">
            <span className="chip-name">{players[1].name}</span>
            <span className="chip-goal">↓ ligne 9</span>
          </div>
        </div>

        <span className="game-logo-center">◆</span>

        <div
          className={`player-chip reverse ${currentPlayer === 0 ? 'active' : ''}`}
          style={{ '--chip-color': players[0].hex }}
        >
          <div className="chip-dot" />
          <div className="chip-info">
            <span className="chip-name">{players[0].name}</span>
            <span className="chip-goal">↑ ligne 1</span>
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="game-board-area">
        <Board />
      </div>

      {/* Bottom: turn + mode toggle */}
      <div className="game-bottombar">
        <div className="turn-label">
          Tour de <strong style={{ color: active.hex }}>{active.name}</strong>
        </div>
        <div className="mode-toggle">
          <button
            className={`mode-btn ${mode === 'move' ? 'mode-active' : ''}`}
            style={{ '--active-color': active.hex }}
            onClick={() => setMode('move')}
          >
            <span className="mode-btn-icon">🚶</span>
            Déplacer
          </button>
          <button
            className={`mode-btn ${mode === 'barrier' ? 'mode-active' : ''}`}
            style={{ '--active-color': active.hex }}
            onClick={() => setMode('barrier')}
          >
            <span className="mode-btn-icon">🧱</span>
            Barrière
          </button>
        </div>
      </div>
    </div>
  );
}
