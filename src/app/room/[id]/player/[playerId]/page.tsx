
'use client';

import React, { useMemo, useState, useEffect, useCallback, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useBingo } from '@/hooks/useBingo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Gamepad, Zap, Loader2 } from 'lucide-react';
import { WinnerModal } from '@/components/WinnerModal';
import { cn } from '@/lib/utils';
import { BingoCard } from '@/components/BingoCard';
import { drawNumberAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';


const BINGO_LETTERS = ['B', 'I', 'N', 'G', 'O'];

export default function PlayerPage() {
  const [isWinnerModalOpen, setWinnerModalOpen] = useState(false);
  const { getRoom, drawNumber, isLoading: isBingoLoading } = useBingo();
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;
  const playerId = params.playerId as string;
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const room = useMemo(() => getRoom(roomId), [getRoom, roomId]);
  const player = useMemo(() => room?.players.find(p => p.id === playerId), [room, playerId]);

  const winner = useMemo(() => room?.winner ? room.players.find(p => p.id === room.winner) : null, [room]);
  
  useEffect(() => {
    if (winner && winner.id === playerId) {
      setWinnerModalOpen(true);
    }
  }, [winner, playerId]);

  const handleDraw = useCallback(async () => {
    if (!room) return;
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
          await drawNumber(room.id, result.newNumber);
        }
      } catch (e) {
        toast({ variant: 'destructive', title: 'Erro no Sorteio', description: 'Não foi possível sortear um novo número.' });
      }
    });
  }, [room, drawNumber, toast]);


  if (isBingoLoading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin h-8 w-8" /> Carregando Jogador...</div>;
  }
  
  if (!room || !player) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <h2 className="text-2xl font-bold text-destructive mb-4">Sala ou Jogador não encontrado</h2>
        <p className="text-muted-foreground mb-6">Verifique o link ou volte para o início.</p>
        <Button onClick={() => router.push('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para o Início
        </Button>
      </div>
    );
  }
  
  const lastDrawnNumber = room.draw.drawnNumbers[room.draw.drawnNumbers.length - 1];

  return (
    <div className="min-h-screen bg-background flex flex-col">
       <header className="container mx-auto p-4 flex items-center justify-start">
          <Button variant="outline" onClick={() => router.push(`/room/${roomId}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Sala
          </Button>
      </header>

      <div className="container mx-auto flex flex-col items-center justify-center flex-grow">
        <div className="text-center">
            <h1 className="text-2xl font-bold font-headline text-primary">Cartela de {player.name}</h1>
            <p className="text-muted-foreground">{room.name}</p>
        </div>
        <div className="flex flex-col items-center gap-4 my-4">
            {lastDrawnNumber && (
                <div className="flex flex-col items-center">
                    <span className="text-xs text-muted-foreground">Último número</span>
                    <div key={lastDrawnNumber} className="flex items-center justify-center p-1 rounded-full aspect-square text-2xl font-bold bg-accent text-accent-foreground shadow-lg h-16 w-16 animate-ball-pop">
                        {lastDrawnNumber}
                    </div>
                </div>
            )}
            <Button size="lg" onClick={handleDraw} disabled={isPending || !!room.winner} className="w-full sm:w-auto text-lg p-6">
                {isPending ? <Loader2 className="animate-spin" /> : <Zap />}
                Sortear Número
            </Button>
        </div>
      </div>

      <main className="container mx-auto flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 p-4 mb-8">
        <div className="md:col-span-2">
            <Card className="h-full shadow-lg">
                <CardHeader className="text-center p-2 sm:p-4">
                    <div className="grid grid-cols-5 gap-1 text-2xl sm:text-4xl font-bold text-primary font-headline">
                        {BINGO_LETTERS.map(letter => <div key={letter}>{letter}</div>)}
                    </div>
                </CardHeader>
                <CardContent className="p-2 sm:p-4">
                    <BingoCard playerCard={player.card} drawnNumbers={room.draw.drawnNumbers} />
                </CardContent>
            </Card>
        </div>

        <div className="md:col-span-1">
            <Card className="h-full flex flex-col shadow-lg">
                <CardHeader>
                    <CardTitle className="font-headline text-xl">Números Sorteados ({room.draw.drawnNumbers.length})</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow p-0">
                    <ScrollArea className="h-[calc(100%-1rem)] p-6">
                        {room.draw.drawnNumbers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                <Gamepad className="h-12 w-12 mb-4" />
                                <p>Aguardando início do sorteio...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 text-center">
                                {[...room.draw.drawnNumbers].reverse().map((num) => (
                                    <div key={num} className={cn(
                                        "flex items-center justify-center p-1 rounded-full aspect-square text-lg font-bold transition-all duration-300 h-12 w-12",
                                        num === lastDrawnNumber ? "bg-accent text-accent-foreground shadow-lg" : "bg-primary/10 text-primary"
                                    )}>
                                        {num}
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
      </main>

      {winner && (
        <WinnerModal 
          isOpen={isWinnerModalOpen} 
          setIsOpen={setWinnerModalOpen} 
          winnerName={winner.name} 
        />
      )}
    </div>
  );
}
