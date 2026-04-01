import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { cn } from './ui/utils';
import { MarkResellLogo } from './MarkResellLogo';
import { StoreLensLogo } from './StoreLensLogo';

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
    <div
      data-testid="partner-portal-login"
      className={cn('shrink-0 rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-lg', className)}
      style={{
        width: 'min(22.5rem, calc(100vw - 2rem))',
        maxWidth: '100%',
        boxSizing: 'border-box',
        padding: '28px 32px 32px',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="partner-portal-login-title"
      aria-describedby="partner-portal-login-desc"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <MarkResellLogo size={40} />
        <StoreLensLogo />
        <h2 id="partner-portal-login-title" className="title-medium uppercase tracking-wide text-on-surface-variant">
          Partner Portal
        </h2>
        <p
          id="partner-portal-login-desc"
          className="text-pretty text-xs leading-relaxed text-on-surface-variant sm:text-sm"
        >
          Sign in with your partner account. Admins use Switch view. Demo:{' '}
          <span className="font-medium text-on-surface">admin@storelens.com</span>
        </p>
      </div>

      {/* Layout + gaps are 100% inline so utility/CSS churn cannot remove them */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          width: '100%',
          marginTop: 28,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
          <Label htmlFor="partner-portal-email" className="label-medium text-left text-on-surface">
            E-mail
          </Label>
          <Input
            id="partner-portal-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="admin@storelens.com"
            value={email}
            onChange={(ev) => {
              setEmail(ev.target.value);
              if (error) setError(null);
            }}
            aria-invalid={!!error}
            aria-describedby={error ? 'partner-portal-email-error' : undefined}
            className={cn(
              'h-12 min-h-[48px] w-full rounded-lg border border-outline bg-background px-4 py-0',
              'text-base text-on-surface',
              'placeholder:text-muted-foreground',
              'focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25'
            )}
          />
          {error ? (
            <p id="partner-portal-email-error" className="text-sm text-error" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        {/* M3: 24dp between stacked controls (8dp grid × 3); in range 20–24px for field → button */}
        <div
          aria-hidden
          style={{
            flexShrink: 0,
            width: '100%',
            height: 24,
            minHeight: 24,
            pointerEvents: 'none',
          }}
        />

        <Button
          type="submit"
          size="default"
          className="h-12 min-h-[48px] w-full rounded-lg px-6 md:h-12 md:min-h-[48px]"
        >
          Sign in
        </Button>
      </form>

      <p
        className="text-center text-[0.6875rem] leading-relaxed text-on-surface-variant sm:text-xs"
        style={{ marginTop: 28 }}
      >
        Store staff sign in via your organization&apos;s SSO in the store app.
      </p>
    </div>
  );
}
