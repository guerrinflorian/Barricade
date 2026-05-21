import { useState, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { isBarrierValid } from '../logic/bfs';
import './Board.css';

// Board uses a 17×17 CSS grid.
// Cell (r,c) → gridRow=r*2+1, gridCol=c*2+1
// H-gap between rows r/r+1 at col c → gridRow=r*2+2, gridCol=c*2+1
// V-gap between cols c/c+1 at row r → gridRow=r*2+1, gridCol=c*2+2
// H-barrier h-r-c spans cols c and c+1 along row-gap r
// V-barrier v-r-c spans rows r and r+1 along col-gap c

export default function Board() {
  const { players, barriers, barrierOwners, currentPlayer, mode, selectedCell, validMoves, selectCell, placeBarrier } = useGameStore();
  const [barrierPreview, setBarrierPreview] = useState(null);

  const isValidMove = (r, c) => validMoves.some(([vr, vc]) => vr === r && vc === c);
  const isSelected = (r, c) => selectedCell?.row === r && selectedCell?.col === c;

  const handleCellClick = useCallback((r, c) => {
    if (mode === 'move') selectCell(r, c);
  }, [mode, selectCell]);

  const handleGapHover = useCallback((type, r, c) => {
    if (mode !== 'barrier') return;
    const valid = isBarrierValid(type, r, c, barriers, players);
    setBarrierPreview({ type, r, c, valid });
  }, [mode, barriers, players]);

  const handleGapLeave = useCallback(() => setBarrierPreview(null), []);

  const handleGapClick = useCallback((type, r, c) => {
    if (mode !== 'barrier') return;
    if (isBarrierValid(type, r, c, barriers, players)) {
      placeBarrier(type, r, c);
      setBarrierPreview(null);
    }
  }, [mode, barriers, players, placeBarrier]);

  const els = [];

  // ── CELLS (9×9) ──
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const pawn = players.find(p => p.row === r && p.col === c);
      const valid = mode === 'move' && isValidMove(r, c);
      const selected = isSelected(r, c);

      let cls = 'b-cell';
      if (r === 0) cls += ' b-cell-goal-top';       // P1's goal (row 0 = top)
      else if (r === 8) cls += ' b-cell-goal-bottom'; // P2's goal (row 8 = bottom)
      if (valid) cls += ' b-cell-valid';
      if (selected) cls += ' b-cell-selected';

      els.push(
        <div
          key={`c-${r}-${c}`}
          className={cls}
          style={{ gridRow: r * 2 + 1, gridColumn: c * 2 + 1 }}
          onClick={() => handleCellClick(r, c)}
        >
          {pawn && (
            <div
              className={`b-pawn ${pawn.id === currentPlayer ? 'b-pawn-active' : ''}`}
              style={{ '--pawn-color': pawn.hex }}
            >
              {pawn.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      );
    }
  }

  // ── HORIZONTAL GAPS (8 rows × 9 cols) ──
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 9; c++) {
      const previewHere =
        barrierPreview?.type === 'h' && barrierPreview.r === r &&
        (barrierPreview.c === c || barrierPreview.c === c - 1);

      let cls = 'b-hgap';
      if (mode === 'barrier' && c < 8) cls += ' b-gap-hoverable';
      if (previewHere) cls += barrierPreview.valid ? ' b-gap-preview-valid' : ' b-gap-preview-invalid';

      els.push(
        <div
          key={`h-${r}-${c}`}
          className={cls}
          style={{ gridRow: r * 2 + 2, gridColumn: c * 2 + 1 }}
          onMouseEnter={() => c < 8 && handleGapHover('h', r, c)}
          onMouseLeave={handleGapLeave}
          onClick={() => c < 8 && handleGapClick('h', r, c)}
        />
      );
    }
  }

  // ── VERTICAL GAPS (9 rows × 8 cols) ──
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 8; c++) {
      const previewHere =
        barrierPreview?.type === 'v' && barrierPreview.c === c &&
        (barrierPreview.r === r || barrierPreview.r === r - 1);

      let cls = 'b-vgap';
      if (mode === 'barrier' && r < 8) cls += ' b-gap-hoverable';
      if (previewHere) cls += barrierPreview.valid ? ' b-gap-preview-valid' : ' b-gap-preview-invalid';

      els.push(
        <div
          key={`v-${r}-${c}`}
          className={cls}
          style={{ gridRow: r * 2 + 1, gridColumn: c * 2 + 2 }}
          onMouseEnter={() => r < 8 && handleGapHover('v', r, c)}
          onMouseLeave={handleGapLeave}
          onClick={() => r < 8 && handleGapClick('v', r, c)}
        />
      );
    }
  }

  // ── GAP INTERSECTIONS (8×8) ──
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      els.push(
        <div
          key={`d-${r}-${c}`}
          className="b-dot"
          style={{ gridRow: r * 2 + 2, gridColumn: c * 2 + 2 }}
        />
      );
    }
  }

  // ── PLACED BARRIERS ──
  for (const key of barriers) {
    const [type, rStr, cStr] = key.split('-');
    const r = +rStr, c = +cStr;
    const ownerHex = players[barrierOwners[key] ?? 0]?.hex ?? '#888';

    if (type === 'h') {
      els.push(
        <div
          key={`bar-${key}`}
          className="b-barrier b-barrier-h"
          style={{
            gridRow: r * 2 + 2,
            gridColumn: `${c * 2 + 1} / ${c * 2 + 4}`,
            '--barrier-color': ownerHex,
          }}
        />
      );
    } else {
      els.push(
        <div
          key={`bar-${key}`}
          className="b-barrier b-barrier-v"
          style={{
            gridRow: `${r * 2 + 1} / ${r * 2 + 4}`,
            gridColumn: c * 2 + 2,
            '--barrier-color': ownerHex,
          }}
        />
      );
    }
  }

  return (
    <div className="b-wrapper">
      <div
        className="b-board"
        style={{
          // Row 0 = P1's goal (player 0), row 8 = P2's goal (player 1)
          '--p1-goal': players[0].hex,
          '--p2-goal': players[1].hex,
        }}
      >
        {els}
      </div>
    </div>
  );
}
