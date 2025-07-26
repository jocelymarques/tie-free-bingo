'use client';

import { useState, useEffect, useCallback } from 'react';
import { type BingoData, type Room, type Player } from '@/lib/types';
import { generateBingoCard, checkWin } from '@/lib/bingo';

const STORAGE_KEY = 'bingo_game';

const getInitialState = (): BingoData => {
  if (typeof window === 'undefined') {
    return { rooms: [] };
  }
  try {
    const item = window.localStorage.getItem(STORAGE_KEY);
    return item ? JSON.parse(item) : { rooms: [] };
  } catch (error) {
    console.error('Error reading from localStorage', error);
    return { rooms: [] };
  }
};

export function useBingo() {
  const [data, setData] = useState<BingoData>(getInitialState);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Initial load
    const item = window.localStorage.getItem(STORAGE_KEY);
    if (item) {
        try {
            setData(JSON.parse(item));
        } catch (e) {
            console.error(e);
        }
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          setData(JSON.parse(event.newValue));
        } catch (error) {
          console.error('Error parsing storage update', error);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const updateAndSave = useCallback((newData: BingoData) => {
    setData(newData);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
        // Manually dispatch a storage event to trigger updates in the same tab
        window.dispatchEvent(new StorageEvent('storage', {
            key: STORAGE_KEY,
            newValue: JSON.stringify(newData)
        }));
      } catch (error) {
        console.error('Error writing to localStorage', error);
      }
    }
  }, []);

  const addRoom = (name: string): Room => {
    const newRoom: Room = {
      id: crypto.randomUUID(),
      name,
      players: [],
      draw: {
        drawnNumbers: [],
      },
    };
    const newData = { ...data, rooms: [...data.rooms, newRoom] };
    updateAndSave(newData);
    return newRoom;
  };

  const updateRoom = (roomId: string, updatedRoom: Partial<Room>) => {
    const newData = {
      ...data,
      rooms: data.rooms.map(room =>
        room.id === roomId ? { ...room, ...updatedRoom } : room
      ),
    };
    updateAndSave(newData);
  };
  
  const addPlayer = (roomId: string, playerName: string): Player | null => {
    const room = data.rooms.find(r => r.id === roomId);
    if (!room) return null;
    
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name: playerName,
      card: generateBingoCard(),
    };
    const updatedRoom: Room = {
      ...room,
      players: [...room.players, newPlayer],
    };
    updateRoom(roomId, updatedRoom);
    return newPlayer;
  };

  const drawNumber = (roomId: string, newNumber: number) => {
    const room = data.rooms.find(r => r.id === roomId);
    if (!room || room.winner || room.draw.drawnNumbers.includes(newNumber)) return;

    const drawnNumbers = [...room.draw.drawnNumbers, newNumber];
    let winnerId: string | undefined = undefined;

    for (const player of room.players) {
        if(checkWin(player, drawnNumbers)) {
            winnerId = player.id;
            break;
        }
    }

    const updatedRoom: Partial<Room> = {
        draw: { ...room.draw, drawnNumbers },
        winner: winnerId,
    };

    updateRoom(roomId, updatedRoom);
  };
  
  return {
    isMounted,
    rooms: data.rooms,
    addRoom,
    updateRoom,
    addPlayer,
    drawNumber,
  };
}
