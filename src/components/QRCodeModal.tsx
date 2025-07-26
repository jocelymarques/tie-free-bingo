
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import QRCode from "react-qr-code";

interface QRCodeModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  url: string;
  roomName: string;
}

export function QRCodeModal({ isOpen, setIsOpen, url, roomName }: QRCodeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center font-headline text-2xl">Sala: {roomName}</DialogTitle>
          <DialogDescription className="text-center">
            Aponte a câmera do seu celular para o QR Code para entrar na sala.
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 bg-white rounded-lg flex items-center justify-center">
            {url ? (
                <QRCode
                    size={256}
                    value={url}
                    viewBox={`0 0 256 256`}
                />
            ) : null}
        </div>
        <DialogFooter className="sm:justify-center">
          <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
