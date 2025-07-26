
export type BingoNumber = number | 'FREE';

export interface Player {
  id: string;
  name: string;
  card: BingoNumber[][];
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

export interface BingoData {
  rooms: Room[];
}
