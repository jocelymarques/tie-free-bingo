'use server';

import { drawBingoNumberFlow } from '@/ai/flows/drawBingoNumber';

interface DrawResult {
    newNumber?: number;
    error?: string;
}

export async function drawNumberAction({ drawnNumbers }: { drawnNumbers: number[] }): Promise<DrawResult> {
    if (drawnNumbers.length >= 75) {
        return { error: 'Todos os números já foram sorteados.' };
    }

    try {
        const result = await drawBingoNumberFlow.run({ drawnNumbers });
        if (result && typeof result.newNumber === 'number') {
            return { newNumber: result.newNumber };
        }
        return { error: 'Não foi possível obter um novo número.' };
    } catch (e) {
        console.error("AI flow failed, using fallback", e);
        // Fallback in case AI flow fails critically
        let candidate;
        const availableNumbers = Array.from({length: 75}, (_, i) => i + 1).filter(n => !drawnNumbers.includes(n));
        if (availableNumbers.length === 0) {
            return { error: 'Todos os números já foram sorteados.' };
        }
        candidate = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
        return { newNumber: candidate };
    }
}
