import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { cn } from './ui/utils';

function StoreLensWordmark({ className }: { className?: string }) {
  return (
    <div
      className={cn('flex items-baseline justify-center gap-1.5 select-none', className)}
      aria-hidden
    >
      <span className="text-[1.625rem] font-semibold tracking-tight text-on-surface">Store</span>
      <span className="text-[1.625rem] font-semibold tracking-tight text-primary">Lens</span>
    </div>
  );
}

export interface PartnerPortalLoginScreenProps {
  onSignIn: (email: string) => void;
  className?: string;
}

export default function PartnerPortalLoginScreen({ onSignIn, className }: PartnerPortalLoginScreenProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Enter your work e-mail to continue.');
      return;
    }
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!ok) {
      setError('Enter a valid e-mail address.');
      return;
    }
    setError(null);
    onSignIn(trimmed);
  };

  return (
    <div className={cn('w-full max-w-[420px]', className)} data-testid="partner-portal-login">
      <div
        className="rounded-2xl border border-outline-variant bg-surface-container-lowest px-8 py-10 shadow-lg md:px-10"
        role="dialog"
        aria-modal="true"
        aria-labelledby="partner-portal-login-title"
        aria-describedby="partner-portal-login-desc"
      >
        <div className="flex flex-col items-center text-center">
          <Heart
            className="mb-3 size-7 text-primary"
            strokeWidth={1.75}
            aria-hidden
          />
          <StoreLensWordmark className="mb-2" />
          <h2 id="partner-portal-login-title" className="title-medium text-on-surface-variant">
            Partner Portal
          </h2>
          <p id="partner-portal-login-desc" className="mt-1 max-w-[280px] text-center text-sm text-on-surface-variant">
            Sign in for partner and admin access. Store staff use single sign-on in the store app.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div className="space-y-2 text-left">
            <Label htmlFor="partner-portal-email">E-mail</Label>
            <Input
              id="partner-portal-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@company.com"
              value={email}
              onChange={(ev) => {
                setEmail(ev.target.value);
                if (error) setError(null);
              }}
              aria-invalid={!!error}
              aria-describedby={error ? 'partner-portal-email-error' : undefined}
              className="h-11"
            />
            {error ? (
              <p id="partner-portal-email-error" className="text-sm text-error" role="alert">
                {error}
              </p>
            ) : null}
          </div>
          <Button type="submit" className="w-full" size="lg">
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-xs leading-relaxed text-on-surface-variant">
          Store users are signed in to the store app through your organization&apos;s single sign-on, not this screen.
        </p>
      </div>
    </div>
  );
}
