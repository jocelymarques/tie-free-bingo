
'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useBingo } from '@/hooks/useBingo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Loader2 } from 'lucide-react';

export default function Home() {
  const { addRoom } = useBingo();
  const [newRoomName, setNewRoomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleCreateRoom = async (e: FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const newRoom = await addRoom(newRoomName.trim());
      if (newRoom && newRoom.id) {
        router.push(`/room/${newRoom.id}`);
      } else {
        // Handle case where room is not created, maybe show a toast
        console.error("Failed to create room, no ID returned.");
      }
    } catch (error) {
      console.error("Failed to create room:", error);
      // Optionally, show a toast to the user
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <main className="container mx-auto p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-2xl space-y-8">
        <header className="text-center">
          <h1 className="text-5xl font-bold font-headline text-primary">Bingo Online</h1>
          <p className="text-muted-foreground mt-2 text-lg">Crie uma sala para começar a jogar</p>
        </header>

        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Criar Nova Sala</CardTitle>
            <CardDescription>Dê um nome para sua nova sala de bingo. Após criar, compartilhe o link com os outros jogadores.</CardDescription>
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
                disabled={isCreating}
              />
              <Button type="submit" className="w-full sm:w-auto" disabled={!newRoomName.trim() || isCreating}>
                {isCreating ? <Loader2 className="animate-spin" /> : <PlusCircle />}
                {isCreating ? 'Criando...' : 'Criar Sala'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
