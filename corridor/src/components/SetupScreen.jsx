import { useGameStore, PLAYER_COLORS } from '../store/gameStore';
import './SetupScreen.css';

export default function SetupScreen() {
  const { setupPlayers, setSetupPlayer, startGame } = useGameStore();

  const canStart =
    setupPlayers[0].colorId !== setupPlayers[1].colorId &&
    setupPlayers[0].name.trim() !== '' &&
    setupPlayers[1].name.trim() !== '';

  return (
    <div className="setup-screen">
      <div className="setup-card">
        <h1 className="setup-title">CORRIDOR</h1>
        <p className="setup-subtitle">Jeu de stratégie pour 2 joueurs</p>

        <div className="setup-players">
          {[0, 1].map(i => (
            <PlayerConfig
              key={i}
              index={i}
              player={setupPlayers[i]}
              otherColorId={setupPlayers[1 - i].colorId}
              onChange={(field, value) => setSetupPlayer(i, field, value)}
            />
          ))}
        </div>

        <button
          className="start-btn"
          onClick={startGame}
          disabled={!canStart}
        >
          Commencer la partie
        </button>
      </div>
    </div>
  );
}

function PlayerConfig({ index, player, otherColorId, onChange }) {
  const label = index === 0 ? 'Joueur 1' : 'Joueur 2';
  const goalLabel = index === 0 ? 'Objectif : ligne 1 ↑' : 'Objectif : ligne 9 ↓';

  return (
    <div className="player-config">
      <div className="player-config-header">
        <span className="player-config-label">{label}</span>
        <span className="player-config-goal">{goalLabel}</span>
      </div>
      <input
        className="player-name-input"
        type="text"
        placeholder={label}
        value={player.name}
        onChange={e => onChange('name', e.target.value)}
        maxLength={16}
      />
      <div className="color-picker">
        {PLAYER_COLORS.map(color => (
          <button
            key={color.id}
            className={`color-dot ${player.colorId === color.id ? 'selected' : ''} ${otherColorId === color.id ? 'taken' : ''}`}
            style={{ '--dot-color': color.hex }}
            onClick={() => otherColorId !== color.id && onChange('colorId', color.id)}
            title={color.label}
            disabled={otherColorId === color.id}
            aria-label={color.label}
          />
        ))}
      </div>
    </div>
  );
}
