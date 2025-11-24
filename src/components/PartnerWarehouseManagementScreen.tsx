import { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { ArrowLeft, Plus, Edit, Building2, Warehouse as WarehouseIcon, Trash2, Save, X, ChevronDown, MoreVertical } from 'lucide-react';
import { Partner, Warehouse } from './PartnerWarehouseSelector';
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface Brand {
  id: string;
  name: string;
}

interface PartnerWarehouseManagementScreenProps {
  onBack: () => void;
  partners: Partner[];
  warehouses: Warehouse[];
  brands: Brand[];
  onSavePartner: (partner: Partner) => void;
  onDeletePartner: (partnerId: string) => void;
  onSaveWarehouse: (warehouse: Warehouse) => void;
  onDeleteWarehouse: (warehouseId: string) => void;
}

type PartnerFormData = {
  id: string;
  name: string;
  code: string;
  productType: 'white-label' | 'resell' | 'wholesale' | 'other';
  brandIds: string[];
};

type WarehouseFormData = {
  id: string;
  name: string;
  code: string;
  location: string;
  partnerId: string;
  brandIds: string[];
};

export default function PartnerWarehouseManagementScreen({
  onBack,
  partners,
  warehouses,
  brands,
  onSavePartner,
  onDeletePartner,
  onSaveWarehouse,
  onDeleteWarehouse
}: PartnerWarehouseManagementScreenProps) {
  // Filter state
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([]);
  const [selectedPartnerIds, setSelectedPartnerIds] = useState<string[]>([]);

  // Partner dialog state
  const [isPartnerDialogOpen, setIsPartnerDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [partnerFormData, setPartnerFormData] = useState<PartnerFormData>({
    id: '',
    name: '',
    code: '',
    productType: 'resell',
    brandIds: []
  });

  // Warehouse dialog state
  const [isWarehouseDialogOpen, setIsWarehouseDialogOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [warehouseFormData, setWarehouseFormData] = useState<WarehouseFormData>({
    id: '',
    name: '',
    code: '',
    location: '',
    partnerId: '',
    brandIds: []
  });

  // Get warehouses for a specific partner
  const getPartnerWarehouses = (partnerId: string) => {
    return warehouses.filter(w => w.partnerId === partnerId);
  };

  // Filter partners by selected brands and partners
  const filteredPartners = useMemo(() => {
    let filtered = partners;
    
    // Filter by selected partners
    if (selectedPartnerIds.length > 0) {
      filtered = filtered.filter(partner => selectedPartnerIds.includes(partner.id));
    }
    
    // Filter by selected brands
    if (selectedBrandIds.length > 0) {
      filtered = filtered.filter(partner => {
        const partnerBrandIds = partner.brandIds || [];
        return selectedBrandIds.some(brandId => partnerBrandIds.includes(brandId));
      });
    }
    
    return filtered;
  }, [partners, selectedBrandIds, selectedPartnerIds]);



  // Open partner dialog for adding new partner
  const handleAddPartner = () => {
    setEditingPartner(null);
    setPartnerFormData({
      id: `partner-${Date.now()}`,
      name: '',
      code: '',
      productType: 'resell',
      brandIds: []
    });
    setIsPartnerDialogOpen(true);
  };

  // Open partner dialog for editing
  const handleEditPartner = (partner: Partner) => {
    setEditingPartner(partner);
    setPartnerFormData({
      id: partner.id,
      name: partner.name,
      code: partner.code || '',
      productType: partner.productType || 'resell',
      brandIds: partner.brandIds || []
    });
    setIsPartnerDialogOpen(true);
  };

  // Save partner
  const handleSavePartner = () => {
    if (!partnerFormData.name.trim()) {
      toast.error('Partner name is required');
      return;
    }
    if (!partnerFormData.code.trim()) {
      toast.error('Partner code is required');
      return;
    }

    const partner: Partner = {
      id: partnerFormData.id,
      name: partnerFormData.name,
      code: partnerFormData.code,
      productType: partnerFormData.productType,
      brandIds: partnerFormData.brandIds
    };

    onSavePartner(partner);
    toast.success(editingPartner ? 'Partner updated successfully' : 'Partner added successfully');
    setIsPartnerDialogOpen(false);
  };

  // Toggle brand selection in partner form
  const togglePartnerBrand = (brandId: string) => {
    setPartnerFormData(prev => ({
      ...prev,
      brandIds: prev.brandIds.includes(brandId)
        ? prev.brandIds.filter(id => id !== brandId)
        : [...prev.brandIds, brandId]
    }));
  };

  // Delete partner
  const handleDeletePartner = (partnerId: string) => {
    const partnerWarehouses = warehouses.filter(w => w.partnerId === partnerId);
    if (partnerWarehouses.length > 0) {
      toast.error(`Cannot delete partner with ${partnerWarehouses.length} associated warehouse(s). Delete warehouses first.`);
      return;
    }

    if (window.confirm('Are you sure you want to delete this partner?')) {
      onDeletePartner(partnerId);
      toast.success('Partner deleted successfully');
    }
  };

  // Open warehouse dialog for adding new warehouse
  const handleAddWarehouse = (partnerId?: string) => {
    setEditingWarehouse(null);
    const partner = partners.find(p => p.id === partnerId);
    setWarehouseFormData({
      id: `warehouse-${Date.now()}`,
      name: '',
      code: '',
      location: '',
      partnerId: partnerId || '',
      brandIds: partner?.brandIds || []
    });
    setIsWarehouseDialogOpen(true);
  };

  // Open warehouse dialog for editing
  const handleEditWarehouse = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setWarehouseFormData({
      id: warehouse.id,
      name: warehouse.name,
      code: warehouse.code,
      location: warehouse.location,
      partnerId: warehouse.partnerId,
      brandIds: warehouse.brandIds || []
    });
    setIsWarehouseDialogOpen(true);
  };

  // Save warehouse
  const handleSaveWarehouse = () => {
    if (!warehouseFormData.name.trim()) {
      toast.error('Warehouse name is required');
      return;
    }
    if (!warehouseFormData.code.trim()) {
      toast.error('Warehouse code is required');
      return;
    }
    if (!warehouseFormData.location.trim()) {
      toast.error('Warehouse location is required');
      return;
    }
    if (!warehouseFormData.partnerId) {
      toast.error('Partner is required');
      return;
    }

    const warehouse: Warehouse = {
      id: warehouseFormData.id,
      name: warehouseFormData.name,
      code: warehouseFormData.code,
      location: warehouseFormData.location,
      partnerId: warehouseFormData.partnerId,
      brandIds: warehouseFormData.brandIds
    };

    onSaveWarehouse(warehouse);
    toast.success(editingWarehouse ? 'Warehouse updated successfully' : 'Warehouse added successfully');
    setIsWarehouseDialogOpen(false);
  };

  // Toggle brand selection in warehouse form
  const toggleWarehouseBrand = (brandId: string) => {
    setWarehouseFormData(prev => ({
      ...prev,
      brandIds: prev.brandIds.includes(brandId)
        ? prev.brandIds.filter(id => id !== brandId)
        : [...prev.brandIds, brandId]
    }));
  };

  // Delete warehouse
  const handleDeleteWarehouse = (warehouseId: string) => {
    if (window.confirm('Are you sure you want to delete this warehouse?')) {
      onDeleteWarehouse(warehouseId);
      toast.success('Warehouse deleted successfully');
    }
  };

  return (
    <div className="h-full flex flex-col bg-surface">
      {/* Header */}
      <div className="bg-surface border-b border-outline-variant px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-on-surface"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="headline-small text-on-surface">Partner & Warehouse Management</h1>
            <p className="body-small text-on-surface-variant">Manage partners and their warehouses</p>
          </div>
        </div>
        <Button
          onClick={handleAddPartner}
          className="bg-primary text-on-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Partner
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Filters */}
          <div className="flex items-center justify-between gap-4">
            <h2 className="title-large text-on-surface">Partners ({filteredPartners.length})</h2>
            <div className="flex items-center gap-2">
              <span className="label-medium text-on-surface-variant">Partner:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center justify-between gap-2 w-[220px] min-h-[40px] px-3 py-2 bg-surface-container-high border border-outline rounded-lg text-on-surface label-medium hover:bg-surface-container-highest transition-colors">
                    <span className="truncate">
                      {selectedPartnerIds.length === 0
                        ? 'All partners'
                        : selectedPartnerIds.length === partners.length
                        ? 'All partners'
                        : selectedPartnerIds.length === 1
                        ? partners.find(p => p.id === selectedPartnerIds[0])?.name || '1 selected'
                        : `${selectedPartnerIds.length} selected`}
                    </span>
                    <ChevronDown className="w-4 h-4 opacity-50 flex-shrink-0" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-[220px] p-1 bg-surface border-outline">
                  <div className="max-h-[300px] overflow-y-auto">
                    <div
                      className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-surface-container-high cursor-pointer"
                      onClick={() => {
                        if (selectedPartnerIds.length === partners.length) {
                          setSelectedPartnerIds([]);
                        } else {
                          setSelectedPartnerIds(partners.map(p => p.id));
                        }
                      }}
                    >
                      <Checkbox
                        checked={selectedPartnerIds.length === partners.length}
                        onCheckedChange={(checked: boolean | 'indeterminate') => {
                          setSelectedPartnerIds(checked === true ? partners.map(p => p.id) : []);
                        }}
                      />
                      <span className="body-medium text-on-surface">All partners</span>
                    </div>
                    <div className="h-px bg-outline-variant my-1" />
                    {partners.map((partner) => (
                      <div
                        key={partner.id}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-surface-container-high cursor-pointer"
                        onClick={() => {
                          if (selectedPartnerIds.includes(partner.id)) {
                            setSelectedPartnerIds(prev => prev.filter(id => id !== partner.id));
                          } else {
                            setSelectedPartnerIds(prev => [...prev, partner.id]);
                          }
                        }}
                      >
                        <Checkbox
                          checked={selectedPartnerIds.includes(partner.id)}
                          onCheckedChange={(checked: boolean | 'indeterminate') => {
                            if (checked === true) {
                              setSelectedPartnerIds(prev => [...prev, partner.id]);
                            } else {
                              setSelectedPartnerIds(prev => prev.filter(id => id !== partner.id));
                            }
                          }}
                        />
                        <span className="body-medium text-on-surface">{partner.name}</span>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              
              <span className="label-medium text-on-surface-variant">Brand:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center justify-between gap-2 w-[220px] min-h-[40px] px-3 py-2 bg-surface-container-high border border-outline rounded-lg text-on-surface label-medium hover:bg-surface-container-highest transition-colors">
                    <span className="truncate">
                      {selectedBrandIds.length === 0
                        ? 'All brands'
                        : selectedBrandIds.length === brands.length
                        ? 'All brands'
                        : selectedBrandIds.length === 1
                        ? brands.find(b => b.id === selectedBrandIds[0])?.name || '1 selected'
                        : `${selectedBrandIds.length} selected`}
                    </span>
                    <ChevronDown className="w-4 h-4 opacity-50 flex-shrink-0" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-[220px] p-1 bg-surface border-outline">
                  <div className="max-h-[300px] overflow-y-auto">
                    <div
                      className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-surface-container-high cursor-pointer"
                      onClick={() => {
                        if (selectedBrandIds.length === brands.length) {
                          setSelectedBrandIds([]);
                        } else {
                          setSelectedBrandIds(brands.map(b => b.id));
                        }
                      }}
                    >
                      <Checkbox
                        checked={selectedBrandIds.length === brands.length}
                        onCheckedChange={(checked: boolean | 'indeterminate') => {
                          setSelectedBrandIds(checked === true ? brands.map(b => b.id) : []);
                        }}
                      />
                      <span className="body-medium text-on-surface">All brands</span>
                    </div>
                    <div className="h-px bg-outline-variant my-1" />
                    {brands.map((brand) => (
                      <div
                        key={brand.id}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-surface-container-high cursor-pointer"
                        onClick={() => {
                          if (selectedBrandIds.includes(brand.id)) {
                            setSelectedBrandIds(prev => prev.filter(id => id !== brand.id));
                          } else {
                            setSelectedBrandIds(prev => [...prev, brand.id]);
                          }
                        }}
                      >
                        <Checkbox
                          checked={selectedBrandIds.includes(brand.id)}
                          onCheckedChange={(checked: boolean | 'indeterminate') => {
                            if (checked === true) {
                              setSelectedBrandIds(prev => [...prev, brand.id]);
                            } else {
                              setSelectedBrandIds(prev => prev.filter(id => id !== brand.id));
                            }
                          }}
                        />
                        <span className="body-medium text-on-surface">{brand.name}</span>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Filter Chips */}
          {(selectedPartnerIds.length > 0 || selectedBrandIds.length > 0) && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="label-small text-on-surface-variant">Active filters:</span>
              
              {/* Partner Filter Chips */}
              {selectedPartnerIds.map(partnerId => {
                const partner = partners.find(p => p.id === partnerId);
                if (!partner) return null;
                return (
                  <div
                    key={partnerId}
                    className="inline-flex items-center gap-2 h-8 px-3 bg-secondary-container text-on-secondary-container border border-outline-variant rounded-lg"
                  >
                    <span className="label-small">{partner.name}</span>
                    <button
                      onClick={() => setSelectedPartnerIds(prev => prev.filter(id => id !== partnerId))}
                      className="p-0.5 rounded-full hover:bg-on-secondary-container/10 transition-colors"
                      aria-label={`Remove ${partner.name} filter`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
              
              {/* Brand Filter Chips */}
              {selectedBrandIds.map(brandId => {
                const brand = brands.find(b => b.id === brandId);
                if (!brand) return null;
                return (
                  <div
                    key={brandId}
                    className="inline-flex items-center gap-2 h-8 px-3 bg-secondary-container text-on-secondary-container border border-outline-variant rounded-lg"
                  >
                    <span className="label-small">{brand.name}</span>
                    <button
                      onClick={() => setSelectedBrandIds(prev => prev.filter(id => id !== brandId))}
                      className="p-0.5 rounded-full hover:bg-on-secondary-container/10 transition-colors"
                      aria-label={`Remove ${brand.name} filter`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
              
              {/* Clear All Filters Button */}
              <button
                onClick={() => {
                  setSelectedPartnerIds([]);
                  setSelectedBrandIds([]);
                }}
                className="inline-flex items-center h-8 px-3 bg-surface-container-high hover:bg-surface-container-highest text-on-surface transition-colors rounded-lg"
              >
                <span className="label-small">Clear all</span>
              </button>
            </div>
          )}

          {/* Partners List */}
          <div>
            <div className="space-y-3">
              {filteredPartners.length === 0 ? (
                <div className="text-center py-8 text-on-surface-variant">
                  <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No partners yet. Click "Add Partner" to get started.</p>
                </div>
              ) : (
                filteredPartners.map((partner) => {
                  const partnerWarehouses = getPartnerWarehouses(partner.id).filter(w => {
                    // Filter by selected brands
                    if (selectedBrandIds.length > 0) {
                      const warehouseBrandIds = w.brandIds || [];
                      if (!selectedBrandIds.some(brandId => warehouseBrandIds.includes(brandId))) {
                        return false;
                      }
                    }
                    return true;
                  });
                  const partnerWarehouseCount = partnerWarehouses.length;
                  
                  return (
                    <div 
                      key={partner.id}
                      className="rounded-lg border bg-surface-container border-outline-variant"
                    >
                      <div className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center flex-shrink-0">
                                <Building2 className="w-5 h-5 text-on-primary-container" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="title-medium text-on-surface">{partner.name}</h3>
                                  <Badge variant="secondary" className="label-small">
                                    {partner.code}
                                  </Badge>
                                  {partner.productType && (
                                    <Badge variant="outline" className="label-small capitalize">
                                      {partner.productType}
                                    </Badge>
                                  )}
                                </div>
                                <p className="body-small text-on-surface-variant mb-2">
                                  {partnerWarehouseCount} warehouse{partnerWarehouseCount !== 1 ? 's' : ''}
                                </p>
                                {/* Selected Brands */}
                                {partner.brandIds && partner.brandIds.length > 0 ? (
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="label-small text-on-surface-variant">Brands:</span>
                                    {partner.brandIds.map(brandId => {
                                      const brand = brands.find(b => b.id === brandId);
                                      if (!brand) return null;
                                      return (
                                        <Badge 
                                          key={brandId} 
                                          variant="outline" 
                                          className="label-small bg-primary-container/20 border-primary-container text-on-primary-container"
                                        >
                                          {brand.name}
                                        </Badge>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <p className="label-small text-on-surface-variant italic">No brands assigned</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddWarehouse(partner.id)}
                                className="text-on-surface border-outline-variant hover:bg-surface-container-highest"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                <span className="label-large">Add warehouse</span>
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-on-surface-variant hover:text-on-surface"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                  <DropdownMenuItem onClick={() => handleEditPartner(partner)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeletePartner(partner.id)}
                                    className="text-error"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                        {/* Show warehouses - always expanded */}
                        {partnerWarehouses.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-outline-variant">
                            <h3 className="title-small text-on-surface mb-3">Warehouses</h3>
                            <div className="space-y-2">
                              {partnerWarehouses.map((warehouse) => (
                                <div
                                  key={warehouse.id}
                                  className="flex items-start justify-between gap-4 p-3 rounded-lg bg-surface hover:bg-surface-container-highest border border-outline-variant"
                                >
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-8 h-8 bg-secondary-container rounded-full flex items-center justify-center flex-shrink-0">
                                      <WarehouseIcon className="w-4 h-4 text-on-secondary-container" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className="title-small text-on-surface">{warehouse.name}</h4>
                                        <Badge variant="secondary" className="label-small">
                                          {warehouse.code}
                                        </Badge>
                                      </div>
                                      <p className="body-small text-on-surface-variant mb-2">{warehouse.location}</p>
                                      {/* Selected Brands */}
                                      {warehouse.brandIds && warehouse.brandIds.length > 0 ? (
                                        <div className="flex flex-wrap items-center gap-1.5">
                                          <span className="label-small text-on-surface-variant">Brands:</span>
                                          {warehouse.brandIds.map(brandId => {
                                            const brand = brands.find(b => b.id === brandId);
                                            if (!brand) return null;
                                            return (
                                              <Badge 
                                                key={brandId} 
                                                variant="outline" 
                                                className="label-small bg-primary-container/20 border-primary-container text-on-primary-container"
                                              >
                                                {brand.name}
                                              </Badge>
                                            );
                                          })}
                                        </div>
                                      ) : (
                                        <p className="label-small text-on-surface-variant italic">No brands assigned</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-on-surface-variant hover:text-on-surface"
                                        >
                                          <MoreVertical className="w-3.5 h-3.5" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-40">
                                        <DropdownMenuItem onClick={() => handleEditWarehouse(warehouse)}>
                                          <Edit className="w-4 h-4 mr-2" />
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={() => handleDeleteWarehouse(warehouse.id)}
                                          className="text-error"
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Partner Dialog */}
      <Dialog open={isPartnerDialogOpen} onOpenChange={setIsPartnerDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingPartner ? 'Edit Partner' : 'Add New Partner'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="partner-name">Partner Name *</Label>
              <Input
                id="partner-name"
                value={partnerFormData.name}
                onChange={(e) => setPartnerFormData({ ...partnerFormData, name: e.target.value })}
                placeholder="e.g., Sellpy Operations"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partner-code">Partner Code *</Label>
              <Input
                id="partner-code"
                value={partnerFormData.code}
                onChange={(e) => setPartnerFormData({ ...partnerFormData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., SELLPY"
                className="uppercase"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partner-type">Product Type</Label>
              <Select
                value={partnerFormData.productType}
                onValueChange={(value: any) => setPartnerFormData({ ...partnerFormData, productType: value })}
              >
                <SelectTrigger id="partner-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="white-label">White Label</SelectItem>
                  <SelectItem value="resell">Resell</SelectItem>
                  <SelectItem value="wholesale">Wholesale</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Brands</Label>
              <div className="border border-outline-variant rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                {brands.length === 0 ? (
                  <p className="body-small text-on-surface-variant">No brands available</p>
                ) : (
                  brands.map((brand) => (
                    <div key={brand.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`partner-brand-${brand.id}`}
                        checked={partnerFormData.brandIds.includes(brand.id)}
                        onCheckedChange={() => togglePartnerBrand(brand.id)}
                      />
                      <Label
                        htmlFor={`partner-brand-${brand.id}`}
                        className="body-medium text-on-surface cursor-pointer flex-1"
                      >
                        {brand.name}
                      </Label>
                    </div>
                  ))
                )}
              </div>
              <p className="label-small text-on-surface-variant">
                Select which brands use this partner
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPartnerDialogOpen(false)}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSavePartner} className="bg-primary text-on-primary">
              <Save className="w-4 h-4 mr-2" />
              {editingPartner ? 'Update' : 'Add'} Partner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Warehouse Dialog */}
      <Dialog open={isWarehouseDialogOpen} onOpenChange={setIsWarehouseDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingWarehouse ? 'Edit Warehouse' : 'Add New Warehouse'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="warehouse-partner">Partner *</Label>
              <Select
                value={warehouseFormData.partnerId}
                onValueChange={(value: string) => {
                  const partner = partners.find(p => p.id === value);
                  setWarehouseFormData({ 
                    ...warehouseFormData, 
                    partnerId: value,
                    brandIds: partner?.brandIds || []
                  });
                }}
                disabled={!!editingWarehouse}
              >
                <SelectTrigger id="warehouse-partner">
                  <SelectValue placeholder="Select a partner" />
                </SelectTrigger>
                <SelectContent>
                  {partners.map((partner) => (
                    <SelectItem key={partner.id} value={partner.id}>
                      {partner.name} ({partner.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editingWarehouse && (
                <p className="label-small text-on-surface-variant">
                  Partner cannot be changed when editing
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="warehouse-name">Warehouse Name *</Label>
              <Input
                id="warehouse-name"
                value={warehouseFormData.name}
                onChange={(e) => setWarehouseFormData({ ...warehouseFormData, name: e.target.value })}
                placeholder="e.g., Stockholm Central Warehouse"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warehouse-code">Warehouse Code *</Label>
              <Input
                id="warehouse-code"
                value={warehouseFormData.code}
                onChange={(e) => setWarehouseFormData({ ...warehouseFormData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., SE-WH-001"
                className="uppercase"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warehouse-location">Location *</Label>
              <Input
                id="warehouse-location"
                value={warehouseFormData.location}
                onChange={(e) => setWarehouseFormData({ ...warehouseFormData, location: e.target.value })}
                placeholder="e.g., Stockholm, Sweden"
              />
            </div>
            <div className="space-y-2">
              <Label>Brands</Label>
              <div className="border border-outline-variant rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                {brands.length === 0 ? (
                  <p className="body-small text-on-surface-variant">No brands available</p>
                ) : (
                  brands.map((brand) => (
                    <div key={brand.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`warehouse-brand-${brand.id}`}
                        checked={warehouseFormData.brandIds.includes(brand.id)}
                        onCheckedChange={() => toggleWarehouseBrand(brand.id)}
                      />
                      <Label
                        htmlFor={`warehouse-brand-${brand.id}`}
                        className="body-medium text-on-surface cursor-pointer flex-1"
                      >
                        {brand.name}
                      </Label>
                    </div>
                  ))
                )}
              </div>
              <p className="label-small text-on-surface-variant">
                Select which brands use this warehouse
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsWarehouseDialogOpen(false)}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSaveWarehouse} className="bg-primary text-on-primary">
              <Save className="w-4 h-4 mr-2" />
              {editingWarehouse ? 'Update' : 'Add'} Warehouse
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



