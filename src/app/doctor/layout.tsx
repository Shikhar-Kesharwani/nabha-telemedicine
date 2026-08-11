
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Wifi, Settings, Stethoscope } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AppLogo } from '@/components/app-logo';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Doctor } from '@/types/db';
import { getDoctorByEmailForAuth } from '@/lib/services/doctors';

function getSession() {
  if (typeof window === 'undefined') return null;
  const doctorSession = localStorage.getItem('sehat-session-doctor');
  if (doctorSession) return { type: 'doctor', ...JSON.parse(doctorSession) };
  return null;
}

function logout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('sehat-session-patient');
  localStorage.removeItem('sehat-session-doctor');
}

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();
  const [doctor, setDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    async function fetchDoctor() {
      const session = getSession();
      if (session?.type === 'doctor' && session.email) {
        const doctorData = await getDoctorByEmailForAuth(session.email);
        setDoctor(doctorData);
      } else {
        router.replace('/');
      }
    }
    fetchDoctor();
  }, [router]);

  const getInitials = (name: string) =>
    name ? name.split(' ').map(n => n[0]).join('') : '';

  const handleLogout = () => {
    logout();
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    router.push('/');
  };

  if (!doctor) {
    return (
      <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid #f59e0b', borderTopColor: 'transparent', animation: 'orbit-spin 1s linear infinite' }} />
          <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600 }}>Loading Doctor Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080810' }} className="bg-grid">
      {/* Doctor Portal Header */}
      <header
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px',
          background: 'rgba(8,8,16,0.95)',
          borderBottom: '1px solid #1e1e3a',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Left: Logo + Portal badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/">
            <AppLogo />
          </Link>
          <div style={{ width: '1px', height: '24px', background: '#1e1e3a' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '100px', padding: '3px 10px' }}>
            <Stethoscope style={{ width: '12px', height: '12px', color: '#f59e0b' }} />
            <span style={{ color: '#f59e0b', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Doctor Portal</span>
          </div>
        </div>

        {/* Right: Available badge + avatar menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '100px', padding: '4px 12px' }}>
            <span className="glow-dot glow-dot-green" style={{ width: '6px', height: '6px' }} />
            <span style={{ color: '#10b981', fontSize: '0.7rem', fontWeight: 700 }}>Available</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', borderRadius: '50%', padding: '2px', transition: 'all 0.2s' }}>
                <Avatar style={{ width: '36px', height: '36px', border: '2px solid rgba(245,158,11,0.4)' }}>
                  <AvatarImage src={doctor.avatar} />
                  <AvatarFallback style={{ background: '#1e1e3a', color: '#f59e0b', fontWeight: 700 }}>
                    {doctor ? getInitials(doctor.fullName) : 'D'}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56"
              align="end"
              style={{ background: '#0d0d1a', border: '1px solid #1e1e3a', borderRadius: '12px' }}
            >
              <DropdownMenuLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <p style={{ color: '#f1f5f9', fontSize: '0.875rem', fontWeight: 700 }}>Dr. {doctor.fullName}</p>
                  <p style={{ color: '#64748b', fontSize: '0.75rem' }}>{doctor.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator style={{ background: '#1e1e3a' }} />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" style={{ color: '#94a3b8' }} />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => alert('Availability settings not implemented.')}>
                <Wifi className="mr-2 h-4 w-4" style={{ color: '#94a3b8' }} />
                <span>Update Availability</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator style={{ background: '#1e1e3a' }} />
              <DropdownMenuItem onClick={handleLogout} style={{ color: '#ef4444' }}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main content */}
      <main style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto' }}>
        {children}
      </main>
    </div>
  );
}
