'use client';

import { useState, useCallback, useTransition } from 'react';
import { type Room } from '@/lib/types';
import { useBingo } from '@/hooks/useBingo';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { drawNumberAction } from '@/app/actions';

interface DrawControlModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  room: Room;
}

export function DrawControlModal({ isOpen, setIsOpen, room }: DrawControlModalProps) {
  const { drawNumber } = useBingo();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleDraw = useCallback(async () => {
    if (room.winner) {
        toast({ variant: 'destructive', title: 'Jogo Finalizado', description: 'Um vencedor já foi declarado.' });
        return;
    };
    if (room.draw.drawnNumbers.length >= 75) {
        toast({ variant: 'destructive', title: 'Jogo Finalizado', description: 'Todos os números já foram sorteados.' });
        return;
    }

    startTransition(async () => {
      try {
        const result = await drawNumberAction({ drawnNumbers: room.draw.drawnNumbers });
        if (result.error) {
          toast({ variant: 'destructive', title: 'Erro no Sorteio', description: result.error });
        } else if (result.newNumber) {
          drawNumber(room.id, result.newNumber);
        }
      } catch (e) {
        toast({ variant: 'destructive', title: 'Erro no Sorteio', description: 'Não foi possível sortear um novo número.' });
      }
    });
  }, [room.id, room.draw.drawnNumbers, room.winner, drawNumber, toast]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Controle do Sorteio</DialogTitle>
          <DialogDescription>
            Sorteie um novo número para todos os jogadores na sala.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 text-center">
            <Button 
                onClick={handleDraw} 
                disabled={isPending || !!room.winner}
                size="lg"
                className="w-full"
            >
                {isPending ? <Loader2 className="animate-spin" /> : <Zap />}
                Sortear Novo Número
            </Button>
        </div>
        <DialogFooter>
           <p className="text-sm text-muted-foreground text-center w-full">
            Um novo número será sorteado e exibido para todos os jogadores.
           </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
