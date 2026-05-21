import { create } from 'zustand';
import { getValidMoves, isBarrierValid } from '../logic/bfs';

export const PLAYER_COLORS = [
  { id: 'coral',    hex: '#FF6B6B', label: 'Coral' },
  { id: 'sky',      hex: '#4ECDC4', label: 'Teal' },
  { id: 'amber',    hex: '#FFD93D', label: 'Amber' },
  { id: 'violet',   hex: '#C77DFF', label: 'Violet' },
  { id: 'lime',     hex: '#6BCB77', label: 'Lime' },
  { id: 'blue',     hex: '#4D96FF', label: 'Blue' },
  { id: 'rose',     hex: '#FF6EB4', label: 'Rose' },
  { id: 'orange',   hex: '#FF9A3C', label: 'Orange' },
];

const initialPlayerState = () => ([
  { id: 0, name: 'Joueur 1', colorId: 'coral',  hex: '#FF6B6B', row: 8, col: 4, goal: 0 },
  { id: 1, name: 'Joueur 2', colorId: 'sky',    hex: '#4ECDC4', row: 0, col: 4, goal: 8 },
]);

export const useGameStore = create((set, get) => ({
  // Screen: 'setup' | 'game' | 'victory'
  screen: 'setup',

  players: initialPlayerState(),
  barriers: new Set(),
  barrierOwners: {}, // key -> playerId
  currentPlayer: 0,
  mode: 'move', // 'move' | 'barrier'
  selectedCell: null,
  validMoves: [],
  winner: null,

  // Setup screen state
  setupPlayers: [
    { name: 'Joueur 1', colorId: 'coral' },
    { name: 'Joueur 2', colorId: 'sky' },
  ],

  setSetupPlayer: (index, field, value) => set(state => {
    const updated = [...state.setupPlayers];
    updated[index] = { ...updated[index], [field]: value };
    return { setupPlayers: updated };
  }),

  startGame: () => set(state => {
    const { setupPlayers } = state;
    const p1color = PLAYER_COLORS.find(c => c.id === setupPlayers[0].colorId);
    const p2color = PLAYER_COLORS.find(c => c.id === setupPlayers[1].colorId);
    const players = [
      { id: 0, name: setupPlayers[0].name || 'Joueur 1', colorId: setupPlayers[0].colorId, hex: p1color.hex, row: 8, col: 4, goal: 0 },
      { id: 1, name: setupPlayers[1].name || 'Joueur 2', colorId: setupPlayers[1].colorId, hex: p2color.hex, row: 0, col: 4, goal: 8 },
    ];
    return {
      screen: 'game',
      players,
      barriers: new Set(),
      barrierOwners: {},
      currentPlayer: 0,
      mode: 'move',
      selectedCell: null,
      validMoves: [],
      winner: null,
    };
  }),

  setMode: (mode) => set({ mode, selectedCell: null, validMoves: [] }),

  selectCell: (row, col) => {
    const state = get();
    const { players, currentPlayer, barriers, mode, validMoves, selectedCell } = state;
    if (mode !== 'move') return;

    const active = players[currentPlayer];

    if (row === active.row && col === active.col) {
      const other = players[1 - currentPlayer];
      const moves = getValidMoves(active, other, barriers);
      set({ selectedCell: { row, col }, validMoves: moves });
      return;
    }

    if (selectedCell && validMoves.some(([r, c]) => r === row && c === col)) {
      const newPlayers = players.map((p, i) =>
        i === currentPlayer ? { ...p, row, col } : p
      );
      const moved = newPlayers[currentPlayer];
      const won = moved.row === moved.goal;

      if (won) {
        set({ players: newPlayers, screen: 'victory', winner: currentPlayer, selectedCell: null, validMoves: [] });
      } else {
        set({ players: newPlayers, currentPlayer: 1 - currentPlayer, selectedCell: null, validMoves: [], mode: 'move' });
      }
      return;
    }

    set({ selectedCell: null, validMoves: [] });
  },

  placeBarrier: (type, r, c) => set(state => {
    const { barriers, barrierOwners, players, currentPlayer } = state;
    if (!isBarrierValid(type, r, c, barriers, players)) return {};

    const key = `${type}-${r}-${c}`;
    const newBarriers = new Set(barriers);
    newBarriers.add(key);

    return {
      barriers: newBarriers,
      barrierOwners: { ...barrierOwners, [key]: currentPlayer },
      currentPlayer: 1 - currentPlayer,
      mode: 'move',
      selectedCell: null,
      validMoves: [],
    };
  }),

  restartGame: () => set({
    screen: 'setup',
    players: initialPlayerState(),
    barriers: new Set(),
    barrierOwners: {},
    currentPlayer: 0,
    mode: 'move',
    selectedCell: null,
    validMoves: [],
    winner: null,
  }),
}));
