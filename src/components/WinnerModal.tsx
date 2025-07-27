
'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Crown } from 'lucide-react';

interface WinnerModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  winnerName: string;
  winnerRank?: number;
}

export function WinnerModal({ isOpen, setIsOpen, winnerName, winnerRank }: WinnerModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader className="items-center">
            <Crown className="h-20 w-20 text-yellow-400 mb-4" />
          <DialogTitle className="text-3xl font-headline">BINGO!</DialogTitle>
          <DialogDescription className="text-lg pt-2">
            Parabéns para <strong className="text-primary">{winnerName}</strong>!
            {winnerRank ? ` Ele(a) completou a cartela e ficou em ${winnerRank}º lugar!` : ' Ele(a) venceu!'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button type="button" onClick={() => setIsOpen(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
