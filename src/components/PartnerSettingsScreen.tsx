import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { ArrowLeft, HelpCircle, Save, Send, AlertCircle, Lock } from 'lucide-react';
import { Brand, Country } from './StoreSelector';
import { Partner } from './PartnerWarehouseSelector';
import { useMediaQuery } from './ui/use-mobile';
import { toast } from 'sonner';

export interface PartnerPolicy {
  // Store app rules
  expiredItemsToReturnAfterWeeks?: number;
  commission?: {
    percentage?: number;
    priceReductionAtWeeks?: number;
    secondTrySpanWeeks?: number;
  };
  receiveDeliveries: {
    countItems: boolean;
    reviewItemsWhenReceiving: 'only-if-count-incorrect' | 'always' | 'never';
    ifItemsMissing: 'no-action' | 'auto-mark-missing' | 'flag-for-followup';
  };
  notClaimedBoxes: {
    allowMarkingNotClaimed: 'yes-only-if-box-missing' | 'no';
    cancelAfterWeeks?: number;
    showBanner: boolean;
  };
  missingItems: {
    cancelAfterWeeks?: number;
    autoInvoicePartner: boolean;
    displayMaskingToPartner: boolean; // Missing shown as Sold
  };
  brokenItems: {
    waitingForPayoutMapping?: string;
    autoInvoicePartner: boolean;
    displayMaskingToPartner: boolean; // Broken shown as Sold
  };
  rejectWindow: {
    allowedPeriodHours: number; // Default 24
    reasonCodes: string[]; // Broken, Not accepted brand, Not in season, Inherited from box/delivery
  };
  returnOrdersSLA: {
    partnerMustReceiveWithinWeeks?: number;
    notifyPartnerWhenPrepared: boolean;
    reminderAfterDays?: number;
  };
  shipmentHandling: {
    manualHandoverTick: boolean;
    trackingLinkField: boolean;
  };
  
  // Partner portal rules
  notReceivedReturnOrders: {
    showInPartnerPortal: boolean;
    autoCloseAfterWeeks?: number;
  };
  mandatoryFields: string[]; // Item ID/Ext SKU, Brand, Category, Trend, Price
  allowedActions: {
    canEditItemsPostSubmission: boolean;
    canCancelPendingDeliveries: boolean;
    canSelfApprovePriceReductions: boolean;
  };
  
  // Exceptions & edge cases
  receiveDeliveriesPreview: 'yes-always' | 'no' | 'only-if-items-differ';
  ifItemRejectedOnArrival: {
    reasons: string[];
    autoEnterItemsToReturn: boolean;
  };
  
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
  const isReadOnly = currentUserRole === 'Partner Admin' || currentUserRole === 'Store Manager' || currentUserRole === 'Store Staff';
  
  // Context selection state
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [selectedCountryId, setSelectedCountryId] = useState<string>('');
  const [countryInherit, setCountryInherit] = useState<boolean>(true);
  
  // Policy state
  const [policy, setPolicy] = useState<PartnerPolicy>({
    receiveDeliveries: {
      countItems: true,
      reviewItemsWhenReceiving: 'only-if-count-incorrect',
      ifItemsMissing: 'no-action'
    },
    notClaimedBoxes: {
      allowMarkingNotClaimed: 'no',
      showBanner: false
    },
    missingItems: {
      autoInvoicePartner: false,
      displayMaskingToPartner: true
    },
    brokenItems: {
      autoInvoicePartner: false,
      displayMaskingToPartner: true
    },
    rejectWindow: {
      allowedPeriodHours: 24,
      reasonCodes: []
    },
    returnOrdersSLA: {
      notifyPartnerWhenPrepared: false
    },
    shipmentHandling: {
      manualHandoverTick: false,
      trackingLinkField: false
    },
    notReceivedReturnOrders: {
      showInPartnerPortal: true,
      autoCloseAfterWeeks: 4
    },
    mandatoryFields: [],
    allowedActions: {
      canEditItemsPostSubmission: false,
      canCancelPendingDeliveries: false,
      canSelfApprovePriceReductions: false
    },
    receiveDeliveriesPreview: 'yes-always',
    ifItemRejectedOnArrival: {
      reasons: [],
      autoEnterItemsToReturn: false
    },
    scope: 'brand-partner',
    status: 'draft'
  });
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  // Update policy helper
  const updatePolicy = (updates: Partial<PartnerPolicy>) => {
    setPolicy(prev => ({ ...prev, ...updates }));
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
              <SelectTrigger className="w-[180px] bg-surface-container border-outline focus-visible:border-primary focus-visible:ring-primary/20">
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
              <SelectTrigger className="w-[180px] bg-surface-container border-outline focus-visible:border-primary focus-visible:ring-primary/20">
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
                  <SelectTrigger className="w-[180px] bg-surface-container border-outline focus-visible:border-primary focus-visible:ring-primary/20">
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
        <Card className="border-2 border-outline">
          <CardHeader className="bg-surface-container-low/50">
            <CardTitle className="title-medium text-on-surface">Store app</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Expired items */}
            <div className="space-y-3 p-4 bg-surface-container/30 rounded-lg border border-outline-variant">
              <div className="flex items-center gap-2">
                <Label className="body-large font-medium text-on-surface">
                  Expired items → "To return" after
                </Label>
                <HelpCircle className="w-4 h-4 text-on-surface-variant" />
              </div>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  value={policy.expiredItemsToReturnAfterWeeks || ''}
                  onChange={(e) => updatePolicy({ 
                    expiredItemsToReturnAfterWeeks: parseInt(e.target.value) || undefined 
                  })}
                  disabled={isReadOnly}
                  className="w-32 bg-surface-container border-outline focus-visible:border-primary focus-visible:ring-primary/20"
                  placeholder="4"
                />
                <span className="body-medium text-on-surface-variant">weeks</span>
              </div>
              <p className="body-small text-on-surface-variant pl-1">
                Impacts B2B Expired → Return creation window in Store app
              </p>
            </div>

            <Separator />

            {/* Commission */}
            <div className="space-y-4 p-4 bg-surface-container/30 rounded-lg border border-outline-variant">
              <Label className="body-large font-medium text-on-surface">Commission (if applicable)</Label>
              <div className="space-y-4 pl-2">
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    value={policy.commission?.percentage || ''}
                    onChange={(e) => updatePolicy({
                      commission: {
                        ...policy.commission,
                        percentage: parseFloat(e.target.value) || undefined
                      }
                    })}
                    disabled={isReadOnly}
                    className="w-32 bg-surface-container border-outline focus-visible:border-primary focus-visible:ring-primary/20"
                    placeholder="20"
                  />
                  <span className="body-medium text-on-surface-variant">%</span>
                  <span className="body-small text-on-surface-variant">
                    (Price reduction at X weeks)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Label className="body-medium text-on-surface">Second-try span:</Label>
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
                    className="w-32 bg-surface-container border-outline focus-visible:border-primary focus-visible:ring-primary/20"
                    placeholder="4"
                  />
                  <span className="body-medium text-on-surface-variant">weeks</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Receive deliveries */}
            <div className="space-y-4 p-4 bg-surface-container/30 rounded-lg border border-outline-variant">
              <Label className="body-large font-medium text-on-surface">Receive deliveries in Resell Store app</Label>
              
              <div className="space-y-4 pl-2">
                <div className="flex items-center justify-between p-3 bg-surface-container rounded-md border border-outline-variant">
                  <Label className="body-medium text-on-surface">Count items</Label>
                  <Switch
                    checked={policy.receiveDeliveries.countItems}
                    onCheckedChange={(checked) => updatePolicy({
                      receiveDeliveries: {
                        ...policy.receiveDeliveries,
                        countItems: checked
                      }
                    })}
                    disabled={isReadOnly}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="body-medium text-on-surface">
                    Review items when receiving boxes
                  </Label>
                  <Select
                    value={policy.receiveDeliveries.reviewItemsWhenReceiving}
                    onValueChange={(value: 'only-if-count-incorrect' | 'always' | 'never') => updatePolicy({
                      receiveDeliveries: {
                        ...policy.receiveDeliveries,
                        reviewItemsWhenReceiving: value
                      }
                    })}
                    disabled={isReadOnly || !policy.receiveDeliveries.countItems}
                  >
                    <SelectTrigger className="bg-surface-container border-outline focus-visible:border-primary focus-visible:ring-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="only-if-count-incorrect">Only if count is not correct</SelectItem>
                      <SelectItem value="always">Always</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="body-medium text-on-surface">
                    If items missing: action on receiving screen
                  </Label>
                  <Select
                    value={policy.receiveDeliveries.ifItemsMissing}
                    onValueChange={(value: 'no-action' | 'auto-mark-missing' | 'flag-for-followup') => updatePolicy({
                      receiveDeliveries: {
                        ...policy.receiveDeliveries,
                        ifItemsMissing: value
                      }
                    })}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className="bg-surface-container border-outline focus-visible:border-primary focus-visible:ring-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-action">No further action</SelectItem>
                      <SelectItem value="auto-mark-missing">Auto mark missing</SelectItem>
                      <SelectItem value="flag-for-followup">Flag for follow-up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Not claimed boxes */}
            <div className="space-y-4 p-4 bg-surface-container/30 rounded-lg border border-outline-variant">
              <Label className="body-large font-medium text-on-surface">Not claimed boxes/deliveries</Label>
              
              <div className="space-y-4 pl-2">
                <div className="space-y-2">
                  <Label className="body-medium text-on-surface">
                    On receive: allow marking a box/delivery as not claimed?
                  </Label>
                  <Select
                    value={policy.notClaimedBoxes.allowMarkingNotClaimed}
                    onValueChange={(value: 'yes-only-if-box-missing' | 'no') => updatePolicy({
                      notClaimedBoxes: {
                        ...policy.notClaimedBoxes,
                        allowMarkingNotClaimed: value
                      }
                    })}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className="bg-surface-container border-outline focus-visible:border-primary focus-visible:ring-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes-only-if-box-missing">Yes, only if a box is missing</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {policy.notClaimedBoxes.allowMarkingNotClaimed === 'yes-only-if-box-missing' && (
                  <>
                    <div className="flex items-center gap-3">
                      <Label className="body-medium text-on-surface">Cancel after:</Label>
                      <Input
                        type="number"
                        value={policy.notClaimedBoxes.cancelAfterWeeks || ''}
                        onChange={(e) => updatePolicy({
                          notClaimedBoxes: {
                            ...policy.notClaimedBoxes,
                            cancelAfterWeeks: parseInt(e.target.value) || undefined
                          }
                        })}
                        disabled={isReadOnly}
                        className="w-32 bg-surface-container border-outline focus-visible:border-primary focus-visible:ring-primary/20"
                        placeholder="4"
                      />
                      <span className="body-medium text-on-surface-variant">weeks</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-surface-container rounded-md border border-outline-variant">
                      <Label className="body-medium text-on-surface">
                        Show banner "Not claimed" in delivery details
                      </Label>
                      <Switch
                        checked={policy.notClaimedBoxes.showBanner}
                        onCheckedChange={(checked) => updatePolicy({
                          notClaimedBoxes: {
                            ...policy.notClaimedBoxes,
                            showBanner: checked
                          }
                        })}
                        disabled={isReadOnly}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <Separator />

            {/* Missing items */}
            <div className="space-y-4 p-4 bg-surface-container/30 rounded-lg border border-outline-variant">
              <Label className="body-large font-medium text-on-surface">Missing items</Label>
              
              <div className="space-y-4 pl-2">
                <div className="flex items-center gap-3">
                  <Label className="body-medium text-on-surface">Missing timeout: Cancel after</Label>
                  <Input
                    type="number"
                    value={policy.missingItems.cancelAfterWeeks || ''}
                    onChange={(e) => updatePolicy({
                      missingItems: {
                        ...policy.missingItems,
                        cancelAfterWeeks: parseInt(e.target.value) || undefined
                      }
                    })}
                    disabled={isReadOnly}
                    className="w-32 bg-surface-container border-outline focus-visible:border-primary focus-visible:ring-primary/20"
                    placeholder="4"
                  />
                  <span className="body-medium text-on-surface-variant">weeks</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-surface-container rounded-md border border-outline-variant">
                  <Label className="body-medium text-on-surface">Auto-invoice partner/brand</Label>
                  <Switch
                    checked={policy.missingItems.autoInvoicePartner}
                    onCheckedChange={(checked) => updatePolicy({
                      missingItems: {
                        ...policy.missingItems,
                        autoInvoicePartner: checked
                      }
                    })}
                    disabled={isReadOnly}
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-surface-container rounded-md border border-outline-variant">
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

            <Separator />

            {/* Broken items */}
            <div className="space-y-4 p-4 bg-surface-container/30 rounded-lg border border-outline-variant">
              <Label className="body-large font-medium text-on-surface">Broken items</Label>
              
              <div className="space-y-4 pl-2">
                <div className="flex items-center gap-3">
                  <Label className="body-medium text-on-surface">Broken → waiting for payout mapping</Label>
                  <Input
                    value={policy.brokenItems.waitingForPayoutMapping || ''}
                    onChange={(e) => updatePolicy({
                      brokenItems: {
                        ...policy.brokenItems,
                        waitingForPayoutMapping: e.target.value || undefined
                      }
                    })}
                    disabled={isReadOnly}
                    className="flex-1 max-w-xs bg-surface-container border-outline focus-visible:border-primary focus-visible:ring-primary/20"
                    placeholder="Optional"
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-surface-container rounded-md border border-outline-variant">
                  <Label className="body-medium text-on-surface">Auto-invoice partner/brand</Label>
                  <Switch
                    checked={policy.brokenItems.autoInvoicePartner}
                    onCheckedChange={(checked) => updatePolicy({
                      brokenItems: {
                        ...policy.brokenItems,
                        autoInvoicePartner: checked
                      }
                    })}
                    disabled={isReadOnly}
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-surface-container rounded-md border border-outline-variant">
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

            <Separator />

            {/* Reject window */}
            <div className="space-y-4 p-4 bg-surface-container/30 rounded-lg border border-outline-variant">
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
                    className="w-32 bg-surface-container border-outline focus-visible:border-primary focus-visible:ring-primary/20"
                  />
                  <span className="body-medium text-on-surface-variant">hours</span>
                </div>
                
                <div className="space-y-3 p-3 bg-surface-container rounded-md border border-outline-variant">
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

            <Separator />

            {/* Return orders SLA */}
            <div className="space-y-4 p-4 bg-surface-container/30 rounded-lg border border-outline-variant">
              <div className="flex items-center gap-2">
                <Label className="body-large font-medium text-on-surface">Return orders SLA</Label>
                <HelpCircle className="w-4 h-4 text-on-surface-variant" />
              </div>
              
              <div className="space-y-4 pl-2">
                <div className="flex items-center gap-3">
                  <Label className="body-medium text-on-surface">
                    Partner must receive (scan) returns within
                  </Label>
                  <Input
                    type="number"
                    value={policy.returnOrdersSLA.partnerMustReceiveWithinWeeks || ''}
                    onChange={(e) => updatePolicy({
                      returnOrdersSLA: {
                        ...policy.returnOrdersSLA,
                        partnerMustReceiveWithinWeeks: parseInt(e.target.value) || undefined
                      }
                    })}
                    disabled={isReadOnly}
                    className="w-32 bg-surface-container border-outline focus-visible:border-primary focus-visible:ring-primary/20"
                    placeholder="4"
                  />
                  <span className="body-medium text-on-surface-variant">weeks</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-surface-container rounded-md border border-outline-variant">
                  <Label className="body-medium text-on-surface">
                    Notify partner when return prepared
                  </Label>
                  <Switch
                    checked={policy.returnOrdersSLA.notifyPartnerWhenPrepared}
                    onCheckedChange={(checked) => updatePolicy({
                      returnOrdersSLA: {
                        ...policy.returnOrdersSLA,
                        notifyPartnerWhenPrepared: checked
                      }
                    })}
                    disabled={isReadOnly}
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <Label className="body-medium text-on-surface">Reminder after</Label>
                  <Input
                    type="number"
                    value={policy.returnOrdersSLA.reminderAfterDays || ''}
                    onChange={(e) => updatePolicy({
                      returnOrdersSLA: {
                        ...policy.returnOrdersSLA,
                        reminderAfterDays: parseInt(e.target.value) || undefined
                      }
                    })}
                    disabled={isReadOnly}
                    className="w-32 bg-surface-container border-outline focus-visible:border-primary focus-visible:ring-primary/20"
                    placeholder="7"
                  />
                  <span className="body-medium text-on-surface-variant">days if not received</span>
                  <Switch
                    checked={!!policy.returnOrdersSLA.reminderAfterDays}
                    onCheckedChange={(checked) => updatePolicy({
                      returnOrdersSLA: {
                        ...policy.returnOrdersSLA,
                        reminderAfterDays: checked ? 7 : undefined
                      }
                    })}
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Shipment handling hints */}
            <div className="space-y-4 p-4 bg-surface-container/30 rounded-lg border border-outline-variant">
              <Label className="body-large font-medium text-on-surface">Shipment handling hints (info only)</Label>
              
              <div className="space-y-3 pl-2">
                <div className="flex items-center justify-between p-3 bg-surface-container rounded-md border border-outline-variant">
                  <Label className="body-medium text-on-surface">Manual handover tick?</Label>
                  <Switch
                    checked={policy.shipmentHandling.manualHandoverTick}
                    onCheckedChange={(checked) => updatePolicy({
                      shipmentHandling: {
                        ...policy.shipmentHandling,
                        manualHandoverTick: checked
                      }
                    })}
                    disabled={isReadOnly}
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-surface-container rounded-md border border-outline-variant">
                  <Label className="body-medium text-on-surface">Tracking link field?</Label>
                  <Switch
                    checked={policy.shipmentHandling.trackingLinkField}
                    onCheckedChange={(checked) => updatePolicy({
                      shipmentHandling: {
                        ...policy.shipmentHandling,
                        trackingLinkField: checked
                      }
                    })}
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Partner Portal Section */}
        <Card className="border-2 border-outline">
          <CardHeader className="bg-surface-container-low/50">
            <CardTitle className="title-medium text-on-surface">Partner portal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Not-received return orders visibility */}
            <div className="space-y-4 p-4 bg-surface-container/30 rounded-lg border border-outline-variant">
              <Label className="body-large font-medium text-on-surface">Not-received return orders visibility</Label>
              
              <div className="space-y-4 pl-2">
                <div className="flex items-center justify-between p-3 bg-surface-container rounded-md border border-outline-variant">
                  <Label className="body-medium text-on-surface">Show in partner portal?</Label>
                  <Switch
                    checked={policy.notReceivedReturnOrders.showInPartnerPortal}
                    onCheckedChange={(checked) => updatePolicy({
                      notReceivedReturnOrders: {
                        ...policy.notReceivedReturnOrders,
                        showInPartnerPortal: checked
                      }
                    })}
                    disabled={isReadOnly}
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <Label className="body-medium text-on-surface">Auto-close after</Label>
                  <Input
                    type="number"
                    value={policy.notReceivedReturnOrders.autoCloseAfterWeeks || ''}
                    onChange={(e) => updatePolicy({
                      notReceivedReturnOrders: {
                        ...policy.notReceivedReturnOrders,
                        autoCloseAfterWeeks: parseInt(e.target.value) || undefined
                      }
                    })}
                    disabled={isReadOnly}
                    className="w-32 bg-surface-container border-outline focus-visible:border-primary focus-visible:ring-primary/20"
                    placeholder="4"
                  />
                  <span className="body-medium text-on-surface-variant">weeks</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Mandatory fields */}
            <div className="space-y-4 p-4 bg-surface-container/30 rounded-lg border border-outline-variant">
              <Label className="body-large font-medium text-on-surface">Mandatory fields (item intake)</Label>
              <p className="body-small text-on-surface-variant pl-1">
                Fields the partner must complete when adding items
              </p>
              
              <div className="space-y-2 pl-2 p-3 bg-surface-container rounded-md border border-outline-variant">
                {['Item ID/Ext SKU', 'Brand', 'Category', 'Trend', 'Price'].map(field => (
                  <div key={field} className="flex items-center gap-3 p-2 hover:bg-surface-container-high rounded-md">
                    <Checkbox
                      checked={policy.mandatoryFields.includes(field)}
                      onCheckedChange={(checked) => {
                        const newFields = checked
                          ? [...policy.mandatoryFields, field]
                          : policy.mandatoryFields.filter(f => f !== field);
                        updatePolicy({ mandatoryFields: newFields });
                      }}
                      disabled={isReadOnly}
                    />
                    <Label className="body-medium text-on-surface cursor-pointer">{field}</Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Allowed actions */}
            <div className="space-y-4 p-4 bg-surface-container/30 rounded-lg border border-outline-variant">
              <Label className="body-large font-medium text-on-surface">Allowed actions in partner portal</Label>
              
              <div className="space-y-3 pl-2">
                <div className="flex items-center justify-between p-3 bg-surface-container rounded-md border border-outline-variant">
                  <Label className="body-medium text-on-surface">
                    Can partner edit items post-submission?
                  </Label>
                  <Switch
                    checked={policy.allowedActions.canEditItemsPostSubmission}
                    onCheckedChange={(checked) => updatePolicy({
                      allowedActions: {
                        ...policy.allowedActions,
                        canEditItemsPostSubmission: checked
                      }
                    })}
                    disabled={isReadOnly}
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-surface-container rounded-md border border-outline-variant">
                  <Label className="body-medium text-on-surface">
                    Can partner cancel pending deliveries?
                  </Label>
                  <Switch
                    checked={policy.allowedActions.canCancelPendingDeliveries}
                    onCheckedChange={(checked) => updatePolicy({
                      allowedActions: {
                        ...policy.allowedActions,
                        canCancelPendingDeliveries: checked
                      }
                    })}
                    disabled={isReadOnly}
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-surface-container rounded-md border border-outline-variant">
                  <Label className="body-medium text-on-surface">
                    Can partner self-approve price reductions?
                  </Label>
                  <Switch
                    checked={policy.allowedActions.canSelfApprovePriceReductions}
                    onCheckedChange={(checked) => updatePolicy({
                      allowedActions: {
                        ...policy.allowedActions,
                        canSelfApprovePriceReductions: checked
                      }
                    })}
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exceptions & Edge Cases Section */}
        <Card className="border-2 border-outline">
          <CardHeader className="bg-surface-container-low/50">
            <CardTitle className="title-medium text-on-surface">Exceptions & edge cases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Receive deliveries preview */}
            <div className="space-y-4 p-4 bg-surface-container/30 rounded-lg border border-outline-variant">
              <Label className="body-large font-medium text-on-surface">Receive deliveries – Preview items</Label>
              
              <Select
                value={policy.receiveDeliveriesPreview}
                onValueChange={(value: 'yes-always' | 'no' | 'only-if-items-differ') => updatePolicy({
                  receiveDeliveriesPreview: value
                })}
                disabled={isReadOnly}
              >
                <SelectTrigger className="bg-surface-container border-outline focus-visible:border-primary focus-visible:ring-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes-always">Yes, always</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="only-if-items-differ">Only if items differ from delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* If items missing during review */}
            <div className="space-y-4 p-4 bg-surface-container/30 rounded-lg border border-outline-variant">
              <Label className="body-large font-medium text-on-surface">
                Receive deliveries – If items missing during review
              </Label>
              
              <Select
                value={policy.receiveDeliveries.ifItemsMissing}
                onValueChange={(value: 'no-action' | 'auto-mark-missing' | 'flag-for-followup') => updatePolicy({
                  receiveDeliveries: {
                    ...policy.receiveDeliveries,
                    ifItemsMissing: value
                  }
                })}
                disabled={isReadOnly}
              >
                <SelectTrigger className="bg-surface-container border-outline focus-visible:border-primary focus-visible:ring-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-action">Create a list & inform partner</SelectItem>
                  <SelectItem value="auto-mark-missing">Auto set missing</SelectItem>
                  <SelectItem value="flag-for-followup">Block register until reviewed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* If item rejected on arrival */}
            <div className="space-y-4 p-4 bg-surface-container/30 rounded-lg border border-outline-variant">
              <Label className="body-large font-medium text-on-surface">If item rejected on arrival</Label>
              
              <div className="space-y-4 pl-2">
                <div className="space-y-3 p-3 bg-surface-container rounded-md border border-outline-variant">
                  <Label className="body-medium text-on-surface">Choose which reasons appear:</Label>
                  <div className="space-y-2">
                    {['Broken', 'Not accepted brand', 'Not in season', 'Inherited from box/delivery'].map(reason => (
                      <div key={reason} className="flex items-center gap-3 p-2 hover:bg-surface-container-high rounded-md">
                        <Checkbox
                          checked={policy.ifItemRejectedOnArrival.reasons.includes(reason)}
                          onCheckedChange={(checked) => {
                            const newReasons = checked
                              ? [...policy.ifItemRejectedOnArrival.reasons, reason]
                              : policy.ifItemRejectedOnArrival.reasons.filter(r => r !== reason);
                            updatePolicy({
                              ifItemRejectedOnArrival: {
                                ...policy.ifItemRejectedOnArrival,
                                reasons: newReasons
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
                
                <div className="flex items-center justify-between p-3 bg-surface-container rounded-md border border-outline-variant">
                  <Label className="body-medium text-on-surface">
                    Whether rejected items automatically enter "Items to return"
                  </Label>
                  <Switch
                    checked={policy.ifItemRejectedOnArrival.autoEnterItemsToReturn}
                    onCheckedChange={(checked) => updatePolicy({
                      ifItemRejectedOnArrival: {
                        ...policy.ifItemRejectedOnArrival,
                        autoEnterItemsToReturn: checked
                      }
                    })}
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Publishing & Audit Section */}
        <Card>
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

