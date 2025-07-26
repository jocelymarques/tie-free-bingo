import { defineFlow } from 'genkit';
import { z } from 'zod';
import { ai } from '../genkit';

export const drawBingoNumberFlow = defineFlow(
  {
    name: 'drawBingoNumberFlow',
    inputSchema: z.object({ drawnNumbers: z.array(z.number()) }),
    outputSchema: z.object({ newNumber: z.number() }),
  },
  async ({ drawnNumbers }) => {
    // Create a list of all possible numbers (1-75)
    const allNumbers = Array.from({ length: 75 }, (_, i) => i + 1);

    // Determine the available numbers
    const availableNumbers = allNumbers.filter(
      (num) => !drawnNumbers.includes(num)
    );

    if (availableNumbers.length === 0) {
      throw new Error('No more numbers to draw.');
    }

    const prompt = `You are a bingo caller for a 75-ball bingo game. You need to select a single, new, unique number.
The numbers that have already been drawn are: [${drawnNumbers.join(', ')}].
The numbers that are still available to be drawn are: [${availableNumbers.join(', ')}].
Please select one number from the list of available numbers.
Your response must be a single number only.`;

    const llmResponse = await ai.generate({
      prompt: prompt,
      config: {
        temperature: 1, // High temperature for more randomness in selection
      },
    });

    const textResponse = llmResponse.text().trim();
    const newNumber = parseInt(textResponse, 10);

    // Validate the AI's response
    if (
      !isNaN(newNumber) &&
      newNumber >= 1 &&
      newNumber <= 75 &&
      !drawnNumbers.includes(newNumber)
    ) {
      return { newNumber };
    } else {
      // Fallback logic: if the AI fails to provide a valid number, pick one randomly.
      const randomIndex = Math.floor(Math.random() * availableNumbers.length);
      return { newNumber: availableNumbers[randomIndex] };
    }
  }
);
