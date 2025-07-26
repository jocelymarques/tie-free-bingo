
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
import { type Room, type Player } from '@/lib/types';
import { generateBingoCard } from '@/lib/bingo';

// Simple alphanumeric ID generator to avoid issues with special characters in Firestore.
const generateSimpleId = (length = 16) => {
    return Array.from(crypto.getRandomValues(new Uint8Array(length)))
        .map((b) => b.toString(36).padStart(2, '0'))
        .join('')
        .slice(0, length);
};


export function useBingo() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'rooms'), (snapshot) => {
      const roomsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room));
      setRooms(roomsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Erro ao escutar atualizações de salas:", error);
      setIsLoading(false);
    });
    return () => {
      unsub();
    };
  }, []);

  const addRoom = async (name: string): Promise<string> => {
    try {
      const newRoomData = {
        name,
        players: [],
        draw: {
          drawnNumbers: [],
        },
        winner: null,
      };
      const docRef = await addDoc(collection(db, 'rooms'), newRoomData);
      return docRef.id;
    } catch (error) {
      console.error("Erro ao adicionar sala no Firebase:", error);
      throw error;
    }
  };

  const addPlayer = async (roomId: string, playerName: string): Promise<Player | null> => {
    const roomRef = doc(db, 'rooms', roomId);
    try {
        const roomSnap = await getDoc(roomRef);
        if (!roomSnap.exists()) {
            console.error("Erro: Sala não encontrada para adicionar jogador.");
            return null;
        }

        const newPlayer: Player = {
          id: generateSimpleId(),
          name: playerName,
          card: generateBingoCard(),
        };

        await updateDoc(roomRef, {
          players: arrayUnion(newPlayer)
        });
        return newPlayer;
    } catch (error) {
        console.error(`Erro ao adicionar jogador na sala ${roomId}:`, error);
        return null;
    }
  };

  const drawNumber = async (roomId: string, newNumber: number) => {
    const roomRef = doc(db, 'rooms', roomId);
    try {
        const roomSnap = await getDoc(roomRef);
        if (!roomSnap.exists()) {
            console.error("Erro: Sala não encontrada para sortear número.");
            return;
        }

        const room = roomSnap.data() as Room;

        if (room.winner) {
            return;
        }
        if (room.draw.drawnNumbers.includes(newNumber)) {
            return;
        }

        const drawnNumbers = [...room.draw.drawnNumbers, newNumber];
        
        await updateDoc(roomRef, {
            'draw.drawnNumbers': drawnNumbers,
        });

    } catch(error) {
        console.error(`Erro ao sortear número na sala ${roomId}:`, error);
    }
  };

  const getRoom = useCallback((id: string): Room | undefined => {
    const foundRoom = rooms.find(room => room.id === id);
    return foundRoom;
  }, [rooms]);
  
  return {
    rooms,
    isLoading,
    getRoom,
    addRoom,
    addPlayer,
    drawNumber,
  };
}
