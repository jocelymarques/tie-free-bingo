
'use client';

import React, { useState, FormEvent, useMemo, useTransition, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useBingo } from '@/hooks/useBingo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Home, UserPlus, Gamepad2, Crown, ArrowLeft, Share2, Loader2, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { QRCodeModal } from '@/components/QRCodeModal';

export default function RoomPage() {
  const [newPlayerName, setNewPlayerName] = useState('');
  const { getRoom, addPlayer, isLoading: isBingoLoading } = useBingo();
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [roomUrl, setRoomUrl] = useState('');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  useEffect(() => {
    setRoomUrl(window.location.href);
  }, []);

  const room = useMemo(() => getRoom(roomId), [getRoom, roomId]);

  const handleAddPlayer = (e: FormEvent) => {
    e.preventDefault();
    if (newPlayerName.trim() && room && room.draw.drawnNumbers.length < 75) {
      startTransition(async () => {
          const newPlayer = await addPlayer(roomId, newPlayerName.trim());
          if (newPlayer) {
            router.push(`/room/${roomId}/player/${newPlayer.id}`);
          }
          setNewPlayerName('');
      });
    }
  };
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(roomUrl).then(() => {
        toast({
            title: "Link da sala copiado!",
            description: "Agora você pode compartilhar com outros jogadores.",
        });
    }).catch(err => {
        toast({
            title: "Falha ao copiar",
            description: "Não foi possível copiar o link da sala.",
            variant: "destructive"
        })
    });
  };

  if (isBingoLoading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin h-8 w-8" /> Carregando Sala...</div>;
  }

  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <h2 className="text-2xl font-bold text-destructive mb-4">Sala não encontrada</h2>
        <p className="text-muted-foreground mb-6">A sala que você está tentando acessar não existe ou foi removida.</p>
        <Button onClick={() => router.push('/')}>
          <Home className="mr-2 h-4 w-4" />
          Voltar para o Início
        </Button>
      </div>
    );
  }

  const isGameFinished = room.draw.drawnNumbers.length >= 75;

  return (
    <>
      <main className="container mx-auto p-4 sm:p-6 md:p-8 flex flex-col items-center min-h-screen bg-background">
        <div className="w-full max-w-3xl space-y-8">
          <header className="relative w-full text-center mb-6">
            <Button variant="ghost" size="icon" className="absolute left-0 top-1/2 -translate-y-1/2" onClick={() => router.push('/')}>
                <ArrowLeft />
                <span className="sr-only">Voltar</span>
            </Button>
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-4xl sm:text-5xl font-bold font-headline text-primary">{room.name}</h1>
              <div className="flex gap-2">
                <Button onClick={handleCopyLink} variant="outline" size="sm">
                    <Share2 className="mr-2" />
                    Copiar Link
                </Button>
                 <Button onClick={() => setIsQrModalOpen(true)} variant="outline" size="sm">
                    <QrCode className="mr-2" />
                    QR Code
                </Button>
              </div>
            </div>
          </header>

          
          <Card className="w-full shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Adicionar Novo Jogador</CardTitle>
              <CardDescription>
                {isGameFinished ? "O jogo terminou! Não é possível adicionar novos jogadores." : "Digite o nome do jogador para gerar uma cartela."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddPlayer} className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="Nome do jogador"
                  className="flex-grow"
                  aria-label="Nome do novo jogador"
                  disabled={isGameFinished || isPending}
                />
                <Button type="submit" className="w-full sm:w-auto" disabled={!newPlayerName.trim() || isGameFinished || isPending}>
                  {isPending ? <Loader2 className="animate-spin" /> : <UserPlus />}
                  Adicionar e Jogar
                </Button>
              </form>
            </CardContent>
          </Card>

          {room.players.length > 0 && (
            <Card className="w-full shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Jogadores</CardTitle>
                <CardDescription>Lista de jogadores na sala e suas colocações.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {room.players.map((player) => {
                    const winnerIndex = room.winners.indexOf(player.id);
                    const isWinner = winnerIndex !== -1;
                    
                    return (
                        <li
                          key={player.id}
                          className={`flex justify-between items-center p-4 rounded-lg transition-all ${
                            isWinner ? 'bg-accent/80 text-accent-foreground shadow-lg' : 'bg-secondary/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                              {isWinner && (
                                <div className="flex items-center gap-2 text-yellow-400">
                                    <Crown />
                                    <span className="font-bold text-lg">{winnerIndex + 1}º</span>
                                </div>
                              )}
                              <span className="font-semibold text-lg">{player.name}</span>
                          </div>
                          <Button onClick={() => router.push(`/room/${roomId}/player/${player.id}`)} variant="outline" size="sm">
                            <Gamepad2 className="mr-2 h-4 w-4" />
                            Ver Cartela
                          </Button>
                        </li>
                    )
                  })}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <QRCodeModal 
        isOpen={isQrModalOpen}
        setIsOpen={setIsQrModalOpen}
        url={roomUrl}
        roomName={room.name}
      />
    </>
  );
}
