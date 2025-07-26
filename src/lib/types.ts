export type BingoNumber = number | 'FREE';

export interface Player {
  id: string;
  name: string;
  card: BingoNumber[][];
}

export interface Room {
  id: string;
  name: string;
  players: Player[];
  draw: {
    drawnNumbers: number[];
    isPaused: boolean;
    interval: number; // in seconds
  };
  winner?: string; // playerId
}

export interface BingoData {
  rooms: Room[];
}
