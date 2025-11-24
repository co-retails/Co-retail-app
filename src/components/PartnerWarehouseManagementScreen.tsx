import React, { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { ArrowLeft, Plus, Edit, Building2, Warehouse as WarehouseIcon, Trash2, Save, X } from 'lucide-react';
import { Partner, Warehouse } from './PartnerWarehouseSelector';
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import { useMediaQuery } from './ui/use-mobile';
import { Separator } from './ui/separator';

interface PartnerWarehouseManagementScreenProps {
  onBack: () => void;
  partners: Partner[];
  warehouses: Warehouse[];
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
};

type WarehouseFormData = {
  id: string;
  name: string;
  code: string;
  location: string;
  partnerId: string;
};

export default function PartnerWarehouseManagementScreen({
  onBack,
  partners,
  warehouses,
  onSavePartner,
  onDeletePartner,
  onSaveWarehouse,
  onDeleteWarehouse
}: PartnerWarehouseManagementScreenProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Partner dialog state
  const [isPartnerDialogOpen, setIsPartnerDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [partnerFormData, setPartnerFormData] = useState<PartnerFormData>({
    id: '',
    name: '',
    code: '',
    productType: 'resell'
  });

  // Warehouse dialog state
  const [isWarehouseDialogOpen, setIsWarehouseDialogOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [warehouseFormData, setWarehouseFormData] = useState<WarehouseFormData>({
    id: '',
    name: '',
    code: '',
    location: '',
    partnerId: ''
  });

  // Selected partner for viewing warehouses
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);

  // Get warehouses for selected partner
  const partnerWarehouses = useMemo(() => {
    if (!selectedPartnerId) return [];
    return warehouses.filter(w => w.partnerId === selectedPartnerId);
  }, [selectedPartnerId, warehouses]);

  // Open partner dialog for adding new partner
  const handleAddPartner = () => {
    setEditingPartner(null);
    setPartnerFormData({
      id: `partner-${Date.now()}`,
      name: '',
      code: '',
      productType: 'resell'
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
      productType: partner.productType || 'resell'
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
      productType: partnerFormData.productType
    };

    onSavePartner(partner);
    toast.success(editingPartner ? 'Partner updated successfully' : 'Partner added successfully');
    setIsPartnerDialogOpen(false);
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
      if (selectedPartnerId === partnerId) {
        setSelectedPartnerId(null);
      }
    }
  };

  // Open warehouse dialog for adding new warehouse
  const handleAddWarehouse = (partnerId?: string) => {
    setEditingWarehouse(null);
    setWarehouseFormData({
      id: `warehouse-${Date.now()}`,
      name: '',
      code: '',
      location: '',
      partnerId: partnerId || selectedPartnerId || ''
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
      partnerId: warehouse.partnerId
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
      partnerId: warehouseFormData.partnerId
    };

    onSaveWarehouse(warehouse);
    toast.success(editingWarehouse ? 'Warehouse updated successfully' : 'Warehouse added successfully');
    setIsWarehouseDialogOpen(false);
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
      <div className="bg-surface-container border-b border-outline-variant px-4 py-3 flex items-center justify-between">
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
            <h1 className="text-xl font-semibold text-on-surface">Partner & Warehouse Management</h1>
            <p className="text-sm text-on-surface-variant">Manage partners and their warehouses</p>
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
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Partners List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Partners ({partners.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {partners.length === 0 ? (
                  <div className="text-center py-8 text-on-surface-variant">
                    <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No partners yet. Click "Add Partner" to get started.</p>
                  </div>
                ) : (
                  partners.map((partner) => {
                    const partnerWarehouseCount = warehouses.filter(w => w.partnerId === partner.id).length;
                    const isSelected = selectedPartnerId === partner.id;
                    
                    return (
                      <Card 
                        key={partner.id}
                        className={`cursor-pointer transition-colors ${
                          isSelected 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:bg-surface-container-high'
                        }`}
                        onClick={() => setSelectedPartnerId(isSelected ? null : partner.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-medium text-on-surface">{partner.name}</h3>
                                <Badge variant="secondary" className="text-xs">
                                  {partner.code}
                                </Badge>
                                {partner.productType && (
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {partner.productType}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-on-surface-variant">
                                {partnerWarehouseCount} warehouse{partnerWarehouseCount !== 1 ? 's' : ''}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddWarehouse(partner.id);
                                }}
                                className="text-on-surface-variant hover:text-on-surface"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditPartner(partner);
                                }}
                                className="text-on-surface-variant hover:text-on-surface"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeletePartner(partner.id);
                                }}
                                className="text-error hover:bg-error/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Show warehouses when partner is selected */}
                          {isSelected && partnerWarehouses.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-outline-variant">
                              <div className="flex items-center gap-2 mb-3">
                                <WarehouseIcon className="w-4 h-4 text-on-surface-variant" />
                                <span className="text-sm font-medium text-on-surface">Warehouses</span>
                              </div>
                              <div className="space-y-2">
                                {partnerWarehouses.map((warehouse) => (
                                  <div
                                    key={warehouse.id}
                                    className="flex items-start justify-between gap-4 p-3 rounded-lg bg-surface-container"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-medium text-sm text-on-surface">{warehouse.name}</h4>
                                        <Badge variant="secondary" className="text-xs">
                                          {warehouse.code}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-on-surface-variant">{warehouse.location}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditWarehouse(warehouse);
                                        }}
                                        className="h-8 w-8 text-on-surface-variant hover:text-on-surface"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteWarehouse(warehouse.id);
                                        }}
                                        className="h-8 w-8 text-error hover:bg-error/10"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
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
                onValueChange={(value) => setWarehouseFormData({ ...warehouseFormData, partnerId: value })}
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
                <p className="text-xs text-on-surface-variant">
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



