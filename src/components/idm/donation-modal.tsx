'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Gift, X } from 'lucide-react';
import { toast } from 'sonner';

interface DonationModalProps {
  open: boolean;
  onClose: () => void;
  type?: 'weekly' | 'season';
  amount?: number;
}

export function DonationModal({ open, onClose, type = 'season', amount }: DonationModalProps) {
  const [donorName, setDonorName] = useState('');
  const [donationAmount, setDonationAmount] = useState(amount?.toString() || '');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!donorName || !donationAmount) {
      toast.error('Isi nama dan jumlah donasi');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorName,
          amount: parseInt(donationAmount),
          message,
          type,
        }),
      });

      if (res.ok) {
        toast.success('Terima kasih atas donasi Anda! 🎉');
        setDonorName('');
        setDonationAmount('');
        setMessage('');
        onClose();
      } else {
        toast.error('Gagal mengirim donasi');
      }
    } catch {
      toast.error('Gagal mengirim donasi');
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-400" />
            {type === 'season' ? 'Donasi Musim' : 'Sawer Prize Pool'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label className="text-xs">Nama Donatur</Label>
            <Input value={donorName} onChange={(e) => setDonorName(e.target.value)} placeholder="Nama Anda" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Jumlah (Rp)</Label>
            <Input type="number" value={donationAmount} onChange={(e) => setDonationAmount(e.target.value)} placeholder="50000" className="mt-1" />
            <div className="flex gap-2 mt-2">
              {[10000, 25000, 50000, 100000].map(a => (
                <button key={a} onClick={() => setDonationAmount(a.toString())} className="px-2 py-1 text-[10px] rounded-md bg-muted hover:bg-muted/80 transition-colors">
                  {a >= 1000 ? `${a / 1000}K` : a}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs">Pesan (Opsional)</Label>
            <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Good luck!" className="mt-1" />
          </div>
          <Button onClick={handleSubmit} disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold hover:opacity-90">
            {loading ? 'Mengirim...' : 'Kirim Donasi'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
