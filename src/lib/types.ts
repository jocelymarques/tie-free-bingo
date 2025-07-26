'use server';

export type BingoNumber = number | 'FREE';

export interface Player {
  id: string;
  name: string;
  card: BingoNumber[]; // Alterado de BingoNumber[][] para BingoNumber[]
}

export interface Draw {
    drawnNumbers: number[];
}

export interface Room {
  id: string;
  name: string;
  players: Player[];
  draw: Draw,
  winner?: string | null; // playerId
}
