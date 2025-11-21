import React, { useState, useMemo } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Download, Upload, Save, Settings, X, ArrowUp, ArrowDown } from 'lucide-react';
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
import { Switch } from './ui/switch';
import { toast } from 'sonner';
import { GtinMapping, PartnerType, GtinMappingStats } from './PortalConfigTypes';
import { parseCSV, downloadCSV } from '../utils/spreadsheetUtils';

interface GtinMappingScreenProps {
  onBack: () => void;
}

type ViewTab = 'overrides' | 'merged' | 'inherited';
type MainTab = 'partner-types-master' | 'main-mapping' | 'overview-overrides';
type FilterChip = 'all' | 'inherited' | 'overrides';

// All available partners (without type assignment)
const allAvailablePartners = [
  { id: '1', name: 'Sellpy Operations', code: 'SELLPY', country: undefined },
  { id: '2', name: 'Thrifted', code: 'THRIFT', country: undefined },
  { id: '3', name: 'Premium Retailer', code: 'PREMIUM', country: undefined },
  { id: '4', name: 'US Partner', code: 'USPART', country: 'US' },
];

// Partner type assignments (editable)
const initialPartnerTypeAssignments: Record<string, PartnerType> = {
  '1': 'Sellpy',
  '2': 'Main Partner',
  '3': 'Premium Partner',
  '4': 'Main Partner',
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

// Available brands
const availableBrands = [
  { id: 'hm', name: 'H&M' },
  { id: 'weekday', name: 'Weekday' },
  { id: 'cos', name: 'COS' },
  { id: 'arket', name: 'Arket' },
];

// Partner Type Configuration structure
interface PartnerTypeConfig {
  id: string;
  brandId: string;
  partnerType: PartnerType;
  gtin: string;
  articleNumber: string;
  partnerIds: string[]; // Partners mapped to this type
  lastEdited: string;
  lastEditedBy: string;
}

// Initial Partner Type Configurations
const initialPartnerTypeConfigs: PartnerTypeConfig[] = [
  {
    id: '1',
    brandId: 'hm',
    partnerType: 'Main Partner',
    gtin: '1234567890123',
    articleNumber: 'ART-001',
    partnerIds: ['2', '4'],
    lastEdited: '2024-01-15T10:00:00Z',
    lastEditedBy: 'Admin User'
  },
  {
    id: '2',
    brandId: 'weekday',
    partnerType: 'Premium Partner',
    gtin: '2345678901234',
    articleNumber: 'ART-002',
    partnerIds: ['3'],
    lastEdited: '2024-01-15T10:00:00Z',
    lastEditedBy: 'Admin User'
  },
];

// Initial mock data - Partner Type Defaults (deprecated, will be generated from configs)
const initialPartnerTypeDefaults: GtinMapping[] = [];

// Initial mock data - Partner Overrides
const initialPartnerOverrides: GtinMapping[] = [
  {
    id: '5',
    brandId: 'hm',
    partnerType: 'Main Partner',
    partnerId: '4',
    category: 'Clothing',
    gtin: '1111111111111',
    articleNumber: 'ART-US-CLOTHING',
    source: 'override',
    lastEdited: '2024-01-20T14:30:00Z',
    lastEditedBy: 'Admin User'
  },
];

export function GtinMappingScreen({ onBack }: GtinMappingScreenProps) {
  const [mainTab, setMainTab] = useState<MainTab>('partner-types-master');
  const [filterChip, setFilterChip] = useState<FilterChip>('all');
  // Partner Type Configurations - the source of truth for inherited mappings
  const [partnerTypeConfigs, setPartnerTypeConfigs] = useState<PartnerTypeConfig[]>(initialPartnerTypeConfigs);
  // Ensure all overrides have source === 'override' and partnerId and brandId
  const [partnerOverrides, setPartnerOverrides] = useState<GtinMapping[]>(
    initialPartnerOverrides.filter(m => m.source === 'override' && m.partnerId && m.brandId)
  );
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPartnerTypeDialogOpen, setIsPartnerTypeDialogOpen] = useState(false);
  const [isAddPartnerTypeDialogOpen, setIsAddPartnerTypeDialogOpen] = useState(false);
  const [isAddGtinMappingDialogOpen, setIsAddGtinMappingDialogOpen] = useState(false);
  const [isAddPartnerDialogOpen, setIsAddPartnerDialogOpen] = useState(false);
  const [addingPartnerToTypeId, setAddingPartnerToTypeId] = useState<string | null>(null);
  const [newPartnerTypeName, setNewPartnerTypeName] = useState('');
  const [editingPartnerTypeName, setEditingPartnerTypeName] = useState<string | null>(null);
  const [editingPartnerTypeValue, setEditingPartnerTypeValue] = useState<string>('');
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingMapping, setEditingMapping] = useState<GtinMapping | null>(null);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
  const [inlineEditState, setInlineEditState] = useState<{
    gtin: string;
    articleNumber: string;
    category: string;
  } | null>(null);
  const [partnerTypeAssignments, setPartnerTypeAssignments] = useState<Record<string, PartnerType>>(initialPartnerTypeAssignments);
  const [availablePartnerTypes, setAvailablePartnerTypes] = useState<PartnerType[]>(['Main Partner', 'Premium Partner', 'Sellpy']);
  const [partnerRequiresCategory, setPartnerRequiresCategory] = useState<Record<string, boolean>>({
    '4': true, // US Partner requires category
  });
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]); // Empty = all brands
  const [formState, setFormState] = useState({
    partnerType: 'Main Partner' as PartnerType,
    partnerId: '',
    category: '',
    gtin: '',
    articleNumber: ''
  });
  const [newConfigFormState, setNewConfigFormState] = useState({
    brandId: '',
    partnerType: 'Main Partner' as PartnerType,
    gtin: '',
    articleNumber: '',
    partnerIds: [] as string[]
  });

  // Sorting state
  type SortDirection = 'asc' | 'desc' | null;
  type SortField = 'brand' | 'partnerType' | 'partner' | 'gtin' | 'articleNumber' | 'source';
  const [sortField, setSortField] = useState<SortField | null>('partner');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Filter partner type configs by selected brands
  const filteredPartnerTypeConfigs = useMemo(() => {
    if (selectedBrands.length === 0) return partnerTypeConfigs;
    return partnerTypeConfigs.filter(config => selectedBrands.includes(config.brandId));
  }, [partnerTypeConfigs, selectedBrands]);

  // Generate partner type defaults from configurations
  const partnerTypeDefaults = useMemo(() => {
    const defaults: GtinMapping[] = [];
    // Generate all defaults - one per partner, NO categories (categories only in overrides)
    partnerTypeConfigs.forEach(config => {
      config.partnerIds.forEach(partnerId => {
        // Inherited mappings should NOT have categories - one mapping per partner
        defaults.push({
          id: `${config.id}-${partnerId}`,
          brandId: config.brandId,
          partnerType: config.partnerType,
          partnerId: partnerId,
          gtin: config.gtin,
          articleNumber: config.articleNumber,
          source: 'inherited',
          lastEdited: config.lastEdited,
          lastEditedBy: config.lastEditedBy
        });
      });
    });
    return defaults;
  }, [partnerTypeConfigs]);

  // Get current partners with their assigned types (for backward compatibility)
  const mockPartners = useMemo(() => {
    // Build from partnerTypeConfigs
    const partners: Array<{ id: string; name: string; code: string; type: PartnerType; country?: string }> = [];
    partnerTypeConfigs.forEach(config => {
      config.partnerIds.forEach(partnerId => {
        const partner = allAvailablePartners.find(p => p.id === partnerId);
        if (partner && !partners.find(p => p.id === partnerId)) {
          partners.push({
            ...partner,
            type: config.partnerType
          });
        }
      });
    });
    return partners;
  }, [partnerTypeConfigs]);

  // Check if partner is US-based
  const isUSPartner = (partnerId?: string) => {
    if (!partnerId) return false;
    const partner = mockPartners.find(p => p.id === partnerId);
    return partner && (partner as any).country === 'US';
  };

  // Check if partner requires category
  const partnerRequiresCategoryCheck = (partnerId?: string) => {
    if (!partnerId) return false;
    return partnerRequiresCategory[partnerId] || false;
  };

  // Get all mappings (merged view)
  const allMappings = useMemo(() => {
    const merged: GtinMapping[] = [];
    const overrideMap = new Map<string, GtinMapping>();
    const partnersWithNonCategoryOverrides = new Set<string>();

    // Build override map - key is partnerType-partnerId or partnerType-partnerId-category
    // Track which partners have overrides WITHOUT category (these replace inherited)
    partnerOverrides.forEach(override => {
      if (override.partnerId) {
        const key = override.category 
          ? `${override.partnerType}-${override.partnerId}-${override.category}`
          : `${override.partnerType}-${override.partnerId}`;
        overrideMap.set(key, override);
        // Track partners with overrides WITHOUT category (these replace inherited)
        if (!override.category) {
          partnersWithNonCategoryOverrides.add(`${override.partnerType}-${override.partnerId}`);
        }
      }
    });

    // Add all inherited defaults, but skip if there's an override WITHOUT category for that partner
    // (overrides WITH category are in addition to inherited, not replacing)
    partnerTypeDefaults.forEach(defaultMapping => {
      if (defaultMapping.partnerId) {
        const partnerKey = `${defaultMapping.partnerType}-${defaultMapping.partnerId}`;
        // Skip inherited only if there's an override WITHOUT category for this partner
        if (!partnersWithNonCategoryOverrides.has(partnerKey)) {
          merged.push(defaultMapping);
        }
      }
    });

    // Add all overrides
    partnerOverrides.forEach(override => {
      if (override.partnerId) {
        merged.push(override);
      }
    });

    return merged;
  }, [partnerTypeDefaults, partnerOverrides]);

  // Sorting helper function
  const sortMappings = (mappings: GtinMapping[], field: SortField, direction: SortDirection): GtinMapping[] => {
    if (!direction || !field) return mappings;
    
    return [...mappings].sort((a, b) => {
      let aVal: any;
      let bVal: any;
      
      switch (field) {
        case 'brand':
          const aBrand = a.brandId ? availableBrands.find(b => b.id === a.brandId) : null;
          const bBrand = b.brandId ? availableBrands.find(b => b.id === b.brandId) : null;
          aVal = (aBrand?.name || '').toLowerCase();
          bVal = (bBrand?.name || '').toLowerCase();
          break;
        case 'partner':
          const aPartner = a.partnerId ? mockPartners.find(p => p.id === a.partnerId) : null;
          const bPartner = b.partnerId ? mockPartners.find(p => p.id === b.partnerId) : null;
          aVal = (aPartner?.name || '').toLowerCase();
          bVal = (bPartner?.name || '').toLowerCase();
          break;
        case 'partnerType':
          aVal = a.partnerType.toLowerCase();
          bVal = b.partnerType.toLowerCase();
          break;
        case 'gtin':
          aVal = a.gtin.toLowerCase();
          bVal = b.gtin.toLowerCase();
          break;
        case 'articleNumber':
          aVal = a.articleNumber.toLowerCase();
          bVal = b.articleNumber.toLowerCase();
          break;
        case 'source':
          aVal = a.source.toLowerCase();
          bVal = b.source.toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return direction === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  };

  // Handle column sort (only on desktop)
  const handleSort = (field: SortField) => {
    // Only allow sorting on desktop (768px and above)
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return;
    }
    
    if (sortField === field) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter mappings based on filter chip and selected brands
  const filteredMappings = useMemo(() => {
    let mappings: GtinMapping[] = [];
    
    switch (filterChip) {
      case 'inherited':
        mappings = partnerTypeDefaults;
        break;
      case 'overrides':
        // Only show actual overrides (source === 'override' and has partnerId)
        mappings = partnerOverrides.filter(m => {
          return m.source === 'override' && m.partnerId;
        });
        break;
      case 'all':
      default:
        mappings = allMappings;
        break;
    }
    
    // Apply brand filter if brands are selected
    if (selectedBrands.length > 0) {
      mappings = mappings.filter(m => m.brandId && selectedBrands.includes(m.brandId));
    }
    
    return mappings;
  }, [filterChip, partnerOverrides, partnerTypeDefaults, allMappings, selectedBrands]);

  // Apply sorting to filtered mappings
  const displayedMappings = useMemo(() => {
    if (!sortField || !sortDirection) return filteredMappings;
    return sortMappings(filteredMappings, sortField, sortDirection);
  }, [filteredMappings, sortField, sortDirection, mockPartners, availableBrands]);

  // Counts for filter chips (should match what's displayed after brand filtering)
  const filterCounts = useMemo(() => {
    // Calculate counts based on filtered data (with brand filter applied)
    let inheritedMappings = partnerTypeDefaults;
    let overrideMappings = partnerOverrides.filter(m => m.source === 'override' && m.partnerId);
    let allMappingsFiltered = allMappings;
    
    // Apply brand filter if brands are selected
    if (selectedBrands.length > 0) {
      inheritedMappings = inheritedMappings.filter(m => m.brandId && selectedBrands.includes(m.brandId));
      overrideMappings = overrideMappings.filter(m => m.brandId && selectedBrands.includes(m.brandId));
      allMappingsFiltered = allMappingsFiltered.filter(m => m.brandId && selectedBrands.includes(m.brandId));
    }
    
    return {
      all: allMappingsFiltered.length,
      inherited: inheritedMappings.length,
      overrides: overrideMappings.length
    };
  }, [allMappings, partnerTypeDefaults, partnerOverrides, selectedBrands]);

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
      brandId: '',
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
    // Set default partner type based on filter
    if (filterChip === 'inherited') {
      setFormState(prev => ({ ...prev, partnerType: availablePartnerTypes[0] || 'Main Partner' }));
    }
    setIsDialogOpen(true);
  };

  // Start inline editing
  const handleStartEdit = (mapping: GtinMapping) => {
    // Cancel any existing edit first
    if (editingRowId && editingRowId !== mapping.id) {
      handleCancelEdit();
    }
    setEditingRowId(mapping.id);
    setInlineEditState({
      gtin: mapping.gtin,
      articleNumber: mapping.articleNumber,
      category: mapping.category || ''
    });
  };

  // Cancel inline editing
  const handleCancelEdit = () => {
    setEditingRowId(null);
    setInlineEditState(null);
  };

  // Save inline edit
  const handleSaveInlineEdit = (mapping: GtinMapping) => {
    if (!inlineEditState) return;

    // Validate GTIN format (13 digits)
    if (!/^\d{13}$/.test(inlineEditState.gtin.trim())) {
      toast.error('GTIN must be exactly 13 digits');
      return;
    }

    if (!inlineEditState.gtin.trim() || !inlineEditState.articleNumber.trim()) {
      toast.error('GTIN and Article Number are required');
      return;
    }

    // Category is optional

    // Check for duplicates (excluding current mapping)
    const existingGtin = filterChip === 'overrides' 
      ? partnerOverrides.find(m => m.gtin === inlineEditState.gtin.trim() && m.id !== mapping.id)
      : partnerTypeDefaults.find(m => m.gtin === inlineEditState.gtin.trim() && m.id !== mapping.id);
    
    if (existingGtin) {
      toast.error('GTIN already exists');
      return;
    }

    // Update the mapping
    if (mapping.source === 'inherited' && filterChip === 'inherited') {
      // Editing partner type default
      setPartnerTypeDefaults(prev => prev.map(m => 
        m.id === mapping.id 
          ? {
              ...m,
              gtin: inlineEditState.gtin.trim(),
              articleNumber: inlineEditState.articleNumber.trim(),
              lastEdited: new Date().toISOString(),
              lastEditedBy: 'Current User'
            }
          : m
      ));
      toast.success('Mapping updated');
    } else {
      // Editing override
      setPartnerOverrides(prev => prev.map(m => 
        m.id === mapping.id 
          ? {
              ...m,
              gtin: inlineEditState.gtin.trim(),
              articleNumber: inlineEditState.articleNumber.trim(),
              category: inlineEditState.category || undefined,
              lastEdited: new Date().toISOString(),
              lastEditedBy: 'Current User'
            }
          : m
      ));
      toast.success('Override updated');
    }

    setEditingRowId(null);
    setInlineEditState(null);
  };

  // Create override from inherited
  const handleCreateOverride = (mapping: GtinMapping) => {
    setDialogMode('create');
    setEditingMapping(mapping);
    setFormState({
      brandId: mapping.brandId || '',
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

    // Validate partner and brand are required for overrides
    const isCreatingOverride = filterChip === 'overrides' || (dialogMode === 'create' && filterChip !== 'inherited') || (dialogMode === 'create' && editingMapping);
    if (isCreatingOverride && !formState.partnerId) {
      toast.error('Partner is required when creating an override');
      return;
    }
    if (isCreatingOverride && !formState.brandId) {
      toast.error('Brand is required when creating an override');
      return;
    }

    // Category is optional for overrides

    // Check for duplicates
    const existingGtin = filterChip === 'overrides' 
      ? partnerOverrides.find(m => m.gtin === formState.gtin && m.id !== editingMapping?.id)
      : partnerTypeDefaults.find(m => m.gtin === formState.gtin && m.id !== editingMapping?.id);
    
    if (existingGtin) {
      toast.error('GTIN already exists');
      return;
    }

    if (dialogMode === 'edit' && editingMapping) {
      if (editingMapping.source === 'inherited' && filterChip === 'inherited') {
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
                brandId: formState.brandId,
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
      if (filterChip === 'inherited' || (!formState.partnerId && dialogMode === 'create' && !editingMapping)) {
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
          brandId: formState.brandId,
          partnerType: formState.partnerType,
          partnerId: formState.partnerId || editingMapping?.partnerId,
          category: formState.category || undefined,
          gtin: formState.gtin.trim(),
          articleNumber: formState.articleNumber.trim(),
          source: 'override',
          lastEdited: new Date().toISOString(),
          lastEditedBy: 'Current User'
        };
        // Ensure source is explicitly set to 'override'
        const overrideMapping: GtinMapping = {
          ...newMapping,
          source: 'override'
        };
        setPartnerOverrides(prev => [...prev, overrideMapping]);
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

    if (filterChip === 'overrides') {
      setPartnerOverrides(prev => prev.filter(m => !selectedRows.has(m.id)));
    } else if (filterChip === 'inherited') {
      setPartnerTypeDefaults(prev => prev.filter(m => !selectedRows.has(m.id)));
    } else {
      // For 'all', delete from both
      setPartnerOverrides(prev => prev.filter(m => !selectedRows.has(m.id)));
      setPartnerTypeDefaults(prev => prev.filter(m => !selectedRows.has(m.id)));
    }

    toast.success(`${selectedRows.size} mapping(s) deleted`);
    setSelectedRows(new Set());
  };

  // Export to Excel
  const handleExport = () => {
    const headers = ['Partner Type', 'External ID', 'Partner Name', 'Category', 'GTIN', 'Article Number', 'Source'];
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

  // Handle add just a partner type name
  const handleAddPartnerTypeName = () => {
    if (!newPartnerTypeName.trim()) {
      toast.error('Partner type name is required');
      return;
    }
    if (availablePartnerTypes.includes(newPartnerTypeName.trim() as PartnerType)) {
      toast.error('Partner type already exists');
      return;
    }
    setAvailablePartnerTypes(prev => [...prev, newPartnerTypeName.trim() as PartnerType]);
    setNewPartnerTypeName('');
    setIsAddPartnerTypeDialogOpen(false);
    toast.success('Partner type added');
  };

  // Handle add GTIN mapping
  const handleAddGtinMapping = () => {
    if (!newConfigFormState.brandId) {
      toast.error('Brand is required');
      return;
    }
    if (!newConfigFormState.partnerType.trim()) {
      toast.error('Partner type name is required');
      return;
    }
    // Check if this exact combination already exists
    if (partnerTypeConfigs.some(c => 
      c.brandId === newConfigFormState.brandId && 
      c.partnerType === newConfigFormState.partnerType.trim()
    )) {
      toast.error('This GTIN mapping already exists for this brand and partner type');
      return;
    }
    // Validate GTIN if provided
    if (newConfigFormState.gtin.trim() && !/^\d{13}$/.test(newConfigFormState.gtin.trim())) {
      toast.error('GTIN must be exactly 13 digits');
      return;
    }
    // Add new partner type configuration
    const newConfig: PartnerTypeConfig = {
      id: `config-${Date.now()}`,
      brandId: newConfigFormState.brandId,
      partnerType: newConfigFormState.partnerType.trim() as PartnerType,
      gtin: newConfigFormState.gtin.trim(),
      articleNumber: newConfigFormState.articleNumber.trim(),
      partnerIds: newConfigFormState.partnerIds,
      lastEdited: new Date().toISOString(),
      lastEditedBy: 'Current User'
    };
    setPartnerTypeConfigs(prev => [...prev, newConfig]);
    setAvailablePartnerTypes(prev => {
      if (!prev.includes(newConfigFormState.partnerType.trim() as PartnerType)) {
        return [...prev, newConfigFormState.partnerType.trim() as PartnerType];
      }
      return prev;
    });
    setNewConfigFormState({
      brandId: '',
      partnerType: 'Main Partner',
      gtin: '',
      articleNumber: '',
      partnerIds: []
    });
    setIsAddGtinMappingDialogOpen(false);
    toast.success('GTIN mapping added');
  };

  const handleAddPartnerToType = (partnerId: string) => {
    if (!addingPartnerToTypeId) return;
    
    const config = partnerTypeConfigs.find(c => c.id === addingPartnerToTypeId);
    if (!config) return;
    
    if (config.partnerIds.includes(partnerId)) {
      toast.error('Partner already assigned to this type');
      return;
    }
    
    setPartnerTypeConfigs(prev => prev.map(c => 
      c.id === addingPartnerToTypeId 
        ? { ...c, partnerIds: [...c.partnerIds, partnerId] }
        : c
    ));
    setIsAddPartnerDialogOpen(false);
    setAddingPartnerToTypeId(null);
    toast.success('Partner added to type');
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

      {/* Brand Filter */}
      <div className="px-4 md:px-6 py-3 border-b border-outline-variant bg-surface-container">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="label-medium text-on-surface-variant">Brand:</span>
          <div className="flex items-center gap-2 flex-wrap">
            {availableBrands.map(brand => (
              <div key={brand.id} className="flex items-center gap-2">
                <Checkbox
                  id={`brand-${brand.id}`}
                  checked={selectedBrands.includes(brand.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedBrands(prev => [...prev, brand.id]);
                    } else {
                      setSelectedBrands(prev => prev.filter(id => id !== brand.id));
                    }
                  }}
                />
                <Label htmlFor={`brand-${brand.id}`} className="body-medium text-on-surface cursor-pointer">
                  {brand.name}
                </Label>
              </div>
            ))}
            {selectedBrands.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedBrands([])}
                className="h-8 text-on-surface-variant"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="px-4 md:px-6">
        <div className="flex gap-2 border-b border-outline-variant">
          <button
            onClick={() => {
              setMainTab('partner-types-master');
              setSelectedRows(new Set());
            }}
            className={`px-4 py-3 label-large transition-colors border-b-2 ${
              mainTab === 'partner-types-master'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Partner types
          </button>
          <button
            onClick={() => {
              setMainTab('main-mapping');
              setSelectedRows(new Set());
            }}
            className={`px-4 py-3 label-large transition-colors border-b-2 ${
              mainTab === 'main-mapping'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Main mapping
          </button>
          <button
            onClick={() => {
              setMainTab('overview-overrides');
              setSelectedRows(new Set());
            }}
            className={`px-4 py-3 label-large transition-colors border-b-2 ${
              mainTab === 'overview-overrides'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Overview & Overrides
          </button>
        </div>
      </div>

      {/* GTIN Mapping Tab Content */}
      {mainTab === 'overview-overrides' && (
        <>
          {/* Filter Chips */}
          <div className="px-4 md:px-6 py-4 flex flex-wrap gap-2">
            {(['all', 'inherited', 'overrides'] as FilterChip[]).map(chip => (
              <button
                key={chip}
                onClick={() => {
                  setFilterChip(chip);
                  setSelectedRows(new Set());
                }}
                className={`px-4 py-2 rounded-full label-medium transition-colors ${
                  filterChip === chip
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {chip === 'all' ? 'All' : chip === 'inherited' ? 'Inherited' : 'Overrides'} ({filterCounts[chip]})
              </button>
            ))}
          </div>

          {/* Actions Bar */}
          <div className="px-4 md:px-6 pb-4 flex flex-wrap gap-2">
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              Add override
            </Button>
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="w-4 h-4" />
              Export Excel
            </Button>
          </div>
        </>
      )}

      {/* Partner Types Tab Content */}
      {/* Partner Types Master Tab */}
      {mainTab === 'partner-types-master' && (
        <div className="px-4 md:px-6 pb-6">
          <div className="mb-6 mt-4 flex gap-2">
            <Button onClick={() => setIsAddPartnerTypeDialogOpen(true)} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Add partner type
            </Button>
          </div>
          
          <Card className="border-outline-variant overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-container-high border-b border-outline-variant">
                  <tr>
                    <th className="px-4 py-3 text-left title-small text-on-surface">Partner Type</th>
                    <th className="px-4 py-3 text-right title-small text-on-surface">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {availablePartnerTypes.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-center body-medium text-on-surface-variant">
                        No partner types configured. Click "Add partner type" to get started.
                      </td>
                    </tr>
                  ) : (
                    availablePartnerTypes.map(partnerType => (
                      <tr
                        key={partnerType}
                        className="border-b border-outline-variant hover:bg-surface-container-high transition-colors"
                      >
                        <td className="px-4 py-3">
                          {editingPartnerTypeName === partnerType ? (
                            <Input
                              value={editingPartnerTypeValue}
                              onChange={(e) => setEditingPartnerTypeValue(e.target.value)}
                              className="w-64"
                              placeholder="Partner type name"
                            />
                          ) : (
                            <span className="body-medium text-on-surface">{partnerType}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {editingPartnerTypeName === partnerType ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSaveEditPartnerType}
                                className="gap-1"
                              >
                                <Save className="w-4 h-4" />
                                Save
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCancelEditPartnerType}
                                className="gap-1"
                              >
                                <X className="w-4 h-4" />
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStartEditPartnerType(partnerType)}
                                className="gap-1"
                              >
                                <Edit2 className="w-4 h-4" />
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeletePartnerType(partnerType)}
                                className="gap-1 text-error"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Main Mapping Tab */}
      {mainTab === 'main-mapping' && (
        <div className="px-4 md:px-6 pb-6">
          <div className="mb-6 mt-4 flex gap-2">
            <Button onClick={() => setIsAddGtinMappingDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add GTIN mapping
            </Button>
          </div>
          
          <Card className="border-outline-variant overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-container-high border-b border-outline-variant">
                  <tr>
                    <th className="px-4 py-3 text-left title-small text-on-surface">Brand</th>
                    <th className="px-4 py-3 text-left title-small text-on-surface">Partner Type</th>
                    <th className="px-4 py-3 text-left title-small text-on-surface">GTIN</th>
                    <th className="px-4 py-3 text-left title-small text-on-surface">Article</th>
                    <th className="px-4 py-3 text-left title-small text-on-surface">Partners</th>
                    <th className="px-4 py-3 text-right title-small text-on-surface">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPartnerTypeConfigs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center body-medium text-on-surface-variant">
                        {selectedBrands.length > 0 
                          ? 'No GTIN mappings found for selected brands. Click "Add GTIN mapping" to get started.'
                          : 'No GTIN mappings configured. Click "Add GTIN mapping" to get started.'}
                      </td>
                    </tr>
                  ) : (
                    filteredPartnerTypeConfigs.map(config => (
                      <tr
                        key={config.id}
                        className="border-b border-outline-variant hover:bg-surface-container-high transition-colors"
                      >
                        <td className="px-4 py-3">
                          {editingConfigId === config.id ? (
                            <Select
                              value={config.brandId}
                              onValueChange={(value) => {
                                setPartnerTypeConfigs(prev => prev.map(c => 
                                  c.id === config.id 
                                    ? { ...c, brandId: value }
                                    : c
                                ));
                              }}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {availableBrands.map(brand => (
                                  <SelectItem key={brand.id} value={brand.id}>
                                    {brand.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="body-medium text-on-surface">
                              {availableBrands.find(b => b.id === config.brandId)?.name || config.brandId}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editingConfigId === config.id ? (
                            <Select
                              value={config.partnerType}
                              onValueChange={(value) => {
                                setPartnerTypeConfigs(prev => prev.map(c => 
                                  c.id === config.id 
                                    ? { ...c, partnerType: value as PartnerType }
                                    : c
                                ));
                              }}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {availablePartnerTypes.map(type => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="body-medium text-on-surface">{config.partnerType}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editingConfigId === config.id ? (
                            <Input
                              value={config.gtin}
                              onChange={(e) => {
                                setPartnerTypeConfigs(prev => prev.map(c => 
                                  c.id === config.id 
                                    ? { ...c, gtin: e.target.value }
                                    : c
                                ));
                              }}
                              className="font-mono w-32"
                              maxLength={13}
                              placeholder="13 digits"
                            />
                          ) : (
                            <span className="body-medium text-on-surface font-mono">{config.gtin}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editingConfigId === config.id ? (
                            <Input
                              value={config.articleNumber}
                              onChange={(e) => {
                                setPartnerTypeConfigs(prev => prev.map(c => 
                                  c.id === config.id 
                                    ? { ...c, articleNumber: e.target.value }
                                    : c
                                ));
                              }}
                              className="w-40"
                              placeholder="Article number"
                            />
                          ) : (
                            <span className="body-medium text-on-surface">{config.articleNumber}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-2">
                            {config.partnerIds.length === 0 ? (
                              <span className="body-small text-on-surface-variant">No partners assigned</span>
                            ) : (
                              config.partnerIds.map(partnerId => {
                                const partner = allAvailablePartners.find(p => p.id === partnerId);
                                if (!partner) return null;
                                return (
                                  <div key={partnerId} className="flex items-center gap-2">
                                    <span className="body-small text-on-surface">{partner.name}</span>
                                    {editingConfigId === config.id && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setPartnerTypeConfigs(prev => prev.map(c => 
                                            c.id === config.id 
                                              ? { ...c, partnerIds: c.partnerIds.filter(id => id !== partnerId) }
                                              : c
                                          ));
                                        }}
                                        className="h-6 w-6 p-0 text-error"
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </div>
                                );
                              })
                            )}
                            {editingConfigId === config.id && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setAddingPartnerToTypeId(config.id);
                                  setIsAddPartnerDialogOpen(true);
                                }}
                                className="gap-1 mt-2"
                              >
                                <Plus className="w-3 h-3" />
                                Add partner
                              </Button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {editingConfigId === config.id ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  // Validate before saving
                                  if (!/^\d{13}$/.test(config.gtin.trim())) {
                                    toast.error('GTIN must be exactly 13 digits');
                                    return;
                                  }
                                  if (!config.articleNumber.trim()) {
                                    toast.error('Article number is required');
                                    return;
                                  }
                                  setEditingConfigId(null);
                                  toast.success('Partner type updated');
                                }}
                                className="gap-1"
                              >
                                <Save className="w-4 h-4" />
                                Save
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingConfigId(null);
                                  // Reset to original values if needed
                                }}
                                className="gap-1"
                              >
                                <X className="w-4 h-4" />
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingConfigId(config.id)}
                                className="gap-1"
                              >
                                <Edit2 className="w-4 h-4" />
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete partner type "${config.partnerType}"?`)) {
                                    setPartnerTypeConfigs(prev => prev.filter(c => c.id !== config.id));
                                    toast.success('Partner type deleted');
                                  }
                                }}
                                className="gap-1 text-error"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* GTIN Mapping Table */}
      {mainTab === 'overview-overrides' && (
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
                    <th 
                      className="px-4 py-3 text-left title-small text-on-surface md:cursor-pointer md:hover:bg-surface-container-highest transition-colors"
                      onClick={() => handleSort('partner')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Partner</span>
                        <div className="hidden md:flex flex-col">
                          <ArrowUp 
                            size={12} 
                            className={sortField === 'partner' && sortDirection === 'asc' ? 'text-primary' : 'text-on-surface-variant opacity-30'} 
                          />
                          <ArrowDown 
                            size={12} 
                            className={sortField === 'partner' && sortDirection === 'desc' ? 'text-primary' : 'text-on-surface-variant opacity-30'} 
                            style={{ marginTop: '-4px' }}
                          />
                        </div>
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left title-small text-on-surface md:cursor-pointer md:hover:bg-surface-container-highest transition-colors"
                      onClick={() => handleSort('brand')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Brand</span>
                        <div className="hidden md:flex flex-col">
                          <ArrowUp 
                            size={12} 
                            className={sortField === 'brand' && sortDirection === 'asc' ? 'text-primary' : 'text-on-surface-variant opacity-30'} 
                          />
                          <ArrowDown 
                            size={12} 
                            className={sortField === 'brand' && sortDirection === 'desc' ? 'text-primary' : 'text-on-surface-variant opacity-30'} 
                            style={{ marginTop: '-4px' }}
                          />
                        </div>
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left title-small text-on-surface md:cursor-pointer md:hover:bg-surface-container-highest transition-colors"
                      onClick={() => handleSort('partnerType')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Partner Type</span>
                        <div className="hidden md:flex flex-col">
                          <ArrowUp 
                            size={12} 
                            className={sortField === 'partnerType' && sortDirection === 'asc' ? 'text-primary' : 'text-on-surface-variant opacity-30'} 
                          />
                          <ArrowDown 
                            size={12} 
                            className={sortField === 'partnerType' && sortDirection === 'desc' ? 'text-primary' : 'text-on-surface-variant opacity-30'} 
                            style={{ marginTop: '-4px' }}
                          />
                        </div>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left title-small text-on-surface">Category</th>
                    <th 
                      className="px-4 py-3 text-left title-small text-on-surface md:cursor-pointer md:hover:bg-surface-container-highest transition-colors"
                      onClick={() => handleSort('gtin')}
                    >
                      <div className="flex items-center gap-2">
                        <span>GTIN</span>
                        <div className="hidden md:flex flex-col">
                          <ArrowUp 
                            size={12} 
                            className={sortField === 'gtin' && sortDirection === 'asc' ? 'text-primary' : 'text-on-surface-variant opacity-30'} 
                          />
                          <ArrowDown 
                            size={12} 
                            className={sortField === 'gtin' && sortDirection === 'desc' ? 'text-primary' : 'text-on-surface-variant opacity-30'} 
                            style={{ marginTop: '-4px' }}
                          />
                        </div>
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left title-small text-on-surface md:cursor-pointer md:hover:bg-surface-container-highest transition-colors"
                      onClick={() => handleSort('articleNumber')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Article Number</span>
                        <div className="hidden md:flex flex-col">
                          <ArrowUp 
                            size={12} 
                            className={sortField === 'articleNumber' && sortDirection === 'asc' ? 'text-primary' : 'text-on-surface-variant opacity-30'} 
                          />
                          <ArrowDown 
                            size={12} 
                            className={sortField === 'articleNumber' && sortDirection === 'desc' ? 'text-primary' : 'text-on-surface-variant opacity-30'} 
                            style={{ marginTop: '-4px' }}
                          />
                        </div>
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left title-small text-on-surface md:cursor-pointer md:hover:bg-surface-container-highest transition-colors"
                      onClick={() => handleSort('source')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Source</span>
                        <div className="hidden md:flex flex-col">
                          <ArrowUp 
                            size={12} 
                            className={sortField === 'source' && sortDirection === 'asc' ? 'text-primary' : 'text-on-surface-variant opacity-30'} 
                          />
                          <ArrowDown 
                            size={12} 
                            className={sortField === 'source' && sortDirection === 'desc' ? 'text-primary' : 'text-on-surface-variant opacity-30'} 
                            style={{ marginTop: '-4px' }}
                          />
                        </div>
                      </div>
                    </th>
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
                    displayedMappings
                      .filter(mapping => {
                        // Additional safeguard: when filter is 'overrides', only show actual overrides
                        if (filterChip === 'overrides') {
                          return mapping.source === 'override' && mapping.partnerId;
                        }
                        return true;
                      })
                      .map(mapping => (
                      <tr
                        key={mapping.id}
                        className={`border-b border-outline-variant transition-colors ${
                          editingRowId === mapping.id 
                            ? 'bg-primary-container/10' 
                            : 'hover:bg-surface-container-high'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <Checkbox
                            checked={selectedRows.has(mapping.id)}
                            onCheckedChange={() => toggleRowSelection(mapping.id)}
                          />
                        </td>
                        <td className="px-4 py-3 body-medium text-on-surface">
                          {mapping.partnerId ? getPartnerName(mapping.partnerId) : '-'}
                        </td>
                        <td className="px-4 py-3 body-medium text-on-surface">
                          {mapping.brandId ? availableBrands.find(b => b.id === mapping.brandId)?.name || mapping.brandId : '-'}
                        </td>
                        <td className="px-4 py-3 body-medium text-on-surface">{mapping.partnerType}</td>
                        <td className="px-4 py-3">
                          {editingRowId === mapping.id ? (
                            <div className="w-32">
                              <Select
                                value={inlineEditState?.category || undefined}
                                onValueChange={(value) => {
                                  setInlineEditState(prev => {
                                    if (!prev) return null;
                                    return { ...prev, category: value };
                                  });
                                }}
                              >
                                <SelectTrigger>
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
                          ) : (
                            <span className="body-medium text-on-surface">{mapping.category || '-'}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editingRowId === mapping.id ? (
                            <Input
                              value={inlineEditState?.gtin || ''}
                              onChange={(e) => setInlineEditState(prev => prev ? { ...prev, gtin: e.target.value } : null)}
                              className="font-mono w-32"
                              maxLength={13}
                              placeholder="13 digits"
                            />
                          ) : (
                            <span className="body-medium text-on-surface font-mono">{mapping.gtin}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editingRowId === mapping.id ? (
                            <Input
                              value={inlineEditState?.articleNumber || ''}
                              onChange={(e) => setInlineEditState(prev => prev ? { ...prev, articleNumber: e.target.value } : null)}
                              className="w-40"
                              placeholder="Article number"
                            />
                          ) : (
                            <span className="body-medium text-on-surface">{mapping.articleNumber}</span>
                          )}
                        </td>
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
                          {editingRowId === mapping.id ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSaveInlineEdit(mapping)}
                                className="gap-1"
                              >
                                <Save className="w-4 h-4" />
                                Save
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCancelEdit}
                                className="gap-1"
                              >
                                <X className="w-4 h-4" />
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              {mapping.source === 'override' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleStartEdit(mapping)}
                                    className="gap-1"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      if (confirm(`Are you sure you want to delete this override?`)) {
                                        setPartnerOverrides(prev => prev.filter(m => m.id !== mapping.id));
                                        setSelectedRows(prev => {
                                          const newSet = new Set(prev);
                                          newSet.delete(mapping.id);
                                          return newSet;
                                        });
                                        toast.success('Override deleted');
                                      }
                                    }}
                                    className="gap-1 text-error"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                  </Button>
                                </>
                              )}
                              {mapping.source === 'inherited' && (
                                <span className="text-sm text-on-surface-variant">Read-only</span>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}


      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'edit' ? 'Edit' : 'Create'} {filterChip === 'inherited' ? 'Partner Type Default' : 'Override'}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === 'edit' 
                ? 'Update the GTIN mapping details'
                : filterChip === 'inherited'
                ? 'Create a new partner type default mapping'
                : 'Create a new partner-specific override'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="partnerType">Partner Type *</Label>
              {filterChip === 'inherited' && dialogMode === 'create' ? (
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
                    {availablePartnerTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {(filterChip === 'overrides' || (dialogMode === 'create' && filterChip !== 'inherited') || (dialogMode === 'create' && editingMapping)) && (
              <>
                <div>
                  <Label htmlFor="brandSelectDialog">Brand *</Label>
                  <Select
                    value={formState.brandId}
                    onValueChange={(value) => setFormState(prev => ({ ...prev, brandId: value }))}
                  >
                    <SelectTrigger id="brandSelectDialog">
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBrands.map(brand => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="partnerId">Partner *</Label>
                  <Select
                    value={formState.partnerId}
                    onValueChange={(value) => {
                      setFormState(prev => ({ 
                        ...prev, 
                        partnerId: value
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

                {(filterChip === 'overrides' || (dialogMode === 'create' && filterChip !== 'inherited') || (dialogMode === 'create' && editingMapping)) && (
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formState.category || ''}
                      onValueChange={(value) => setFormState(prev => ({ ...prev, category: value || '' }))}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="body-small text-on-surface-variant mt-1">
                      Optional: Select a category for this override
                    </p>
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

      {/* Add Partner Type Dialog */}
      <Dialog open={isAddPartnerTypeDialogOpen} onOpenChange={setIsAddPartnerTypeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Partner Type</DialogTitle>
            <DialogDescription>
              Add a new partner type name to the available options.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="newPartnerTypeName">Partner Type Name *</Label>
              <Input
                id="newPartnerTypeName"
                value={newPartnerTypeName}
                onChange={(e) => setNewPartnerTypeName(e.target.value)}
                placeholder="Enter partner type name"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddPartnerTypeDialogOpen(false);
              setNewPartnerTypeName('');
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddPartnerTypeName}>
              <Save className="w-4 h-4 mr-2" />
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add GTIN Mapping Dialog */}
      <Dialog open={isAddGtinMappingDialogOpen} onOpenChange={setIsAddGtinMappingDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add GTIN Mapping</DialogTitle>
            <DialogDescription>
              Add a new GTIN mapping with brand, partner type, GTIN, Article number, and partners.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="brandSelect">Brand *</Label>
              <Select
                value={newConfigFormState.brandId}
                onValueChange={(value) => setNewConfigFormState(prev => ({ ...prev, brandId: value }))}
              >
                <SelectTrigger id="brandSelect">
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {availableBrands.map(brand => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="newPartnerType">Partner Type *</Label>
              <Select
                value={newConfigFormState.partnerType}
                onValueChange={(value) => setNewConfigFormState(prev => ({ ...prev, partnerType: value as PartnerType }))}
              >
                <SelectTrigger id="newPartnerType">
                  <SelectValue placeholder="Select partner type" />
                </SelectTrigger>
                <SelectContent>
                  {availablePartnerTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="newGtin">GTIN</Label>
              <Input
                id="newGtin"
                value={newConfigFormState.gtin}
                onChange={(e) => setNewConfigFormState(prev => ({ ...prev, gtin: e.target.value }))}
                placeholder="13-digit GTIN"
                maxLength={13}
                className="font-mono"
              />
              <p className="body-small text-on-surface-variant mt-1">
                Must be exactly 13 digits (optional)
              </p>
            </div>
            <div>
              <Label htmlFor="newArticleNumber">Article Number</Label>
              <Input
                id="newArticleNumber"
                value={newConfigFormState.articleNumber}
                onChange={(e) => setNewConfigFormState(prev => ({ ...prev, articleNumber: e.target.value }))}
                placeholder="Article number for financial reporting"
              />
            </div>
            <div>
              <Label>Partners</Label>
              <div className="space-y-2 mt-2 max-h-48 overflow-y-auto border border-outline-variant rounded-lg p-3">
                {allAvailablePartners.length === 0 ? (
                  <p className="body-small text-on-surface-variant">No partners available</p>
                ) : (
                  allAvailablePartners.map(partner => (
                    <div key={partner.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`partner-${partner.id}`}
                        checked={newConfigFormState.partnerIds.includes(partner.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewConfigFormState(prev => ({
                              ...prev,
                              partnerIds: [...prev.partnerIds, partner.id]
                            }));
                          } else {
                            setNewConfigFormState(prev => ({
                              ...prev,
                              partnerIds: prev.partnerIds.filter(id => id !== partner.id)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={`partner-${partner.id}`} className="body-medium text-on-surface cursor-pointer flex-1">
                        {partner.name} ({partner.code})
                      </Label>
                    </div>
                  ))
                )}
              </div>
              <p className="body-small text-on-surface-variant mt-1">
                Select one or multiple partners to connect to this mapping
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddGtinMappingDialogOpen(false);
              setNewConfigFormState({
                brandId: '',
                partnerType: 'Main Partner',
                gtin: '',
                articleNumber: '',
                partnerIds: []
              });
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddGtinMapping}>
              <Save className="w-4 h-4 mr-2" />
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Partner to Type Dialog */}
      <Dialog open={isAddPartnerDialogOpen} onOpenChange={setIsAddPartnerDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Partner</DialogTitle>
            <DialogDescription>
              Select a partner to add to this partner type.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="partnerSelect">Partner *</Label>
              <Select
                onValueChange={(value) => handleAddPartnerToType(value)}
              >
                <SelectTrigger id="partnerSelect">
                  <SelectValue placeholder="Select a partner" />
                </SelectTrigger>
                <SelectContent>
                  {addingPartnerToTypeId && (() => {
                    const config = partnerTypeConfigs.find(c => c.id === addingPartnerToTypeId);
                    const assignedPartnerIds = config?.partnerIds || [];
                    return allAvailablePartners
                      .filter(p => !assignedPartnerIds.includes(p.id))
                      .map(partner => (
                        <SelectItem key={partner.id} value={partner.id}>
                          {partner.name} ({partner.code})
                        </SelectItem>
                      ));
                  })()}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddPartnerDialogOpen(false);
              setAddingPartnerToTypeId(null);
            }}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

