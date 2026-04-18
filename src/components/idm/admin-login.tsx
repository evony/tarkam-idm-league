'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/lib/store';

export function AdminLogin() {
  const { setAdminAuth, adminAuth } = useAppStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (adminAuth.isAuthenticated) return null;

  const handleLogin = async () => {
    if (!username || !password) {
      toast.error('Username dan password wajib diisi');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        setAdminAuth({ isAuthenticated: true, admin: data.admin });
        toast.success('Login berhasil! 🔐');
      } else {
        toast.error('Username atau password salah');
      }
    } catch {
      toast.error('Gagal login');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-black">Admin Login</h2>
          <p className="text-xs text-muted-foreground mt-1">IDM League Admin Panel</p>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-xs">Username</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Password</Label>
            <div className="relative mt-1">
              <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button onClick={handleLogin} disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold hover:opacity-90">
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </div>

        <p className="text-[10px] text-center text-muted-foreground">Default: admin / admin123</p>
      </div>
    </div>
  );
}
