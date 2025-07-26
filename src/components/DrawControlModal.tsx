'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { type Room } from '@/lib/types';
import { useBingo } from '@/hooks/useBingo';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Pause, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { drawNumberAction } from '@/app/actions';

interface DrawControlModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  room: Room;
}

export function DrawControlModal({ isOpen, setIsOpen, room }: DrawControlModalProps) {
  const { setDrawConfig, drawNumber } = useBingo();
  const [intervalSeconds, setIntervalSeconds] = useState(room.draw.interval);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleDraw = useCallback(async () => {
    if (room.winner) return;

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

  useEffect(() => {
    if (!isOpen || room.draw.isPaused || room.winner) {
      return;
    }

    const timer = setInterval(() => {
      handleDraw();
    }, room.draw.interval * 1000);

    return () => clearInterval(timer);
  }, [isOpen, room.draw.isPaused, room.draw.interval, room.winner, handleDraw]);


  const handleTogglePlay = () => {
    if(room.winner) {
        toast({ variant: 'destructive', title: 'Jogo Finalizado', description: 'Um vencedor já foi declarado.' });
        return;
    }
    setDrawConfig(room.id, !room.draw.isPaused, intervalSeconds);
  };
  
  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      if (!isNaN(value) && value > 0) {
        setIntervalSeconds(value);
        if(room.draw.isPaused){ // Only update config if paused to avoid restart
            setDrawConfig(room.id, room.draw.isPaused, value);
        }
      }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Controle do Sorteio</DialogTitle>
          <DialogDescription>
            Inicie, pause ou configure o sorteio de números para a sala.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="interval" className="text-right">
              Intervalo
            </Label>
            <Input
              id="interval"
              type="number"
              value={intervalSeconds}
              onChange={handleIntervalChange}
              className="col-span-3"
              min="1"
              disabled={!room.draw.isPaused || !!room.winner}
            />
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button onClick={handleDraw} disabled={isPending || !!room.winner}>
                {isPending ? <Loader2 className="animate-spin" /> : "Sortear Manual"}
            </Button>
            <Button onClick={handleTogglePlay} disabled={isPending || !!room.winner}>
                {room.draw.isPaused ? <Play className="mr-2 h-4 w-4" /> : <Pause className="mr-2 h-4 w-4" />}
                {room.draw.isPaused ? 'Iniciar Sorteio' : 'Pausar Sorteio'}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
