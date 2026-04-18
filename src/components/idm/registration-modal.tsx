'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface RegistrationModalProps {
  open: boolean;
  onClose: () => void;
}

export function RegistrationModal({ open, onClose }: RegistrationModalProps) {
  const [name, setName] = useState('');
  const [gamertag, setGamertag] = useState('');
  const [division, setDivision] = useState<'male' | 'female'>('male');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !gamertag) {
      toast.error('Nama dan gamertag wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, gamertag, division, city, phone }),
      });

      if (res.ok) {
        toast.success('Registrasi berhasil! Selamat berkompetisi 🎉');
        setName('');
        setGamertag('');
        setCity('');
        setPhone('');
        onClose();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Gagal mendaftar');
      }
    } catch {
      toast.error('Gagal mendaftar');
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-400" />
            Registrasi Player
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label className="text-xs">Nama Lengkap *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama Anda" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Gamertag *</Label>
            <Input value={gamertag} onChange={(e) => setGamertag(e.target.value)} placeholder="ShadowRizky99" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Divisi</Label>
            <Select value={division} onValueChange={(v) => setDivision(v as 'male' | 'female')}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">🕺 Male</SelectItem>
                <SelectItem value="female">💃 Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Kota</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Pontianak" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">WhatsApp (Opsional)</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08123456789" className="mt-1" />
          </div>
          <Button onClick={handleSubmit} disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold hover:opacity-90">
            {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
