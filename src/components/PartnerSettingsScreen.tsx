import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { ArrowLeft, HelpCircle, Save, Send, AlertCircle, Lock } from 'lucide-react';
import { Brand, Country } from './StoreSelector';
import { Partner } from './PartnerWarehouseSelector';
import { useMediaQuery } from './ui/use-mobile';
import { toast } from 'sonner';
import { PORTAL_CONFIG_ATTRIBUTE_DEFS } from '../data/portalConfigAttributeDefs';

export interface PartnerPolicy {
  // Store app rules
  expiredItemsToReturnAfterWeeks?: number;
  commission?: {
    percentage?: number;
    priceReductionAtWeeks?: number;
    secondTrySpanWeeks?: number;
  };
  notClaimedBoxes: {
    missingBoxesCancelAfterWeeks?: number;
    missingDeliveriesCancelAfterWeeks?: number;
  };
  missingItems: {
    displayMaskingToPartner: boolean; // Missing shown as Sold
  };
  brokenItems: {
    displayMaskingToPartner: boolean; // Broken shown as Sold
  };
  rejectWindow: {
    allowedPeriodHours: number; // Default 24
    reasonCodes: string[]; // Broken, Not accepted brand, Not in season, Inherited from box/delivery
  };
  returnOrdersSLA: {
    partnerMustReceiveWithinWeeks?: number;
  };
  
  // Partner portal rules
  notReceivedReturnOrders: {
    autoCloseAfterWeeks?: number;
  };
  /** Attribute keys required during item intake (from Dropdown values config). */
  mandatoryFields: string[];
  
  // Metadata
  scope: 'brand-partner' | 'brand-partner-country';
  countryInherit?: boolean;
  status: 'draft' | 'published';
  version?: number;
}

interface PartnerSettingsScreenProps {
  onBack: () => void;
  brands: Brand[];
  partners: Partner[];
  countries: Country[];
  currentUserRole?: 'Admin' | 'Brand Admin' | 'Partner Admin' | 'Store Manager' | 'Store Staff';
}

export default function PartnerSettingsScreen({
  onBack,
  brands,
  partners,
  countries,
  currentUserRole = 'Admin'
}: PartnerSettingsScreenProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Only disable for specific roles - Admin and Brand Admin should have full access
  // Explicitly check for Admin and Brand Admin to ensure they have full access
  const isReadOnly = !(currentUserRole === 'Admin' || currentUserRole === 'Brand Admin');
  
  // Context selection state
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [selectedCountryId, setSelectedCountryId] = useState<string>('');
  const [countryInherit, setCountryInherit] = useState<boolean>(true);
  
  // Policy state
  const [policy, setPolicy] = useState<PartnerPolicy>({
    notClaimedBoxes: {},
    missingItems: {
      displayMaskingToPartner: true
    },
    brokenItems: {
      displayMaskingToPartner: true
    },
    rejectWindow: {
      allowedPeriodHours: 24,
      reasonCodes: []
    },
    returnOrdersSLA: {},
    notReceivedReturnOrders: {
      autoCloseAfterWeeks: 4
    },
    // Item ID and Price are always mandatory (not editable)
    mandatoryFields: ['itemId', 'price'],
    scope: 'brand-partner',
    status: 'draft'
  });
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  // Update policy helper
  const updatePolicy = (updates: Partial<PartnerPolicy>) => {
    setPolicy(prev => {
      const next = { ...prev, ...updates };
      // Enforce always-mandatory fields
      const required = new Set(['itemId', 'price']);
      next.mandatoryFields = Array.from(new Set([...(next.mandatoryFields ?? []), ...required]));
      return next;
    });
    setIsDirty(true);
    setHasUnsavedChanges(true);
  };
  
  // Handle save
  const handleSave = () => {
    // Save as draft
    updatePolicy({ status: 'draft' });
    toast.success('Changes saved as draft');
    setHasUnsavedChanges(false);
  };
  
  // Handle publish
  const handlePublish = () => {
    // In a real app, this would show a dialog for version notes
    updatePolicy({ status: 'published' });
    toast.success('Configuration published');
    setHasUnsavedChanges(false);
    setIsDirty(false);
  };
  
  // Filter countries by brand
  const availableCountries = countries.filter(c => c.brandId === selectedBrandId);
  
  return (
    <div className="min-h-screen bg-surface">
      {/* Top App Bar */}
      <div className="sticky top-0 z-10 bg-surface border-b border-outline-variant">
        <div className="flex items-center h-16 px-4 md:px-6">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-surface-container-high transition-colors mr-2"
            aria-label="Back"
          >
            <ArrowLeft className="h-6 w-6 text-on-surface-variant" />
          </button>
          <h1 className="title-large text-on-surface flex-1">
            Partner settings
            {hasUnsavedChanges && (
              <span className="ml-2 w-2 h-2 bg-primary rounded-full inline-block" />
            )}
          </h1>
        </div>
        
        {/* Context Toolbar - Sticky */}
        <div className="px-4 md:px-6 py-3 bg-surface-container border-b border-outline-variant">
          <div className="flex flex-wrap items-center gap-2">
            {/* Partner Selector */}
            <Select
              value={selectedPartnerId}
              onValueChange={setSelectedPartnerId}
              disabled={isReadOnly}
            >
              <SelectTrigger className="w-[180px] bg-surface-container border border-outline-variant rounded-lg">
                <SelectValue placeholder="Select Partner" />
              </SelectTrigger>
              <SelectContent>
                {partners.map(partner => (
                  <SelectItem key={partner.id} value={partner.id}>
                    {partner.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Brand Selector */}
            <Select
              value={selectedBrandId}
              onValueChange={setSelectedBrandId}
              disabled={isReadOnly}
            >
              <SelectTrigger className="w-[180px] bg-surface-container border border-outline-variant rounded-lg">
                <SelectValue placeholder="Select Brand" />
              </SelectTrigger>
              <SelectContent>
                {brands.map(brand => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Country Selector - Only show when brand is selected */}
            {selectedBrandId && (
              <>
                <Select
                  value={selectedCountryId}
                  onValueChange={setSelectedCountryId}
                  disabled={isReadOnly || countryInherit}
                >
                  <SelectTrigger className="w-[180px] bg-surface-container border border-outline-variant rounded-lg">
                    <SelectValue placeholder="Select Country (Optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inherit">Inherit brand default</SelectItem>
                    {availableCountries.map(country => (
                      <SelectItem key={country.id} value={country.id}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={countryInherit}
                    onCheckedChange={setCountryInherit}
                    disabled={isReadOnly}
                  />
                  <Label className="body-small text-on-surface-variant">
                    Inherit brand default
                  </Label>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Store App Section */}
        <Card className="border border-outline">
          <CardHeader>
            <CardTitle className="title-medium text-on-surface">Store app</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Expired items */}
            <div className="space-y-3 p-4 bg-surface-container rounded-lg border border-outline-variant">
              <div className="flex items-center gap-2">
                <Label className="body-large font-medium text-on-surface">
                  Flag Available items as Expired after
                </Label>
                <HelpCircle className="w-4 h-4 text-on-surface-variant" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    value={policy.expiredItemsToReturnAfterWeeks || ''}
                    onChange={(e) => updatePolicy({ 
                      expiredItemsToReturnAfterWeeks: parseInt(e.target.value) || undefined 
                    })}
                    disabled={isReadOnly}
                    className={`w-32 h-12 md:h-10 bg-surface-container border border-outline-variant rounded-lg ${!isReadOnly ? 'focus-visible:border-primary focus-visible:ring-primary/20' : ''}`}
                    placeholder="4"
                  />
                  <span className="body-medium text-on-surface-variant">weeks</span>
                </div>
                <div className="flex items-center gap-3">
                  <Label className="body-medium text-on-surface">Flag again as Expired after:</Label>
                  <Input
                    type="number"
                    value={policy.commission?.secondTrySpanWeeks || ''}
                    onChange={(e) => updatePolicy({
                      commission: {
                        ...policy.commission,
                        secondTrySpanWeeks: parseInt(e.target.value) || undefined
                      }
                    })}
                    disabled={isReadOnly}
                    className={`w-32 h-12 md:h-10 bg-surface-container border border-outline-variant rounded-lg ${!isReadOnly ? 'focus-visible:border-primary focus-visible:ring-primary/20' : ''}`}
                    placeholder="4"
                  />
                  <span className="body-medium text-on-surface-variant">weeks</span>
                </div>
              </div>
            </div>

            {/* Missing items */}
            <div className="space-y-4 p-4 bg-surface-container rounded-lg border border-outline-variant">
              <Label className="body-large font-medium text-on-surface">Missing items</Label>
              
              <div className="space-y-4 pl-2">
                <div className="flex items-center justify-between p-3 bg-surface-container-high rounded-md border border-outline-variant">
                  <Label className="body-medium text-on-surface">
                    Display masking to partner: Missing shown as Sold
                  </Label>
                  <Switch
                    checked={policy.missingItems.displayMaskingToPartner}
                    onCheckedChange={(checked) => updatePolicy({
                      missingItems: {
                        ...policy.missingItems,
                        displayMaskingToPartner: checked
                      }
                    })}
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </div>

            {/* Broken items */}
            <div className="space-y-4 p-4 bg-surface-container rounded-lg border border-outline-variant">
              <Label className="body-large font-medium text-on-surface">Broken items</Label>
              
              <div className="space-y-4 pl-2">
                <div className="flex items-center justify-between p-3 bg-surface-container-high rounded-md border border-outline-variant">
                  <Label className="body-medium text-on-surface">
                    Display masking to partner: Broken shown as Sold
                  </Label>
                  <Switch
                    checked={policy.brokenItems.displayMaskingToPartner}
                    onCheckedChange={(checked) => updatePolicy({
                      brokenItems: {
                        ...policy.brokenItems,
                        displayMaskingToPartner: checked
                      }
                    })}
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </div>

            {/* Reject window */}
            <div className="space-y-4 p-4 bg-surface-container rounded-lg border border-outline-variant">
              <div className="flex items-center gap-2">
                <Label className="body-large font-medium text-on-surface">Reject window</Label>
                <HelpCircle className="w-4 h-4 text-on-surface-variant" />
              </div>
              
              <div className="space-y-4 pl-2">
                <div className="flex items-center gap-3">
                  <Label className="body-medium text-on-surface">
                    Allowed period after delivery registration:
                  </Label>
                  <Input
                    type="number"
                    value={policy.rejectWindow.allowedPeriodHours}
                    onChange={(e) => updatePolicy({
                      rejectWindow: {
                        ...policy.rejectWindow,
                        allowedPeriodHours: parseInt(e.target.value) || 24
                      }
                    })}
                    disabled={isReadOnly}
                    className={`w-32 h-12 md:h-10 bg-surface-container border border-outline-variant rounded-lg ${!isReadOnly ? 'focus-visible:border-primary focus-visible:ring-primary/20' : ''}`}
                  />
                  <span className="body-medium text-on-surface-variant">hours</span>
                </div>
                
                <div className="space-y-3 p-3 bg-surface-container-high rounded-md border border-outline-variant">
                  <Label className="body-medium text-on-surface">Reason codes available:</Label>
                  <div className="space-y-2">
                    {['Broken', 'Not accepted brand', 'Not in season', 'Inherited from box/delivery'].map(reason => (
                      <div key={reason} className="flex items-center gap-3 p-2 hover:bg-surface-container-high rounded-md">
                        <Checkbox
                          checked={policy.rejectWindow.reasonCodes.includes(reason)}
                          onCheckedChange={(checked) => {
                            const newCodes = checked
                              ? [...policy.rejectWindow.reasonCodes, reason]
                              : policy.rejectWindow.reasonCodes.filter(r => r !== reason);
                            updatePolicy({
                              rejectWindow: {
                                ...policy.rejectWindow,
                                reasonCodes: newCodes
                              }
                            });
                          }}
                          disabled={isReadOnly}
                        />
                        <Label className="body-medium text-on-surface cursor-pointer">{reason}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Partner Portal Section */}
        <Card className="border border-outline">
          <CardHeader>
            <CardTitle className="title-medium text-on-surface">Partner portal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Mandatory fields */}
            <div className="space-y-4 p-4 bg-surface-container rounded-lg border border-outline-variant">
              <Label className="body-large font-medium text-on-surface">Mandatory fields (item intake)</Label>
              <p className="body-small text-on-surface-variant pl-1">
                Fields the partner must complete when adding items
              </p>
              
              <div className="space-y-2 pl-2 p-3 bg-surface-container-high rounded-md border border-outline-variant">
                {[
                  { key: 'itemId', label: 'Item ID' },
                  { key: 'price', label: 'Price' }
                ].map((field) => (
                  <div key={field.key} className="flex items-center gap-3 p-2 rounded-md opacity-80">
                    <Checkbox checked disabled />
                    <div className="flex items-center gap-2">
                      <Label className="body-medium text-on-surface cursor-default">{field.label}</Label>
                      <Lock className="w-4 h-4 text-on-surface-variant" />
                    </div>
                  </div>
                ))}
                {PORTAL_CONFIG_ATTRIBUTE_DEFS.map((field) => (
                  <div key={field.key} className="flex items-center gap-3 p-2 hover:bg-surface-container-high rounded-md">
                    <Checkbox
                      checked={policy.mandatoryFields.includes(field.key)}
                      onCheckedChange={(checked) => {
                        const newFields = checked
                          ? [...policy.mandatoryFields, field.key]
                          : policy.mandatoryFields.filter((f) => f !== field.key);
                        updatePolicy({ mandatoryFields: newFields });
                      }}
                      disabled={isReadOnly}
                    />
                    <Label className="body-medium text-on-surface cursor-pointer">{field.label}</Label>
                  </div>
                ))}
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Publishing & Audit Section */}
        <Card className="border border-outline">
          <CardHeader>
            <CardTitle className="title-medium text-on-surface">Publishing & audit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="body-large text-on-surface">Status</Label>
                <Badge variant={policy.status === 'published' ? 'default' : 'secondary'} className="ml-2">
                  {policy.status === 'published' ? 'Published' : 'Draft'}
                </Badge>
              </div>
              {policy.version && (
                <span className="body-small text-on-surface-variant">
                  Version {policy.version}
                </span>
              )}
            </div>
            
            {isReadOnly && (
              <div className="flex items-center gap-2 p-3 bg-surface-container rounded-lg">
                <Lock className="w-4 h-4 text-on-surface-variant" />
                <span className="body-small text-on-surface-variant">
                  Read-only view. You don't have permission to edit these settings.
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer Bar */}
      <div className="sticky bottom-0 bg-surface border-t border-outline-variant px-4 md:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={onBack}
            disabled={isDirty && !hasUnsavedChanges}
          >
            Cancel
          </Button>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={isReadOnly || !isDirty}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              Save
            </Button>
            
            {hasUnsavedChanges && (
              <Button
                onClick={handlePublish}
                disabled={isReadOnly}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                Publish
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

