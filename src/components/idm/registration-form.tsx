'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/lib/store';
import { useQuery } from '@tanstack/react-query';

export function RegistrationForm() {
  const { division } = useAppStore();
  const [name, setName] = useState('');
  const [gamertag, setGamertag] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        toast.success('Registrasi berhasil! 🎉');
      } else {
        toast.error(data.error || 'Gagal mendaftar');
      }
    } catch {
      toast.error('Gagal mendaftar');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <CheckCircle className="w-16 h-16 mx-auto text-green-400 mb-4" />
        <h2 className="text-2xl font-black mb-2">Registrasi Berhasil!</h2>
        <p className="text-sm text-muted-foreground mb-6">Selamat datang di IDM League, {gamertag}!</p>
        <Button onClick={() => { setSuccess(false); setName(''); setGamertag(''); setCity(''); setPhone(''); }} variant="outline">
          Daftar Lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="w-5 h-5 text-amber-400" />
            Registrasi Player
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <Select value={division} disabled>
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
            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold hover:opacity-90">
              {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
