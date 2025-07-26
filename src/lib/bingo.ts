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

// Checks if a player has won by completing the entire card (Blackout).
export function checkWin(player: Player, drawnNumbers: number[]): boolean {
    const card = player.card;
    const marked = new Set<BingoNumber>([...drawnNumbers, 'FREE']);

    // Check if every number on the card is in the marked set.
    for (const number of card) {
        if (!marked.has(number)) {
            // If even one number is not marked, the player has not won yet.
            return false;
        }
    }

    // If all numbers are marked, it's a win.
    return true;
}
