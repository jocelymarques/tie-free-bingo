'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useBingo } from '@/hooks/useBingo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Play } from 'lucide-react';

export default function Home() {
  const { rooms, addRoom } = useBingo();
  const [newRoomName, setNewRoomName] = useState('');
  const router = useRouter();

  const handleCreateRoom = (e: FormEvent) => {
    e.preventDefault();
    if (newRoomName.trim()) {
      const newRoom = addRoom(newRoomName.trim());
      router.push(`/room/${newRoom.id}`);
    }
  };

  const handleEnterRoom = (roomId: string) => {
    router.push(`/room/${roomId}`);
  };

  return (
    <main className="container mx-auto p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-2xl space-y-8">
        <header className="text-center">
          <h1 className="text-5xl font-bold font-headline text-primary">Bingo Local</h1>
          <p className="text-muted-foreground mt-2 text-lg">Crie ou entre em uma sala para começar a jogar</p>
        </header>

        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Criar Nova Sala</CardTitle>
            <CardDescription>Dê um nome para sua nova sala de bingo.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateRoom} className="flex flex-col sm:flex-row gap-4">
              <Input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Nome da sala"
                className="flex-grow"
                aria-label="Nome da nova sala"
              />
              <Button type="submit" className="w-full sm:w-auto" disabled={!newRoomName.trim()}>
                <PlusCircle />
                Criar Sala
              </Button>
            </form>
          </CardContent>
        </Card>

        {rooms.length > 0 && (
          <Card className="w-full shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Salas Existentes</CardTitle>
               <CardDescription>Entre em uma sala criada anteriormente.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {rooms.map((room, index) => (
                  <React.Fragment key={room.id}>
                    <li className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
                      <span className="font-semibold text-lg">{room.name}</span>
                      <Button onClick={() => handleEnterRoom(room.id)} variant="ghost" size="sm">
                        <Play className="mr-2 h-4 w-4" />
                        Entrar
                      </Button>
                    </li>
                    {index < rooms.length - 1 && <Separator />}
                  </React.Fragment>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
