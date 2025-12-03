import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Section } from './ui/section';
import { Separator } from './ui/separator';
import { toast } from 'sonner@2.0.3';
import { 
  PackageIcon, 
  ScanIcon,
  CheckIcon,
  MoreVertical,
  ArrowLeft
} from 'lucide-react';
import { OrderItem } from './OrderCreationScreen';
import ActiveScanner from './ActiveScanner';
import { ItemCard, BaseItem } from './ItemCard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface BoxDetailsSideSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  orderItems: OrderItem[];
  scannedItems: OrderItem[];
  onItemScanned: (item: OrderItem) => void;
  onMarkAsScanned: (item: OrderItem) => void;
  onSaveAndClose: () => void;
  onContinue: () => void;
}

export default function BoxDetailsSideSheet({
  isOpen,
  onOpenChange,
  orderItems,
  scannedItems,
  onItemScanned,
  onMarkAsScanned,
  onSaveAndClose,
  onContinue
}: BoxDetailsSideSheetProps) {
  const [activeTab, setActiveTab] = useState<'scanned' | 'not-scanned'>('not-scanned');
  const scannedItemIds = new Set(scannedItems.map(item => item.id));
  const notScannedItems = orderItems.filter(item => !scannedItemIds.has(item.id));

  const handleScan = () => {
    // Simulate scanning - in real app this would use camera
    if (notScannedItems.length > 0) {
      const randomItem = notScannedItems[Math.floor(Math.random() * notScannedItems.length)];
      onItemScanned(randomItem);
      toast.success(`Item ${randomItem.itemId || randomItem.partnerItemId} scanned`);
    } else {
      toast.error('No items available to scan');
    }
  };

  const handleManualEntry = (itemId: string) => {
    const item = notScannedItems.find(i => 
      i.itemId === itemId || 
      i.partnerItemId === itemId || 
      i.retailerItemId === itemId
    );
    
    if (item) {
      onItemScanned(item);
      toast.success(`Item ${itemId} added`);
    } else {
      toast.error(`Item ${itemId} not found`);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex flex-col p-0 max-h-screen w-full sm:max-w-full [&_[data-slot=sheet-close]]:hidden"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-outline-variant flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-on-surface-variant"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="text-left">
              <SheetTitle className="title-large">Add Items to Box</SheetTitle>
              <SheetDescription className="body-medium">
                Scan items or mark items as scanned to add them to the box
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {/* Active Scanner - Fixed height at top */}
          <div className="flex-shrink-0 px-6 pt-4 pb-4 border-b border-outline-variant overflow-hidden">
            <div className="h-[280px] min-h-[280px] max-h-[280px]">
              <ActiveScanner
                onScan={handleScan}
                onManualEntry={handleManualEntry}
                isScanning={false}
                showManualEntry={false}
              />
            </div>
          </div>

          {/* Tabs and Items Lists - Scrollable */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'scanned' | 'not-scanned')} className="flex-1 flex flex-col min-h-0">
              <div className="flex-shrink-0 px-6 pt-4 border-b border-outline-variant bg-surface z-10">
                <TabsList className="grid w-full grid-cols-2 gap-2 bg-transparent p-0">
                  <TabsTrigger
                    value="scanned"
                    className="relative rounded-lg px-4 py-3 text-on-surface-variant data-[state=active]:bg-primary-container data-[state=active]:text-on-primary-container data-[state=active]:after:absolute data-[state=active]:after:content-[''] data-[state=active]:after:bottom-1 data-[state=active]:after:left-4 data-[state=active]:after:right-4 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary"
                  >
                    Scanned ({scannedItems.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="not-scanned"
                    className="relative rounded-lg px-4 py-3 text-on-surface-variant data-[state=active]:bg-primary-container data-[state=active]:text-on-primary-container data-[state=active]:after:absolute data-[state=active]:after:content-[''] data-[state=active]:after:bottom-1 data-[state=active]:after:left-4 data-[state=active]:after:right-4 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary"
                  >
                    Not Scanned ({notScannedItems.length})
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="scanned" className="flex-1 overflow-y-auto px-6 py-4 mt-0 min-h-0">
                {scannedItems.length > 0 ? (
                  <div className="space-y-2">
                    {scannedItems.map((item) => (
                      <Card key={item.id} className="border-outline-variant bg-surface-container">
                        <CardContent className="p-3">
                          <ItemCard
                            item={{
                              id: item.id,
                              itemId: item.itemId || item.partnerItemId || '',
                              brand: item.brand,
                              category: item.category,
                              size: item.size,
                              color: item.color,
                              price: item.price,
                              status: item.status !== 'error' ? undefined : 'Invalid',
                              retailerItemId: item.retailerItemId,
                              partnerItemId: item.partnerItemId,
                              gender: item.gender,
                              subcategory: item.subcategory,
                              source: item.source
                            } as BaseItem}
                            variant="items-list"
                            showActions={false}
                            showSelection={false}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <PackageIcon className="w-12 h-12 text-on-surface-variant mx-auto mb-4" />
                    <p className="body-medium text-on-surface-variant">No scanned items yet</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="not-scanned" className="flex-1 overflow-y-auto px-6 py-4 mt-0 min-h-0">
                {notScannedItems.length > 0 ? (
                  <>
                    <div className="space-y-2">
                      {notScannedItems.map((item) => (
                        <Card key={item.id} className="border-outline-variant bg-surface-container">
                          <CardContent className="p-3">
                            <div className="flex items-start gap-3">
                              <div className="flex-1">
                                <ItemCard
                                  item={{
                                    id: item.id,
                                    itemId: item.itemId || item.partnerItemId || '',
                                    brand: item.brand,
                                    category: item.category,
                                    size: item.size,
                                    color: item.color,
                                    price: item.price,
                                    status: item.status !== 'error' ? undefined : 'Invalid',
                                    retailerItemId: item.retailerItemId,
                                    partnerItemId: item.partnerItemId,
                                    gender: item.gender,
                                    subcategory: item.subcategory,
                                    source: item.source
                                  } as BaseItem}
                                  variant="items-list"
                                  showActions={false}
                                  showSelection={false}
                                />
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => onMarkAsScanned(item)}>
                                    <CheckIcon className="mr-2 h-4 w-4" />
                                    Mark as scanned
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <PackageIcon className="w-12 h-12 text-on-surface-variant mx-auto mb-4" />
                    <p className="body-medium text-on-surface-variant">All items have been scanned</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-outline-variant px-6 py-4 flex-shrink-0">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={onSaveAndClose}
              className="h-[56px]"
              size="lg"
            >
              <span className="label-large">Save & Close</span>
            </Button>
            <Button
              onClick={onContinue}
              disabled={scannedItems.length === 0}
              className="h-[56px] bg-primary text-on-primary"
              size="lg"
            >
              <span className="label-large">Continue</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
