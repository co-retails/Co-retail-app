import React, { useState, useMemo } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Download, Upload, Save, Settings } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner';
import { GtinMapping, PartnerType, GtinMappingStats } from './PortalConfigTypes';
import { parseCSV, downloadCSV } from '../utils/spreadsheetUtils';

interface GtinMappingScreenProps {
  onBack: () => void;
}

type ViewTab = 'overrides' | 'merged' | 'inherited';

// All available partners (without type assignment)
const allAvailablePartners = [
  { id: '1', name: 'Sellpy Operations', code: 'SELLPY', country: undefined },
  { id: '2', name: 'Thrifted', code: 'THRIFT', country: undefined },
  { id: '3', name: 'Premium Retailer', code: 'PREMIUM', country: undefined },
  { id: '4', name: 'US Partner', code: 'USPART', country: 'US' },
  { id: '5', name: 'Another Main Partner', code: 'MAIN2', country: undefined },
  { id: '6', name: 'Another Premium Partner', code: 'PREM2', country: undefined },
];

// Partner type assignments (editable)
const initialPartnerTypeAssignments: Record<string, PartnerType> = {
  '1': 'Sellpy',
  '2': 'Main Partner',
  '3': 'Premium Partner',
  '4': 'Main Partner',
  '5': 'Main Partner',
  '6': 'Premium Partner',
};

// Helper to get partners with their assigned types
const getPartnersWithTypes = (assignments: Record<string, PartnerType>) => {
  return allAvailablePartners.map(partner => ({
    ...partner,
    type: assignments[partner.id] || 'Main Partner' as PartnerType
  }));
};

// Mock categories for US partners
const categories = ['Clothing', 'Shoes', 'Accessories'];

// Initial mock data - Partner Type Defaults
const initialPartnerTypeDefaults: GtinMapping[] = [
  {
    id: '1',
    partnerType: 'Main Partner',
    gtin: '1234567890123',
    articleNumber: 'ART-001',
    source: 'inherited',
    lastEdited: '2024-01-15T10:00:00Z',
    lastEditedBy: 'Admin User'
  },
  {
    id: '2',
    partnerType: 'Premium Partner',
    gtin: '2345678901234',
    articleNumber: 'ART-002',
    source: 'inherited',
    lastEdited: '2024-01-15T10:00:00Z',
    lastEditedBy: 'Admin User'
  },
  {
    id: '3',
    partnerType: 'Sellpy',
    gtin: '3456789012345',
    articleNumber: 'ART-003',
    source: 'inherited',
    lastEdited: '2024-01-15T10:00:00Z',
    lastEditedBy: 'Admin User'
  },
];

// Initial mock data - Partner Overrides
const initialPartnerOverrides: GtinMapping[] = [
  {
    id: '4',
    partnerType: 'Main Partner',
    partnerId: '2',
    gtin: '9999999999999',
    articleNumber: 'ART-OVR-001',
    source: 'override',
    lastEdited: '2024-01-20T14:30:00Z',
    lastEditedBy: 'Admin User'
  },
];

// US Partner category-specific mappings
const initialUSCategoryMappings: GtinMapping[] = [
  {
    id: '5',
    partnerType: 'Main Partner',
    partnerId: '4',
    category: 'Clothing',
    gtin: '1111111111111',
    articleNumber: 'ART-US-CLOTHING',
    source: 'override',
    lastEdited: '2024-01-20T14:30:00Z',
    lastEditedBy: 'Admin User'
  },
  {
    id: '6',
    partnerType: 'Main Partner',
    partnerId: '4',
    category: 'Shoes',
    gtin: '2222222222222',
    articleNumber: 'ART-US-SHOES',
    source: 'override',
    lastEdited: '2024-01-20T14:30:00Z',
    lastEditedBy: 'Admin User'
  },
];

export function GtinMappingScreen({ onBack }: GtinMappingScreenProps) {
  const [activeTab, setActiveTab] = useState<ViewTab>('merged');
  const [partnerTypeDefaults, setPartnerTypeDefaults] = useState<GtinMapping[]>(initialPartnerTypeDefaults);
  // Ensure all overrides have source === 'override' and partnerId
  const [partnerOverrides, setPartnerOverrides] = useState<GtinMapping[]>(
    [...initialPartnerOverrides, ...initialUSCategoryMappings].filter(m => m.source === 'override' && m.partnerId)
  );
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPartnerTypeDialogOpen, setIsPartnerTypeDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingMapping, setEditingMapping] = useState<GtinMapping | null>(null);
  const [partnerTypeAssignments, setPartnerTypeAssignments] = useState<Record<string, PartnerType>>(initialPartnerTypeAssignments);
  const [formState, setFormState] = useState({
    partnerType: 'Main Partner' as PartnerType,
    partnerId: '',
    category: '',
    gtin: '',
    articleNumber: ''
  });

  // Get current partners with their assigned types
  const mockPartners = useMemo(() => getPartnersWithTypes(partnerTypeAssignments), [partnerTypeAssignments]);

  // Check if partner is US-based
  const isUSPartner = (partnerId?: string) => {
    if (!partnerId) return false;
    const partner = mockPartners.find(p => p.id === partnerId);
    return partner && (partner as any).country === 'US';
  };

  // Get all mappings (merged view)
  const allMappings = useMemo(() => {
    const merged: GtinMapping[] = [];
    const overrideMap = new Map<string, GtinMapping>();

    // Add all overrides first
    partnerOverrides.forEach(override => {
      const key = override.partnerId 
        ? (isUSPartner(override.partnerId) && override.category 
          ? `${override.partnerType}-${override.partnerId}-${override.category}`
          : `${override.partnerType}-${override.partnerId}`)
        : '';
      if (key) overrideMap.set(key, override);
    });

    // Add defaults, but skip if there's an override
    partnerTypeDefaults.forEach(defaultMapping => {
      // For each partner of this type, check if there's an override
      const partnersOfType = mockPartners.filter(p => p.type === defaultMapping.partnerType);
      
      partnersOfType.forEach(partner => {
        if (isUSPartner(partner.id)) {
          // For US partners, check each category
          categories.forEach(cat => {
            const key = `${defaultMapping.partnerType}-${partner.id}-${cat}`;
            const override = overrideMap.get(key);
            if (override) {
              merged.push(override);
            } else {
              merged.push({
                ...defaultMapping,
                partnerId: partner.id,
                category: cat,
                source: 'inherited'
              });
            }
          });
        } else {
          // For non-US partners, one GTIN per partner type
          const key = `${defaultMapping.partnerType}-${partner.id}`;
          const override = overrideMap.get(key);
          if (override) {
            merged.push(override);
          } else {
            merged.push({
              ...defaultMapping,
              partnerId: partner.id,
              source: 'inherited'
            });
          }
        }
      });
    });

    // Add standalone overrides that don't have a default
    partnerOverrides.forEach(override => {
      const key = override.partnerId 
        ? (isUSPartner(override.partnerId) && override.category 
          ? `${override.partnerType}-${override.partnerId}-${override.category}`
          : `${override.partnerType}-${override.partnerId}`)
        : '';
      if (key && !merged.some(m => m.id === override.id)) {
        merged.push(override);
      }
    });

    return merged;
  }, [partnerTypeDefaults, partnerOverrides]);

  // Filter mappings based on active tab
  const displayedMappings = useMemo(() => {
    switch (activeTab) {
      case 'overrides':
        // Only show actual overrides (source === 'override' and has partnerId)
        return partnerOverrides.filter(m => m.source === 'override' && m.partnerId);
      case 'inherited':
        return partnerTypeDefaults;
      case 'merged':
        return allMappings;
      default:
        return [];
    }
  }, [activeTab, partnerOverrides, partnerTypeDefaults, allMappings]);

  // Calculate stats
  const stats: GtinMappingStats = useMemo(() => {
    const total = allMappings.length;
    const inherited = allMappings.filter(m => m.source === 'inherited').length;
    const overrides = allMappings.filter(m => m.source === 'override').length;
    const efficiency = total > 0 ? Math.round((inherited / total) * 100) : 0;

    return {
      totalMappings: total,
      inheritedCount: inherited,
      overrideCount: overrides,
      storageEfficiency: efficiency
    };
  }, [allMappings]);

  // Reset form
  const resetForm = () => {
    setFormState({
      partnerType: 'Main Partner',
      partnerId: '',
      category: '',
      gtin: '',
      articleNumber: ''
    });
    setEditingMapping(null);
  };

  // Open create dialog
  const handleCreate = () => {
    setDialogMode('create');
    resetForm();
    setIsDialogOpen(true);
  };

  // Open edit dialog
  const handleEdit = (mapping: GtinMapping) => {
    setDialogMode('edit');
    setEditingMapping(mapping);
    setFormState({
      partnerType: mapping.partnerType,
      partnerId: mapping.partnerId || '',
      category: mapping.category || '',
      gtin: mapping.gtin,
      articleNumber: mapping.articleNumber
    });
    setIsDialogOpen(true);
  };

  // Create override from inherited
  const handleCreateOverride = (mapping: GtinMapping) => {
    setDialogMode('create');
    setEditingMapping(mapping);
    setFormState({
      partnerType: mapping.partnerType,
      partnerId: mapping.partnerId || '', // Will be selected by user
      category: mapping.category || '',
      gtin: mapping.gtin,
      articleNumber: mapping.articleNumber
    });
    setIsDialogOpen(true);
  };

  // Save mapping
  const handleSave = () => {
    if (!formState.gtin.trim() || !formState.articleNumber.trim()) {
      toast.error('GTIN and Article Number are required');
      return;
    }

    // Validate GTIN format (13 digits)
    if (!/^\d{13}$/.test(formState.gtin.trim())) {
      toast.error('GTIN must be exactly 13 digits');
      return;
    }

    // Validate partner is required for overrides
    const isCreatingOverride = activeTab === 'overrides' || (dialogMode === 'create' && activeTab !== 'inherited') || (dialogMode === 'create' && editingMapping);
    if (isCreatingOverride && !formState.partnerId) {
      toast.error('Partner is required when creating an override');
      return;
    }

    // Validate category is required for US partners
    if (isUSPartner(formState.partnerId) && !formState.category) {
      toast.error('Category is required for US partners');
      return;
    }

    // Check for duplicates
    const existingGtin = activeTab === 'overrides' 
      ? partnerOverrides.find(m => m.gtin === formState.gtin && m.id !== editingMapping?.id)
      : partnerTypeDefaults.find(m => m.gtin === formState.gtin && m.id !== editingMapping?.id);
    
    if (existingGtin) {
      toast.error('GTIN already exists');
      return;
    }

    if (dialogMode === 'edit' && editingMapping) {
      if (editingMapping.source === 'inherited' && activeTab === 'inherited') {
        // Editing partner type default
        setPartnerTypeDefaults(prev => prev.map(m => 
          m.id === editingMapping.id 
            ? {
                ...m,
                gtin: formState.gtin.trim(),
                articleNumber: formState.articleNumber.trim(),
                lastEdited: new Date().toISOString(),
                lastEditedBy: 'Current User'
              }
            : m
        ));
        toast.success('Partner type default updated');
      } else {
        // Editing override
        setPartnerOverrides(prev => prev.map(m => 
          m.id === editingMapping.id 
            ? {
                ...m,
                gtin: formState.gtin.trim(),
                articleNumber: formState.articleNumber.trim(),
                category: formState.category || undefined,
                lastEdited: new Date().toISOString(),
                lastEditedBy: 'Current User'
              }
            : m
        ));
        toast.success('Override updated');
      }
    } else {
      // Creating new
      if (activeTab === 'inherited' || (!formState.partnerId && dialogMode === 'create' && !editingMapping)) {
        // Create partner type default
        const newMapping: GtinMapping = {
          id: Date.now().toString(),
          partnerType: formState.partnerType,
          gtin: formState.gtin.trim(),
          articleNumber: formState.articleNumber.trim(),
          source: 'inherited',
          lastEdited: new Date().toISOString(),
          lastEditedBy: 'Current User'
        };
        setPartnerTypeDefaults(prev => [...prev, newMapping]);
        toast.success('Partner type default created');
      } else {
        // Create override
        const newMapping: GtinMapping = {
          id: Date.now().toString(),
          partnerType: formState.partnerType,
          partnerId: formState.partnerId || editingMapping?.partnerId,
          category: isUSPartner(formState.partnerId || editingMapping?.partnerId) ? formState.category : undefined,
          gtin: formState.gtin.trim(),
          articleNumber: formState.articleNumber.trim(),
          source: 'override',
          lastEdited: new Date().toISOString(),
          lastEditedBy: 'Current User'
        };
        setPartnerOverrides(prev => [...prev, newMapping]);
        toast.success('Override created');
      }
    }

    // Clear cache (simulated)
    console.log('Cache cleared');

    setIsDialogOpen(false);
    resetForm();
    setSelectedRows(new Set());
  };

  // Delete selected
  const handleDeleteSelected = () => {
    if (selectedRows.size === 0) {
      toast.error('No rows selected');
      return;
    }

    const confirmDelete = confirm(`Delete ${selectedRows.size} mapping(s)?`);
    if (!confirmDelete) return;

    if (activeTab === 'overrides') {
      setPartnerOverrides(prev => prev.filter(m => !selectedRows.has(m.id)));
    } else if (activeTab === 'inherited') {
      setPartnerTypeDefaults(prev => prev.filter(m => !selectedRows.has(m.id)));
    }

    toast.success(`${selectedRows.size} mapping(s) deleted`);
    setSelectedRows(new Set());
  };

  // Export to Excel
  const handleExport = () => {
    const headers = ['Partner Type', 'Partner ID', 'Partner Name', 'Category', 'GTIN', 'Article Number', 'Source'];
    const rows = displayedMappings.map(m => [
      m.partnerType,
      m.partnerId || '',
      m.partnerId ? mockPartners.find(p => p.id === m.partnerId)?.name || '' : '',
      m.category || '',
      m.gtin,
      m.articleNumber,
      m.source === 'inherited' ? 'Inherited' : 'Override'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    downloadCSV(csvContent, 'gtin-mapping.csv');
    toast.success('Exported to CSV');
  };

  // Import from Excel
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const rows = parseCSV(content);
          
          // Skip header row
          const dataRows = rows.slice(1);
          
          let imported = 0;
          dataRows.forEach((row: any) => {
            const partnerType = row['Partner Type'] as PartnerType;
            const partnerId = row['Partner ID'] || '';
            const category = row['Category'] || '';
            const gtin = row['GTIN']?.trim();
            const articleNumber = row['Article Number']?.trim();

            if (!gtin || !articleNumber || !partnerType) return;

            // Check if it's an override or default
            if (partnerId) {
              // Override
              const newMapping: GtinMapping = {
                id: Date.now().toString() + Math.random(),
                partnerType,
                partnerId,
                category: category || undefined,
                gtin,
                articleNumber,
                source: 'override',
                lastEdited: new Date().toISOString(),
                lastEditedBy: 'Current User'
              };
              setPartnerOverrides(prev => [...prev, newMapping]);
            } else {
              // Default
              const newMapping: GtinMapping = {
                id: Date.now().toString() + Math.random(),
                partnerType,
                gtin,
                articleNumber,
                source: 'inherited',
                lastEdited: new Date().toISOString(),
                lastEditedBy: 'Current User'
              };
              setPartnerTypeDefaults(prev => [...prev, newMapping]);
            }
            imported++;
          });

          toast.success(`Imported ${imported} mapping(s)`);
        } catch (error) {
          toast.error('Failed to import file');
          console.error(error);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // Toggle row selection
  const toggleRowSelection = (id: string) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Toggle all rows
  const toggleAllRows = () => {
    if (selectedRows.size === displayedMappings.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(displayedMappings.map(m => m.id)));
    }
  };

  // Get partner name
  const getPartnerName = (partnerId?: string) => {
    if (!partnerId) return '';
    return mockPartners.find(p => p.id === partnerId)?.name || '';
  };

  return (
    <div className="min-h-screen bg-surface pb-20 md:pb-0">
      {/* Top App Bar */}
      <div className="sticky top-0 bg-surface z-10 border-b border-outline-variant">
        <div className="flex items-center h-16 px-4 md:px-6 gap-2">
          <button
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors"
            onClick={onBack}
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-on-surface" />
          </button>

          <div className="flex-1">
            <h1 className="title-large text-on-surface">GTIN Mapping</h1>
            <p className="body-small text-on-surface-variant">
              Manage GTIN mappings for partner types and individual partners
            </p>
          </div>
        </div>
      </div>

      {/* Stats Panels */}
      <div className="px-4 md:px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-surface-container">
            <div className="body-small text-on-surface-variant mb-1">Total Mappings</div>
            <div className="title-large text-on-surface">{stats.totalMappings}</div>
          </Card>
          <Card className="p-4 bg-surface-container">
            <div className="body-small text-on-surface-variant mb-1">Inherited</div>
            <div className="title-large text-on-surface">{stats.inheritedCount}</div>
          </Card>
          <Card className="p-4 bg-surface-container">
            <div className="body-small text-on-surface-variant mb-1">Overrides</div>
            <div className="title-large text-on-surface">{stats.overrideCount}</div>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 md:px-6">
        <div className="flex gap-2 border-b border-outline-variant">
          {(['overrides', 'merged', 'inherited'] as ViewTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSelectedRows(new Set());
              }}
              className={`px-4 py-3 label-large transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab === 'overrides' ? 'Overrides Only' : tab === 'merged' ? 'Merged View' : 'Inherited View'}
            </button>
          ))}
        </div>
      </div>

      {/* Actions Bar */}
      <div className="px-4 md:px-6 py-4 flex flex-wrap gap-2">
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Add {activeTab === 'inherited' ? 'Default' : 'Override'}
        </Button>
        {selectedRows.size > 0 && (
          <Button variant="outline" onClick={handleDeleteSelected} className="gap-2">
            <Trash2 className="w-4 h-4" />
            Delete Selected ({selectedRows.size})
          </Button>
        )}
        <Button variant="outline" onClick={() => setIsPartnerTypeDialogOpen(true)} className="gap-2">
          <Settings className="w-4 h-4" />
          Manage Partner Types
        </Button>
        <Button variant="outline" onClick={handleExport} className="gap-2">
          <Download className="w-4 h-4" />
          Export Excel
        </Button>
        <Button variant="outline" onClick={handleImport} className="gap-2">
          <Upload className="w-4 h-4" />
          Import Excel
        </Button>
      </div>

      {/* Table */}
      <div className="px-4 md:px-6 pb-6">
        <Card className="border-outline-variant overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-container-high border-b border-outline-variant">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <Checkbox
                      checked={selectedRows.size === displayedMappings.length && displayedMappings.length > 0}
                      onCheckedChange={toggleAllRows}
                    />
                  </th>
                  <th className="px-4 py-3 text-left title-small text-on-surface">Partner Type</th>
                  <th className="px-4 py-3 text-left title-small text-on-surface">Partner</th>
                  <th className="px-4 py-3 text-left title-small text-on-surface">Category</th>
                  <th className="px-4 py-3 text-left title-small text-on-surface">GTIN</th>
                  <th className="px-4 py-3 text-left title-small text-on-surface">Article Number</th>
                  <th className="px-4 py-3 text-left title-small text-on-surface">Source</th>
                  <th className="px-4 py-3 text-right title-small text-on-surface">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedMappings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center body-medium text-on-surface-variant">
                      No mappings found
                    </td>
                  </tr>
                ) : (
                  displayedMappings.map(mapping => (
                    <tr
                      key={mapping.id}
                      className="border-b border-outline-variant hover:bg-surface-container-high transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedRows.has(mapping.id)}
                          onCheckedChange={() => toggleRowSelection(mapping.id)}
                        />
                      </td>
                      <td className="px-4 py-3 body-medium text-on-surface">{mapping.partnerType}</td>
                      <td className="px-4 py-3 body-medium text-on-surface">
                        {mapping.partnerId ? getPartnerName(mapping.partnerId) : '-'}
                      </td>
                      <td className="px-4 py-3 body-medium text-on-surface">
                        {mapping.category || '-'}
                      </td>
                      <td className="px-4 py-3 body-medium text-on-surface font-mono">{mapping.gtin}</td>
                      <td className="px-4 py-3 body-medium text-on-surface">{mapping.articleNumber}</td>
                      <td className="px-4 py-3">
                        <Badge
                          className={
                            mapping.source === 'inherited'
                              ? 'bg-primary-container text-on-primary-container'
                              : 'bg-secondary-container text-on-secondary-container'
                          }
                        >
                          {mapping.source === 'inherited' ? 'Inherited' : 'Override'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {activeTab === 'inherited' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCreateOverride(mapping)}
                              className="gap-1"
                            >
                              <Plus className="w-4 h-4" />
                              Create Override
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(mapping)}
                            className="gap-1"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'edit' ? 'Edit' : 'Create'} {activeTab === 'inherited' ? 'Partner Type Default' : 'Override'}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === 'edit' 
                ? 'Update the GTIN mapping details'
                : activeTab === 'inherited'
                ? 'Create a new partner type default mapping'
                : 'Create a new partner-specific override'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="partnerType">Partner Type *</Label>
              {activeTab === 'inherited' && dialogMode === 'create' ? (
                <Input
                  id="partnerType"
                  value={formState.partnerType}
                  onChange={(e) => setFormState(prev => ({ ...prev, partnerType: e.target.value as PartnerType }))}
                  placeholder="Enter partner type name"
                />
              ) : (
                <Select
                  value={formState.partnerType}
                  onValueChange={(value) => setFormState(prev => ({ ...prev, partnerType: value as PartnerType }))}
                  disabled={dialogMode === 'edit' && editingMapping?.source === 'inherited'}
                >
                  <SelectTrigger id="partnerType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Main Partner">Main Partner</SelectItem>
                    <SelectItem value="Premium Partner">Premium Partner</SelectItem>
                    <SelectItem value="Sellpy">Sellpy</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {(activeTab === 'overrides' || (dialogMode === 'create' && activeTab !== 'inherited') || (dialogMode === 'create' && editingMapping)) && (
              <>
                <div>
                  <Label htmlFor="partnerId">Partner *</Label>
                  <Select
                    value={formState.partnerId}
                    onValueChange={(value) => {
                      const partner = mockPartners.find(p => p.id === value);
                      setFormState(prev => ({ 
                        ...prev, 
                        partnerId: value,
                        category: isUSPartner(value) ? prev.category : ''
                      }));
                    }}
                    disabled={dialogMode === 'edit' && editingMapping?.source === 'override'}
                  >
                    <SelectTrigger id="partnerId">
                      <SelectValue placeholder="Select partner" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockPartners
                        .filter(p => p.type === formState.partnerType)
                        .map(partner => (
                          <SelectItem key={partner.id} value={partner.id}>
                            {partner.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {mockPartners.filter(p => p.type === formState.partnerType).length === 0 && (
                    <p className="body-small text-warning mt-1">
                      No partners assigned to this Partner Type. Use "Manage Partner Types" to assign partners.
                    </p>
                  )}
                </div>

                {isUSPartner(formState.partnerId || editingMapping?.partnerId) && (
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formState.category}
                      onValueChange={(value) => setFormState(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            <div>
              <Label htmlFor="gtin">GTIN *</Label>
              <Input
                id="gtin"
                value={formState.gtin}
                onChange={(e) => setFormState(prev => ({ ...prev, gtin: e.target.value }))}
                placeholder="13-digit GTIN"
                maxLength={13}
              />
              <p className="body-small text-on-surface-variant mt-1">
                Must be exactly 13 digits
              </p>
            </div>

            <div>
              <Label htmlFor="articleNumber">Article Number *</Label>
              <Input
                id="articleNumber"
                value={formState.articleNumber}
                onChange={(e) => setFormState(prev => ({ ...prev, articleNumber: e.target.value }))}
                placeholder="Article number for financial reporting"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Partner Type Assignment Dialog */}
      <Dialog open={isPartnerTypeDialogOpen} onOpenChange={setIsPartnerTypeDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Partner Type Assignments</DialogTitle>
            <DialogDescription>
              Assign partners to Partner Types. This determines which partners inherit defaults from each Partner Type.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-3">
              {allAvailablePartners.map(partner => (
                <div key={partner.id} className="flex items-center gap-4 p-3 border border-outline-variant rounded-lg">
                  <div className="flex-1">
                    <div className="title-small text-on-surface">{partner.name}</div>
                    <div className="body-small text-on-surface-variant">{partner.code}</div>
                    {partner.country && (
                      <Badge variant="outline" className="mt-1">
                        {partner.country}
                      </Badge>
                    )}
                  </div>
                  <div className="w-48">
                    <Select
                      value={partnerTypeAssignments[partner.id] || 'Main Partner'}
                      onValueChange={(value) => {
                        setPartnerTypeAssignments(prev => ({
                          ...prev,
                          [partner.id]: value as PartnerType
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Main Partner">Main Partner</SelectItem>
                        <SelectItem value="Premium Partner">Premium Partner</SelectItem>
                        <SelectItem value="Sellpy">Sellpy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPartnerTypeDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsPartnerTypeDialogOpen(false);
              toast.success('Partner type assignments updated');
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

