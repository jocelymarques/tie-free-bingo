
'use client';

import React, { useState, FormEvent, useMemo, useTransition, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useBingo } from '@/hooks/useBingo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Home, UserPlus, Gamepad2, Crown, ArrowLeft, Share2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

export default function RoomPage() {
  const [newPlayerName, setNewPlayerName] = useState('');
  const { getRoom, addPlayer } = useBingo();
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  const room = useMemo(() => getRoom(roomId), [getRoom, roomId]);

  useEffect(() => {
    if (room) {
      setIsLoading(false);
    }
  }, [room]);


  const handleAddPlayer = (e: FormEvent) => {
    e.preventDefault();
    if (newPlayerName.trim() && room && !room.winner) {
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
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        toast({
            title: "Link da sala copiado!",
            description: "Agora você pode compartilhar com outros jogadores.",
        });
    }).catch(err => {
        console.error('Failed to copy: ', err);
        toast({
            title: "Falha ao copiar",
            description: "Não foi possível copiar o link da sala.",
            variant: "destructive"
        })
    });
  };

  if (isLoading) {
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

  const winner = room.winner ? room.players.find(p => p.id === room.winner) : null;

  return (
    <main className="container mx-auto p-4 sm:p-6 md:p-8 flex flex-col items-center min-h-screen bg-background">
      <div className="w-full max-w-3xl space-y-8">
        <header className="relative w-full text-center mb-6">
           <Button variant="ghost" size="icon" className="absolute left-0 top-1/2 -translate-y-1/2" onClick={() => router.push('/')}>
              <ArrowLeft />
              <span className="sr-only">Voltar</span>
          </Button>
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-4xl sm:text-5xl font-bold font-headline text-primary">{room.name}</h1>
            <Button onClick={handleCopyLink} variant="outline" size="sm">
                <Share2 className="mr-2" />
                Copiar Link da Sala
            </Button>
          </div>
        </header>

        {winner && (
            <Alert variant="default" className="bg-primary/10 border-primary text-primary">
                <Crown className="h-5 w-5 !text-primary" />
                <AlertTitle className="font-headline text-xl">Temos um vencedor!</AlertTitle>
                <AlertDescription className="text-base">
                    Parabéns, <strong>{winner.name}</strong>! Você completou a cartela.
                </AlertDescription>
            </Alert>
        )}

        {!room.winner && (
          <Card className="w-full shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Adicionar Novo Jogador</CardTitle>
              <CardDescription>Digite o nome do jogador para gerar uma cartela.</CardDescription>
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
                  disabled={!!room.winner || isPending}
                />
                <Button type="submit" className="w-full sm:w-auto" disabled={!newPlayerName.trim() || !!room.winner || isPending}>
                  {isPending ? <Loader2 className="animate-spin" /> : <UserPlus />}
                  Adicionar e Jogar
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {room.players.length > 0 && (
          <Card className="w-full shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Jogadores</CardTitle>
              <CardDescription>Lista de jogadores na sala.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {room.players.map((player) => (
                  <li
                    key={player.id}
                    className={`flex justify-between items-center p-4 rounded-lg transition-all ${
                      player.id === winner?.id ? 'bg-accent/80 text-accent-foreground shadow-lg' : 'bg-secondary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                        {player.id === winner?.id && <Crown className="text-yellow-400" />}
                        <span className="font-semibold text-lg">{player.name}</span>
                    </div>
                    <Button onClick={() => router.push(`/room/${roomId}/player/${player.id}`)} variant="outline" size="sm">
                      <Gamepad2 className="mr-2 h-4 w-4" />
                      Ver Cartela
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
