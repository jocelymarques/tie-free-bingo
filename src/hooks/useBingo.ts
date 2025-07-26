
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

export function useBingo() {
  const [rooms, setRooms] = useState<Room[]>([]);
  
  useEffect(() => {
    console.log("Iniciando a escuta por atualizações nas salas...");
    const unsub = onSnapshot(collection(db, 'rooms'), (snapshot) => {
      const roomsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room));
      setRooms(roomsData);
      console.log("Salas atualizadas:", roomsData);
    }, (error) => {
      console.error("Erro ao escutar atualizações de salas:", error);
    });
    return () => {
      console.log("Parando a escuta por atualizações nas salas.");
      unsub();
    };
  }, []);

  const addRoom = async (name: string): Promise<string> => {
    console.log(`Tentando adicionar uma nova sala com o nome: ${name}`);
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
      console.log(`Documento da sala criado no Firebase com ID: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error("Erro ao adicionar sala no Firebase:", error);
      throw error; // Re-lança o erro para ser pego no handleCreateRoom
    }
  };

  const addPlayer = async (roomId: string, playerName: string): Promise<Player | null> => {
    console.log(`Adicionando jogador '${playerName}' na sala '${roomId}'`);
    const roomRef = doc(db, 'rooms', roomId);
    try {
        const roomSnap = await getDoc(roomRef);
        if (!roomSnap.exists()) {
            console.error("Erro: Sala não encontrada para adicionar jogador.");
            return null;
        }

        const newPlayer: Player = {
          id: crypto.randomUUID(),
          name: playerName,
          card: generateBingoCard(),
        };

        await updateDoc(roomRef, {
          players: arrayUnion(newPlayer)
        });
        console.log("Jogador adicionado com sucesso:", newPlayer);
        return newPlayer;
    } catch (error) {
        console.error(`Erro ao adicionar jogador na sala ${roomId}:`, error);
        return null;
    }
  };

  const drawNumber = async (roomId: string, newNumber: number) => {
    console.log(`Sorteando número ${newNumber} para a sala ${roomId}`);
    const roomRef = doc(db, 'rooms', roomId);
    try {
        const roomSnap = await getDoc(roomRef);
        if (!roomSnap.exists()) {
            console.error("Erro: Sala não encontrada para sortear número.");
            return;
        }

        const room = roomSnap.data() as Room;

        if (room.winner) {
            console.log("Sorteio ignorado: a sala já tem um vencedor.");
            return;
        }
        if (room.draw.drawnNumbers.includes(newNumber)) {
            console.log(`Sorteio ignorado: o número ${newNumber} já foi sorteado.`);
            return;
        }

        const drawnNumbers = [...room.draw.drawnNumbers, newNumber];
        
        await updateDoc(roomRef, {
            'draw.drawnNumbers': drawnNumbers,
        });
        console.log(`Número ${newNumber} adicionado à lista de sorteados.`);

    } catch(error) {
        console.error(`Erro ao sortear número na sala ${roomId}:`, error);
    }
  };

  const getRoom = (id: string): Room | undefined => {
    const foundRoom = rooms.find(room => room.id === id);
    // console.log(`Buscando sala com ID ${id}. Encontrada:`, foundRoom);
    return foundRoom;
  }
  
  return {
    rooms,
    getRoom,
    addRoom,
    addPlayer,
    drawNumber,
  };
}
