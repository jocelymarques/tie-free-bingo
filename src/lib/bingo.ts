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

// Generates a full 5x5 bingo card as a flattened array.
export function generateBingoCard(): BingoNumber[] {
  const card: BingoNumber[] = Array(CARD_SIZE * CARD_SIZE);
  const tempCard: BingoNumber[][] = Array(CARD_SIZE).fill(null).map(() => []);

  for (let col = 0; col < CARD_SIZE; col++) {
    const columnNumbers = generateColumn(col);
    for (let row = 0; row < CARD_SIZE; row++) {
      if (col === 2 && row === 2) {
        tempCard[row][col] = 'FREE';
      } else {
        tempCard[row][col] = columnNumbers.pop() as number;
      }
    }
  }

  // Flatten the 2D array into a 1D array, column by column.
  for (let col = 0; col < CARD_SIZE; col++) {
    for (let row = 0; row < CARD_SIZE; row++) {
      card[col * CARD_SIZE + row] = tempCard[row][col];
    }
  }

  return card;
}

// Checks if a player has won. Works with a flattened card.
export function checkWin(player: Player, drawnNumbers: number[]): boolean {
    const card = player.card; // This is now a 1D array
    const marked = new Set<BingoNumber>([...drawnNumbers, 'FREE']);

    // Check rows and columns
    for (let i = 0; i < CARD_SIZE; i++) {
        let rowWin = true;
        let colWin = true;
        for (let j = 0; j < CARD_SIZE; j++) {
            // Check row i
            if (!marked.has(card[i * CARD_SIZE + j])) rowWin = false;
            // Check col i
            if (!marked.has(card[j * CARD_SIZE + i])) colWin = false;
        }
        if (rowWin || colWin) return true;
    }

    // Check diagonals
    let diag1Win = true;
    let diag2Win = true;
    for (let i = 0; i < CARD_SIZE; i++) {
        // Top-left to bottom-right
        if (!marked.has(card[i * CARD_SIZE + i])) diag1Win = false;
        // Top-right to bottom-left
        if (!marked.has(card[i * CARD_SIZE + (CARD_SIZE - 1 - i)])) diag2Win = false;
    }
    if (diag1Win || diag2Win) return true;

    return false;
}
