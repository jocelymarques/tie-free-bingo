import { type Player, type BingoNumber } from './types';

const BINGO_COLS: Record<number, { min: number; max: number }> = {
  0: { min: 1, max: 15 },  // B
  1: { min: 16, max: 30 }, // I
  2: { min: 31, max: 45 }, // N
  3: { min: 46, max: 60 }, // G
  4: { min: 61, max: 75 }, // O
};
const CARD_SIZE = 5;

// Generates a random, unique set of numbers for a single column.
function generateColumn(colIndex: number): number[] {
  const { min, max } = BINGO_COLS[colIndex];
  const column = new Set<number>();
  const numbersToGenerate = colIndex === 2 ? 4 : 5; // N column has the FREE space

  while (column.size < numbersToGenerate) {
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    column.add(randomNumber);
  }
  return Array.from(column);
}

// Generates a full 5x5 bingo card.
export function generateBingoCard(): BingoNumber[][] {
  const card: BingoNumber[][] = Array(CARD_SIZE).fill(null).map(() => Array(CARD_SIZE));

  for (let col = 0; col < CARD_SIZE; col++) {
    const columnNumbers = generateColumn(col);
    for (let row = 0; row < CARD_SIZE; row++) {
      if (col === 2 && row === 2) {
        card[row][col] = 'FREE';
      } else {
        card[row][col] = columnNumbers.pop() as number;
      }
    }
  }
  return card;
}

// Checks if a player has won by marking the entire card.
export function checkWin(player: Player, drawnNumbers: number[]): boolean {
    const card = player.card;
    const marked = new Set<BingoNumber>([...drawnNumbers, 'FREE']);

    for (let i = 0; i < CARD_SIZE; i++) {
        let rowWin = true;
        let colWin = true;
        for (let j = 0; j < CARD_SIZE; j++) {
            if (!marked.has(card[i][j])) rowWin = false;
            if (!marked.has(card[j][i])) colWin = false;
        }
        if (rowWin || colWin) return true;
    }

    let diag1Win = true;
    let diag2Win = true;
    for (let i = 0; i < CARD_SIZE; i++) {
        if (!marked.has(card[i][i])) diag1Win = false;
        if (!marked.has(card[i][CARD_SIZE - 1 - i])) diag2Win = false;
    }
    if (diag1Win || diag2Win) return true;

    return false;
}
