'use client';

import { type BingoNumber } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

interface BingoCardProps {
  playerCard: BingoNumber[]; // Updated to accept a flat array
  drawnNumbers: number[];
}

export function BingoCard({ playerCard, drawnNumbers }: BingoCardProps) {
  const markedNumbers = new Set(drawnNumbers);

  // The card is now a flat array of 25 items. The parent grid will handle the 5x5 layout.
  return (
    <div className="grid grid-cols-5 gap-1 sm:gap-2 aspect-square">
      {playerCard.map((number, index) => {
        const isMarked = number === 'FREE' || markedNumbers.has(number);
        
        return (
          <div
            key={index}
            className={cn(
              'flex items-center justify-center rounded-md aspect-square transition-all duration-300 border-2',
              'text-lg sm:text-2xl md:text-3xl font-bold',
              isMarked 
                ? 'bg-primary text-primary-foreground scale-105 shadow-inner' 
                : 'bg-secondary text-secondary-foreground'
            )}
            aria-label={`Número ${number}`}
            role="gridcell"
          >
            {number === 'FREE' ? (
              <Star className="h-8 w-8 text-yellow-400" />
            ) : (
              number
            )}
          </div>
        );
      })}
    </div>
  );
}
