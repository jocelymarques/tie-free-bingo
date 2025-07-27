
'use server';

import { drawBingoNumberFlow } from '@/ai/flows/drawBingoNumber';
import { type Room } from '@/lib/types';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { checkWin } from '@/lib/bingo';

interface DrawResult {
    newNumber?: number;
    error?: string;
}

export async function drawNumberAction({ drawnNumbers }: { drawnNumbers: number[] }): Promise<DrawResult> {
    if (drawnNumbers.length >= 75) {
        return { error: 'Todos os números já foram sorteados.' };
    }

    try {
        const result = await drawBingoNumberFlow({ drawnNumbers });
        if (result && typeof result.newNumber === 'number' && !drawnNumbers.includes(result.newNumber)) {
            return { newNumber: result.newNumber };
        }
        // If AI returns a duplicate or invalid number, fallback to random
        return drawRandomNumber(drawnNumbers);

    } catch (e) {
        // AI flow failed, using fallback
        return drawRandomNumber(drawnNumbers);
    }
}

function drawRandomNumber(drawnNumbers: number[]): DrawResult {
    const availableNumbers = Array.from({length: 75}, (_, i) => i + 1).filter(n => !drawnNumbers.includes(n));
    if (availableNumbers.length === 0) {
        return { error: 'Todos os números já foram sorteados.' };
    }
    const candidate = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
    return { newNumber: candidate };
}

export async function checkWinnerAction(roomId: string) {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);
    if (!roomSnap.exists()) {
        throw new Error("Room not found");
    }

    const room = roomSnap.data() as Room;
    if (room.winner) return; // Winner already declared

    for (const player of room.players) {
        if (checkWin(player, room.draw.drawnNumbers)) {
            await updateDoc(roomRef, { winner: player.id });
            break; 
        }
    }
}
