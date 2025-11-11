import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from './ui/dialog';
import { ArrowLeft, Plus, X, Save, History } from 'lucide-react';
import { SEKPriceLadder, Brand, Partner } from './PortalConfigTypes';
import { toast } from 'sonner@2.0.3';

interface SEKPriceLaddersScreenProps {
  onBack: () => void;
}

export function SEKPriceLaddersScreen({ onBack }: SEKPriceLaddersScreenProps) {
  const [selectedBrand, setSelectedBrand] = useState<string>('weekday');
  const [selectedPartner, setSelectedPartner] = useState<string>('sellpy');
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [publishNotes, setPublishNotes] = useState('');

  // Mock data
  const brands: Brand[] = [
    { id: 'weekday', name: 'Weekday', code: 'WD' },
    { id: 'monki', name: 'Monki', code: 'MK' }
  ];

  const partners: Partner[] = [
    { id: 'sellpy', name: 'Sellpy (China)', code: 'SP' },
    { id: 'partner2', name: 'Partner B', code: 'PB' }
  ];

  // Mock ladder data
  const [ladders, setLadders] = useState<SEKPriceLadder[]>([
    {
      id: '1',
      brandId: 'weekday',
      partnerId: 'sellpy',
      steps: [95, 125, 150, 199, 249, 299, 349, 399],
      lastEdited: '2025-01-15',
      lastEditedBy: 'Admin User',
      publishedAt: '2025-01-15T10:30:00Z'
    },
    {
      id: '2',
      brandId: 'weekday',
      partnerId: 'thrifted',
      steps: [60, 90, 120, 150, 180, 210],
      lastEdited: '2025-01-12',
      lastEditedBy: 'Admin User',
      publishedAt: '2025-01-12T08:45:00Z'
    },
    {
      id: '3',
      brandId: 'weekday',
      partnerId: 'sfm',
      steps: [120, 160, 210, 260, 320, 390],
      lastEdited: '2025-01-10',
      lastEditedBy: 'Admin User',
      publishedAt: '2025-01-10T09:30:00Z'
    },
    {
      id: '4',
      brandId: 'monki',
      partnerId: 'sellpy',
      steps: [80, 110, 145, 175, 210, 260],
      lastEdited: '2025-01-15',
      lastEditedBy: 'Admin User',
      publishedAt: '2025-01-15T10:30:00Z'
    },
    {
      id: '5',
      brandId: 'monki',
      partnerId: 'thrifted',
      steps: [55, 85, 115, 145, 175, 205],
      lastEdited: '2025-01-12',
      lastEditedBy: 'Admin User',
      publishedAt: '2025-01-12T08:45:00Z'
    },
    {
      id: '6',
      brandId: 'monki',
      partnerId: 'sfm',
      steps: [130, 170, 220, 270, 330, 400],
      lastEdited: '2025-01-10',
      lastEditedBy: 'Admin User',
      publishedAt: '2025-01-10T09:30:00Z'
    }
  ]);

  const currentLadder = ladders.find(
    (l) => l.brandId === selectedBrand && l.partnerId === selectedPartner
  );

  const [editingSteps, setEditingSteps] = useState<number[]>(currentLadder?.steps || []);
  const [newStepValue, setNewStepValue] = useState('');
  const [bulkStepsInput, setBulkStepsInput] = useState('');

  const parseBulkSteps = (input: string): number[] => {
    if (!input) return [];
    const matches = input.match(/-?\d+(?:[.,]\d+)?/g);
    if (!matches) return [];
    const unique = new Set<number>();
    matches.forEach((token) => {
      const value = parseFloat(token.replace(',', '.'));
      if (!Number.isNaN(value) && value > 0) {
        unique.add(Math.round(value));
      }
    });
    return Array.from(unique).sort((a, b) => a - b);
  };

  const handleBulkReplace = (rawInput: string) => {
    const parsed = parseBulkSteps(rawInput);
    if (!parsed.length) {
      toast.error('No valid price points were detected in the pasted data');
      return;
    }

    setEditingSteps(parsed);
    setBulkStepsInput(parsed.join('\n'));
    toast.success('Price steps updated from pasted data');
  };

  React.useEffect(() => {
    const ladder = ladders.find(
      (l) => l.brandId === selectedBrand && l.partnerId === selectedPartner
    );
    setEditingSteps(ladder?.steps || []);
    setBulkStepsInput((ladder?.steps || []).join('\n'));
  }, [selectedBrand, selectedPartner, ladders]);

  const handleAddStep = () => {
    const value = parseInt(newStepValue);
    if (isNaN(value) || value <= 0) {
      toast.error('Please enter a valid positive number');
      return;
    }

    if (editingSteps.includes(value)) {
      toast.error('This value already exists in the ladder');
      return;
    }

    const newSteps = [...editingSteps, value].sort((a, b) => a - b);
    setEditingSteps(newSteps);
    setNewStepValue('');
    setBulkStepsInput(newSteps.join('\n'));
    toast.success('Step added');
  };

  const handleRemoveStep = (value: number) => {
    const updated = editingSteps.filter((s) => s !== value);
    setEditingSteps(updated);
    setBulkStepsInput(updated.join('\n'));
    toast.success('Step removed');
  };

  const handleSaveDraft = () => {
    if (editingSteps.length === 0) {
      toast.error('Ladder must have at least one step');
      return;
    }

    const existingLadder = ladders.find(
      (l) => l.brandId === selectedBrand && l.partnerId === selectedPartner
    );

    if (existingLadder) {
      setLadders(
        ladders.map((l) =>
          l.id === existingLadder.id
            ? {
                ...l,
                steps: editingSteps,
                lastEdited: new Date().toISOString().split('T')[0],
                lastEditedBy: 'Admin User'
              }
            : l
        )
      );
    } else {
      const newLadder: SEKPriceLadder = {
        id: Date.now().toString(),
        brandId: selectedBrand,
        partnerId: selectedPartner,
        steps: editingSteps,
        lastEdited: new Date().toISOString().split('T')[0],
        lastEditedBy: 'Admin User'
      };
      setLadders([...ladders, newLadder]);
    }

    toast.success('Draft saved');
  };

  const handlePublish = () => {
    const existingLadder = ladders.find(
      (l) => l.brandId === selectedBrand && l.partnerId === selectedPartner
    );

    if (existingLadder) {
      setLadders(
        ladders.map((l) =>
          l.id === existingLadder.id
            ? {
                ...l,
                steps: editingSteps,
                publishedAt: new Date().toISOString(),
                lastEdited: new Date().toISOString().split('T')[0],
                lastEditedBy: 'Admin User'
              }
            : l
        )
      );
    }

    setIsPublishDialogOpen(false);
    setPublishNotes('');
    toast.success('Price ladder published successfully');
  };

  return (
    <div className="min-h-screen bg-surface pb-20 md:pb-0">
      {/* Top App Bar */}
      <div className="sticky top-0 bg-surface z-10 border-b border-outline-variant">
        <div className="flex items-center h-16 px-4 md:px-6">
          <button
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors mr-2"
            onClick={onBack}
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-on-surface" />
          </button>

          <div className="flex-1">
            <h1 className="title-large text-on-surface">SEK price ladders</h1>
            <p className="body-small text-on-surface-variant">
              Define valid price points per Brand & Partner
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-outline hover:bg-surface-container-high"
              onClick={() => toast.info('Version history is not yet implemented')}
            >
              <History className="w-5 h-5 mr-2" />
              Version history
            </Button>
            <Button onClick={handleSaveDraft} variant="outline" className="border-outline hover:bg-surface-container-high">
              <Save className="w-5 h-5 mr-2" />
              Save draft
            </Button>
            <Button onClick={() => setIsPublishDialogOpen(true)} className="bg-primary text-on-primary">
              Publish
            </Button>
          </div>
        </div>

        {/* Context Bar */}
        <div className="border-t border-outline-variant bg-surface-container px-4 md:px-6 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="label-medium text-on-surface-variant">Brand:</span>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger className="w-[180px] bg-surface border-outline">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="label-medium text-on-surface-variant">Partner:</span>
              <Select value={selectedPartner} onValueChange={setSelectedPartner}>
                <SelectTrigger className="w-[200px] bg-surface border-outline">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {partners.map((partner) => (
                    <SelectItem key={partner.id} value={partner.id}>
                      {partner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentLadder?.publishedAt && (
              <Badge variant="outline" className="border-tertiary bg-tertiary-container">
                <span className="label-medium text-on-tertiary-container">
                  Published {new Date(currentLadder.publishedAt).toLocaleDateString()}
                </span>
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl px-4 md:px-6 py-6 space-y-6">
        {/* Info Card */}
        <Card className="p-4 border-outline bg-surface-container">
          <p className="body-medium text-on-surface-variant">
            💡 SEK price points are defined per Brand & Partner and apply globally. Custom ladders by
            country are not allowed.
          </p>
        </Card>

        {/* Bulk Paste */}
        <Card className="p-6 border-outline-variant bg-surface-container">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
            <div>
              <h2 className="title-medium text-on-surface">Paste price points</h2>
              <p className="body-small text-on-surface-variant mt-1">
                Paste values straight from a spreadsheet (new lines, commas, or tabs are all supported).
                Duplicate values are removed automatically.
              </p>
            </div>
            <Badge variant="outline" className="border-outline bg-surface">
              <span className="label-medium text-on-surface-variant">
                Current steps: {editingSteps.length}
              </span>
            </Badge>
          </div>
          <Textarea
            value={bulkStepsInput}
            onChange={(event) => setBulkStepsInput(event.target.value)}
            onPaste={(event) => {
              const pasted = event.clipboardData.getData('text');
              if (pasted) {
                event.preventDefault();
                setBulkStepsInput(pasted);
                handleBulkReplace(pasted);
              }
            }}
            placeholder={'Example:\n150\n175\n199\n299'}
            className="bg-surface border-outline min-h-[140px]"
          />
          <div className="flex flex-wrap justify-end gap-2 mt-4">
            <Button
              variant="outline"
              className="border-outline hover:bg-surface-container-high"
              onClick={() => {
                setBulkStepsInput(editingSteps.join('\n'));
                toast.success('Restored current ladder values');
              }}
            >
              Reset
            </Button>
            <Button
              onClick={() => handleBulkReplace(bulkStepsInput)}
              className="bg-primary text-on-primary"
            >
              Replace price steps
            </Button>
          </div>
        </Card>

        {/* Add Step Card */}
        <Card className="p-6 border-outline-variant bg-surface-container">
          <h2 className="title-medium text-on-surface mb-4">Add price step</h2>
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Enter SEK amount (e.g., 150)"
                value={newStepValue}
                onChange={(e) => setNewStepValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddStep();
                  }
                }}
                className="bg-surface border-outline"
              />
            </div>
            <Button onClick={handleAddStep} className="bg-primary text-on-primary">
              <Plus className="w-5 h-5 mr-2" />
              Add step
            </Button>
          </div>
        </Card>

        {/* Ladder Display */}
        <Card className="p-6 border-outline-variant bg-surface-container">
          <div className="flex items-center justify-between mb-4">
            <h2 className="title-medium text-on-surface">Price ladder</h2>
            <Badge variant="outline" className="border-outline bg-surface">
              <span className="label-medium text-on-surface-variant">
                {editingSteps.length} steps
              </span>
            </Badge>
          </div>

          {editingSteps.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-outline-variant rounded-lg">
              <p className="body-medium text-on-surface-variant">
                No price steps defined. Add your first step to get started.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {editingSteps.map((step) => (
                <div
                  key={step}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-primary-container text-on-primary-container rounded-lg"
                >
                  <span className="label-large">{step} SEK</span>
                  <button
                    onClick={() => handleRemoveStep(step)}
                    className="w-5 h-5 rounded-full hover:bg-primary/20 flex items-center justify-center transition-colors"
                    aria-label={`Remove ${step} SEK`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Validation Rules */}
        <Card className="p-6 border-outline-variant bg-surface-container">
          <h2 className="title-medium text-on-surface mb-3">Validation rules</h2>
          <ul className="space-y-2 body-medium text-on-surface-variant">
            <li className="flex items-start gap-2">
              <span className="text-accent">✓</span>
              Steps must be in ascending order (handled automatically)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">✓</span>
              All values must be positive integers
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">✓</span>
              No duplicate values allowed
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">✓</span>
              Minimum 1 step required
            </li>
          </ul>
        </Card>
      </div>

      {/* Publish Dialog */}
      <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
        <DialogContent className="bg-surface border-outline">
          <DialogHeader>
            <DialogTitle className="title-large text-on-surface">Publish price ladder</DialogTitle>
            <DialogDescription className="body-medium text-on-surface-variant">
              Publishing will make this price ladder active for {brands.find((b) => b.id === selectedBrand)?.name} ×{' '}
              {partners.find((p) => p.id === selectedPartner)?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="mb-4">
              <p className="body-medium text-on-surface mb-2">
                {editingSteps.length} price steps will be published:
              </p>
              <div className="p-3 bg-surface-container-high rounded-lg body-small text-on-surface-variant">
                {editingSteps.join(', ')} SEK
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="label-medium text-on-surface">
                Version notes (optional)
              </Label>
              <Input
                id="notes"
                placeholder="e.g., Updated pricing for Q1 2025"
                value={publishNotes}
                onChange={(e) => setPublishNotes(e.target.value)}
                className="bg-surface-container border-outline"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPublishDialogOpen(false)}
              className="border-outline hover:bg-surface-container-high"
            >
              Cancel
            </Button>
            <Button onClick={handlePublish} className="bg-primary text-on-primary">
              Publish ladder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
