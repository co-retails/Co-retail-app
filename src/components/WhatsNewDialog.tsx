import React, { useState, useEffect } from 'react';
import { HIGHLIGHT_NEW } from '../config/featureHighlights';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Sparkles, Package, Warehouse, Users, ShoppingCart, X } from 'lucide-react';
import { Button } from './ui/button';

const WHATS_NEW_VERSION = 'pr8-pr9-2026-03-26';

interface WhatsNewFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
  navigateTo?: string;
}

const features: WhatsNewFeature[] = [
  {
    icon: <Package className="w-5 h-5 text-primary" />,
    title: 'Bulk Item Actions',
    description: 'Select multiple items and apply actions in bulk — unflag expired items, reject items, or update statuses all at once.',
    navigateTo: 'items',
  },
  {
    icon: <Warehouse className="w-5 h-5 text-primary" />,
    title: 'Warehouse Selection',
    description: 'Choose a sending warehouse when creating orders. Partner and warehouse selectors are now sortable and filterable.',
  },
  {
    icon: <Users className="w-5 h-5 text-primary" />,
    title: 'Admin Role Switching',
    description: 'Admins can now preview the app as a Store Staff or Partner user to verify role-based access controls.',
  },
  {
    icon: <ShoppingCart className="w-5 h-5 text-primary" />,
    title: 'Thrifted Order Creation',
    description: 'Create orders with brand/country/store selection, warehouse sender picking, and CSV bulk import with real-time validation.',
  },
];

interface WhatsNewDialogProps {
  onNavigate?: (screen: string) => void;
}

export default function WhatsNewDialog({ onNavigate }: WhatsNewDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!HIGHLIGHT_NEW) return;
    const seen = localStorage.getItem('whats-new-seen');
    if (seen !== WHATS_NEW_VERSION) {
      // Small delay so the app renders first
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('whats-new-seen', WHATS_NEW_VERSION);
    setIsOpen(false);
  };

  const handleTryFeature = (navigateTo?: string) => {
    localStorage.setItem('whats-new-seen', WHATS_NEW_VERSION);
    setIsOpen(false);
    if (navigateTo && onNavigate) {
      onNavigate(navigateTo);
    }
  };

  if (!HIGHLIGHT_NEW) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleDismiss(); }}>
      <DialogContent className="sm:max-w-md bg-surface border-outline-variant p-0 gap-0 overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-primary/80 px-6 pt-6 pb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-on-primary" />
              <DialogTitle className="title-large text-on-primary">What's New</DialogTitle>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-on-primary" />
            </button>
          </div>
          <DialogDescription className="body-medium text-on-primary/80 mt-2">
            New features added to the prototype — March 26
          </DialogDescription>
        </div>

        {/* Feature list */}
        <div className="px-6 py-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {features.map((feature, index) => (
            <button
              key={index}
              className="w-full text-left p-4 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors group"
              onClick={() => handleTryFeature(feature.navigateTo)}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                  {feature.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="title-small text-on-surface">{feature.title}</p>
                    <span className="new-badge" style={{ animation: 'none' }}>NEW</span>
                  </div>
                  <p className="body-small text-on-surface-variant mt-1">{feature.description}</p>
                  {feature.navigateTo && (
                    <p className="label-small text-primary mt-2 group-hover:underline">Try it →</p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2">
          <Button
            onClick={handleDismiss}
            className="w-full bg-primary text-on-primary"
            size="lg"
          >
            <span className="label-large">Got it</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
