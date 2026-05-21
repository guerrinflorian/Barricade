/**
 * BFS to check if a player can reach their goal row.
 * barriers: Set of strings like "h-r-c" (horizontal) or "v-r-c" (vertical)
 * A horizontal barrier "h-r-c" blocks movement between row r and r+1
 *   at columns c and c+1 (0-indexed).
 * A vertical barrier "v-r-c" blocks movement between col c and c+1
 *   at rows r and r+1 (0-indexed).
 */
export function canReachGoal(startRow, startCol, goalRow, barriers) {
  const visited = new Set();
  const queue = [[startRow, startCol]];
  visited.add(`${startRow},${startCol}`);

  while (queue.length > 0) {
    const [r, c] = queue.shift();
    if (r === goalRow) return true;

    for (const [nr, nc] of getNeighbors(r, c, barriers)) {
      const key = `${nr},${nc}`;
      if (!visited.has(key)) {
        visited.add(key);
        queue.push([nr, nc]);
      }
    }
  }
  return false;
}

/**
 * Returns accessible neighbors from (r, c) given placed barriers.
 */
export function getNeighbors(r, c, barriers) {
  const neighbors = [];

  // Up: r -> r-1, blocked by horizontal barrier h-(r-1)-c or h-(r-1)-(c-1)
  if (r > 0 && !isBlockedH(r - 1, c, barriers)) neighbors.push([r - 1, c]);
  // Down: r -> r+1, blocked by horizontal barrier h-r-c or h-r-(c-1)
  if (r < 8 && !isBlockedH(r, c, barriers)) neighbors.push([r + 1, c]);
  // Left: c -> c-1, blocked by vertical barrier v-(r-1)-c or v-r-c...
  if (c > 0 && !isBlockedV(r, c - 1, barriers)) neighbors.push([r, c - 1]);
  // Right: c -> c+1
  if (c < 8 && !isBlockedV(r, c, barriers)) neighbors.push([r, c + 1]);

  return neighbors;
}

/**
 * Horizontal barrier "h-r-c" blocks vertical movement between rows r and r+1
 * at columns c and c+1.
 * Moving UP from (r+1, col) or DOWN from (r, col) is blocked if:
 *   barriers has "h-r-c" where c == col OR c == col-1
 */
function isBlockedH(r, c, barriers) {
  // barrier "h-r-c" covers columns c and c+1
  return barriers.has(`h-${r}-${c}`) || barriers.has(`h-${r}-${c - 1}`);
}

/**
 * Vertical barrier "v-r-c" blocks horizontal movement between cols c and c+1
 * at rows r and r+1.
 * Moving LEFT from (row, c+1) or RIGHT from (row, c) is blocked if:
 *   barriers has "v-r-c" where r == row OR r == row-1
 */
function isBlockedV(r, c, barriers) {
  // barrier "v-r-c" covers rows r and r+1
  return barriers.has(`v-${r}-${c}`) || barriers.has(`v-${r - 1}-${c}`);
}

/**
 * Validate a new barrier placement:
 * - Must be within grid bounds
 * - Must not overlap or cross existing barriers
 * - Must not block either player from their goal
 */
export function isBarrierValid(type, r, c, barriers, players) {
  // Bounds check
  if (type === 'h') {
    if (r < 0 || r > 7 || c < 0 || c > 7) return false;
  } else {
    if (r < 0 || r > 7 || c < 0 || c > 7) return false;
  }

  // Overlap/cross check
  if (!canPlaceBarrier(type, r, c, barriers)) return false;

  // BFS check: simulate placing the barrier
  const newBarriers = new Set(barriers);
  newBarriers.add(`${type}-${r}-${c}`);

  const p1 = players[0];
  const p2 = players[1];

  if (!canReachGoal(p1.row, p1.col, 0, newBarriers)) return false;
  if (!canReachGoal(p2.row, p2.col, 8, newBarriers)) return false;

  return true;
}

/**
 * Check if a barrier can be placed without overlapping or crossing existing ones.
 */
export function canPlaceBarrier(type, r, c, barriers) {
  if (type === 'h') {
    // h-r-c occupies edge between rows r/r+1 at columns c and c+1
    // Overlap: another h barrier at same position or adjacent (h-r-(c-1), h-r-(c+1) would overlap 1 cell)
    if (barriers.has(`h-${r}-${c}`)) return false;
    // Partial overlap: if h-r-(c-1) exists, it covers cols c-1,c → overlaps col c
    if (barriers.has(`h-${r}-${c - 1}`)) return false;
    // h-r-(c+1) would overlap col c+1
    if (barriers.has(`h-${r}-${c + 1}`)) return false;
    // Cross: a vertical barrier v-r-c crosses at the midpoint
    if (barriers.has(`v-${r}-${c}`)) return false;
  } else {
    // v-r-c occupies edge between cols c/c+1 at rows r and r+1
    if (barriers.has(`v-${r}-${c}`)) return false;
    if (barriers.has(`v-${r - 1}-${c}`)) return false;
    if (barriers.has(`v-${r + 1}-${c}`)) return false;
    // Cross: a horizontal barrier h-r-c crosses at the midpoint
    if (barriers.has(`h-${r}-${c}`)) return false;
  }
  return true;
}

/**
 * Get valid move positions for a player, including jump moves.
 */
export function getValidMoves(activePlayer, otherPlayer, barriers) {
  const { row, col } = activePlayer;
  const basicNeighbors = getNeighbors(row, col, barriers);
  const moves = [];

  for (const [nr, nc] of basicNeighbors) {
    if (nr === otherPlayer.row && nc === otherPlayer.col) {
      // Adjacent to opponent → jump logic
      const jumpMoves = getJumpMoves(row, col, nr, nc, otherPlayer, barriers);
      moves.push(...jumpMoves);
    } else {
      moves.push([nr, nc]);
    }
  }

  return moves;
}

function getJumpMoves(fromR, fromC, oppR, oppC, otherPlayer, barriers) {
  const dr = oppR - fromR;
  const dc = oppC - fromC;
  const jumpR = oppR + dr;
  const jumpC = oppC + dc;

  // Straight jump: if behind opponent is open
  if (jumpR >= 0 && jumpR <= 8 && jumpC >= 0 && jumpC <= 8) {
    const straightBlocked =
      (dr !== 0 && isBlockedHDir(oppR, oppC, dr, barriers)) ||
      (dc !== 0 && isBlockedVDir(oppR, oppC, dc, barriers));

    if (!straightBlocked) {
      return [[jumpR, jumpC]];
    }
  }

  // Diagonal jumps: perpendicular to direction of approach
  const diagonals = [];
  if (dr !== 0) {
    // Moving vertically, diagonal left/right
    for (const ddc of [-1, 1]) {
      if (oppC + ddc >= 0 && oppC + ddc <= 8) {
        if (!isBlockedVDir(oppR, oppC, ddc, barriers)) {
          diagonals.push([oppR, oppC + ddc]);
        }
      }
    }
  } else {
    // Moving horizontally, diagonal up/down
    for (const ddr of [-1, 1]) {
      if (oppR + ddr >= 0 && oppR + ddr <= 8) {
        if (!isBlockedHDir(oppR, oppC, ddr, barriers)) {
          diagonals.push([oppR + ddr, oppC]);
        }
      }
    }
  }
  return diagonals;
}

function isBlockedHDir(r, c, dr, barriers) {
  if (dr > 0) return isBlockedH(r, c, barriers);
  if (dr < 0) return isBlockedH(r - 1, c, barriers);
  return false;
}

function isBlockedVDir(r, c, dc, barriers) {
  if (dc > 0) return isBlockedV(r, c, barriers);
  if (dc < 0) return isBlockedV(r, c - 1, barriers);
  return false;
}
