
'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
    collection, 
    doc, 
    addDoc, 
    updateDoc, 
    onSnapshot, 
    arrayUnion,
    getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { type Room, type Player, BingoNumber } from '@/lib/types';
import { generateBingoCard, checkWin } from '@/lib/bingo';

export function useBingo() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'rooms'), (snapshot) => {
      const roomsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room));
      setRooms(roomsData);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const addRoom = async (name: string): Promise<Room> => {
    const newRoomData = {
      name,
      players: [],
      draw: {
        drawnNumbers: [],
      },
      winner: null,
    };
    const docRef = await addDoc(collection(db, 'rooms'), newRoomData);
    const newRoom = { id: docRef.id, ...newRoomData } as Room;
    return newRoom;
  };

  const addPlayer = async (roomId: string, playerName: string): Promise<Player | null> => {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);
    if (!roomSnap.exists()) return null;

    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name: playerName,
      card: generateBingoCard(),
    };

    await updateDoc(roomRef, {
      players: arrayUnion(newPlayer)
    });
    return newPlayer;
  };

  const drawNumber = async (roomId: string, newNumber: number) => {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);
    const room = roomSnap.data() as Room;

    if (!room || room.winner || room.draw.drawnNumbers.includes(newNumber)) return;

    const drawnNumbers = [...room.draw.drawnNumbers, newNumber];
    let winnerId: string | undefined = undefined;

    for (const player of room.players) {
        if(checkWin(player, drawnNumbers)) {
            winnerId = player.id;
            break;
        }
    }
    
    await updateDoc(roomRef, {
        'draw.drawnNumbers': drawnNumbers,
        'winner': winnerId ?? null,
    });
  };

  const getRoom = (id: string): Room | undefined => {
    return rooms.find(room => room.id === id);
  }
  
  return {
    loading,
    rooms,
    getRoom,
    addRoom,
    addPlayer,
    drawNumber,
  };
}
