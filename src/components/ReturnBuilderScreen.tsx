import React, { useState } from 'react';
import svgPaths from "../imports/svg-51ccwiv5v1";
import { Partner } from './PartnerSelectionScreen';
import { ItemCard, BaseItem } from './ItemCard';
import { ArrowLeft, Check, MoreVertical, RotateCcw } from 'lucide-react';

export interface ReturnItem {
  id: string;
  itemId: string;
  title: string;
  size?: string;
  color?: string;
  status: 'Expired B2B' | 'Rejected' | 'Return - In transit' | 'In store' | 'Broken' | 'In transit';
  partnerItemRef: string;
  partnerId?: string; // Partner ID to ensure items belong to the selected partner
  image?: string; // Full-size product image
  thumbnail?: string; // Thumbnail/fallback image
  selected: boolean;
  canExtend?: boolean;
  scanned?: boolean;
}

interface ReturnBuilderScreenProps {
  partner: Partner;
  items: ReturnItem[];
  onBack: () => void;
  onCreateReturn: (selectedItems: ReturnItem[]) => void;
  onUpdateItem: (itemId: string, action: 'select' | 'deselect' | 'missing' | 'extend' | 'scan') => void;
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <div className="absolute box-border content-stretch flex gap-[6px] h-[44px] items-center justify-start left-1/2 pl-[16px] pr-[4px] py-[8px] top-[26px] translate-x-[-50%] w-[375px]">
      <button 
        className="box-border content-stretch cursor-pointer flex flex-col gap-[10px] items-center justify-center overflow-visible p-0 relative shrink-0 size-[48px] hover:bg-surface-container-high transition-colors rounded-full"
        onClick={onBack}
      >
        <div className="content-stretch flex gap-[10px] items-center justify-center overflow-clip relative rounded-full shrink-0">
          <div className="box-border content-stretch flex gap-[10px] items-center justify-center p-[8px] relative shrink-0">
            <ArrowLeft className="w-6 h-6 text-on-surface" />
          </div>
        </div>
      </button>
      <div className="basis-0 title-large text-on-surface grow min-h-px min-w-px relative shrink-0">
        <p>Return details</p>
      </div>
    </div>
  );
}

function Tabs({ activeTab, onTabChange, scannedCount }: { activeTab: string; onTabChange: (tab: string) => void; scannedCount: number }) {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-[375px]">
      <div className="content-stretch flex items-start justify-start relative shrink-0 w-full">
        {/* Scanned Tab */}
        <div className="basis-0 content-stretch flex grow items-end justify-center min-h-px min-w-px overflow-clip relative shrink-0">
          <div className="basis-0 flex flex-row grow items-end self-stretch shrink-0">
            <div 
              className="basis-0 grow h-full min-h-px min-w-px relative shrink-0 cursor-pointer"
              onClick={() => onTabChange('scanned')}
            >
              <div className="flex flex-col items-center justify-end relative size-full">
                <div className="box-border content-stretch flex flex-col items-center justify-end px-[16px] py-0 relative size-full">
                  <div className="content-stretch flex flex-col h-[48px] items-center justify-end overflow-clip relative shrink-0">
                    <div className={`title-small text-center text-nowrap relative shrink-0 ${
                      activeTab === 'scanned' ? 'text-on-surface' : 'text-on-surface-variant'
                    }`}>
                      <p>Scanned</p>
                    </div>
                    {activeTab === 'scanned' && (
                      <div className="h-[14px] relative shrink-0 w-full">
                        <div className="absolute bg-primary bottom-0 h-[3px] left-[2px] right-[2px] rounded-tl-full rounded-tr-full" />
                      </div>
                    )}
                    {activeTab !== 'scanned' && <div className="h-[14px] w-full" />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* To return - not scanned Tab */}
        <div className="basis-0 content-stretch flex grow items-end justify-center min-h-px min-w-px overflow-clip relative shrink-0">
          <div className="basis-0 flex flex-row grow items-end self-stretch shrink-0">
            <div 
              className="basis-0 grow h-full min-h-px min-w-px relative shrink-0 cursor-pointer"
              onClick={() => onTabChange('not-scanned')}
            >
              <div className="flex flex-col items-center justify-end relative size-full">
                <div className="box-border content-stretch flex flex-col items-center justify-end px-[16px] py-0 relative size-full">
                  <div className="box-border content-stretch flex flex-col h-[48px] items-center justify-end overflow-clip pb-[14px] pt-0 px-0 relative shrink-0">
                    <div className={`title-small text-center text-nowrap relative shrink-0 ${
                      activeTab === 'not-scanned' ? 'text-on-surface' : 'text-on-surface-variant'
                    }`}>
                      <p>To return - not scanned</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="h-px relative shrink-0 w-full">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 375 1">
          <line stroke="var(--outline-variant)" x1="-4.37114e-08" x2="375" y1="0.500033" y2="0.5" />
        </svg>
      </div>
    </div>
  );
}

function ReturnItemComponent({ item, onUpdateItem }: { item: ReturnItem; onUpdateItem: (itemId: string, action: 'select' | 'deselect' | 'missing' | 'extend') => void }) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full">
      <div className="relative shrink-0 w-full">
        <div className="relative size-full">
          <div className="bg-surface-container border-b border-outline-variant">
            <div className="flex items-center gap-3 px-3 py-2">
              {/* Leading Element - Checkbox */}
              <button 
                className="flex-shrink-0 w-12 h-12 md:w-8 md:h-8 flex items-center justify-center touch-manipulation min-w-[48px] min-h-[48px] md:min-w-0 md:min-h-0"
                onClick={() => onUpdateItem(item.id, item.selected ? 'deselect' : 'select')}
                aria-label={item.selected ? 'Deselect item' : 'Select item'}
              >
                <div className="relative w-5 h-5">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 44">
                    <path 
                      clipRule="evenodd" 
                      d={item.selected ? svgPaths.p181a1800 : svgPaths.p3e435600} 
                      fill={item.selected ? "var(--primary)" : "var(--outline-variant)"} 
                      fillRule="evenodd" 
                    />
                  </svg>
                  {item.selected && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </button>
              
              {/* Main content using standardized ItemCard */}
              <div className="flex-1">
                <ItemCard
                  item={{
                    id: item.id,
                    itemId: item.itemId,
                    title: item.title,
                    brand: item.status === 'Expired B2B' ? 'H&M' : 'Weekday',
                    category: item.status === 'Expired B2B' ? 'Hoodie' : 'Dresses',
                    size: item.size,
                    color: item.color,
                    price: item.status === 'Expired B2B' ? 15 : 20,
                    status: item.status,
                    date: new Date().toISOString().split('T')[0],
                    thumbnail: item.thumbnail,
                    selected: item.selected,
                    canExtend: item.canExtend,
                    partnerItemRef: item.partnerItemRef
                  } as BaseItem}
                  variant="items-list"
                  showActions={false}
                  showSelection={false}
                />
              </div>
              
              {/* Trailing Elements */}
              <div className="flex-shrink-0 flex items-center gap-1">
                {/* More Actions */}
                <button 
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors"
                  onClick={() => setShowActions(!showActions)}
                  aria-label="More actions"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="5" r="2" fill="var(--on-surface)" />
                    <circle cx="12" cy="12" r="2" fill="var(--on-surface)" />
                    <circle cx="12" cy="19" r="2" fill="var(--on-surface)" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Action buttons - Keep existing functionality */}
            {showActions && (
              <div className="flex gap-2 px-3 pb-3">
                {item.canExtend && (
                  <button
                    className="px-3 py-1 bg-tertiary-container text-on-tertiary-container text-xs font-medium rounded-full uppercase tracking-wide"
                    onClick={() => onUpdateItem(item.id, 'extend')}
                  >
                    2nd Try
                  </button>
                )}
                <button
                  className="px-3 py-1 bg-surface-container-high text-on-surface text-xs font-medium rounded-full uppercase tracking-wide"
                  onClick={() => onUpdateItem(item.id, 'missing')}
                >
                  Missing
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="h-px relative shrink-0 w-full">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 375 1">
          <line stroke="#79747E" strokeOpacity="0.12" x1="-4.37114e-08" x2="375" y1="0.500033" y2="0.5" />
        </svg>
      </div>
    </div>
  );
}

export default function ReturnBuilderScreen({ partner, items, onBack, onCreateReturn, onUpdateItem }: ReturnBuilderScreenProps) {
  const [activeTab, setActiveTab] = useState<'scanned' | 'not-scanned'>('scanned');
  const [isScanning, setIsScanning] = useState(false);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [manualItemId, setManualItemId] = useState('');

  // Filter items to only show items from the selected partner
  const partnerItems = items.filter(item => !item.partnerId || item.partnerId === partner.id);
  
  const scannedItems = partnerItems.filter(item => item.scanned);
  // Allow scanning items with any status, not just expired or rejected
  const notScannedItems = partnerItems.filter(item => !item.scanned);
  
  const filteredItems = activeTab === 'scanned' ? scannedItems : notScannedItems;
  const selectedItems = partnerItems.filter(item => item.selected);
  const canCreateReturn = selectedItems.length > 0;

  const handleScan = () => {
    if (notScannedItems.length === 0) {
      alert('No items available to scan');
      return;
    }
    
    setIsScanning(true);
    
    // Simulate scanning a random item
    setTimeout(() => {
      const randomItem = notScannedItems[Math.floor(Math.random() * notScannedItems.length)];
      onUpdateItem(randomItem.id, 'scan');
      setIsScanning(false);
      setActiveTab('scanned');
      alert(`Scanned: ${randomItem.title} (${randomItem.itemId})`);
    }, 2000);
  };

  const handleManualAdd = () => {
    if (manualItemId.trim()) {
      // Find item by ID and mark as scanned
      const item = notScannedItems.find(item => 
        item.itemId.toLowerCase().includes(manualItemId.toLowerCase()) ||
        item.partnerItemRef.toLowerCase().includes(manualItemId.toLowerCase())
      );
      
      if (item) {
        onUpdateItem(item.id, 'scan');
        setManualItemId('');
        setShowManualAdd(false);
        setActiveTab('scanned');
        alert(`Added: ${item.title} (${item.itemId})`);
      } else {
        alert('Item not found. Please check the ID and try again.');
      }
    }
  };

  const handleCreateReturn = () => {
    if (canCreateReturn) {
      onCreateReturn(selectedItems);
    }
  };

  return (
    <div className="bg-surface relative size-full">
      <Header onBack={onBack} />
      
      {/* Return Order Details */}
      <div className="absolute content-stretch flex flex-col gap-[20px] items-start justify-center left-0 top-[70px] w-[376px]">
        <div className="bg-white content-stretch flex flex-col items-center justify-start relative shrink-0 w-full">
          <div className="relative shrink-0 w-full">
            <div className="relative size-full">
              <div className="flex items-center gap-4 p-4 bg-surface-container border-b border-outline-variant">
                {/* Leading Icon - Return/Package Icon */}
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
                    <path d="M9 11H7l3-3 3 3h-2v4h-2v-4z" fill="var(--on-surface)" />
                    <path d="M4 3h16c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2zm0 2v14h16V5H4z" fill="var(--on-surface)" />
                  </svg>
                </div>
                
                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  {/* Supporting Text - Creation Date and Status */}
                  <div className="text-[10px] font-medium text-on-surface-variant tracking-[0.5px] leading-none">
                    <span>{new Date().toISOString().split('T')[0]}, In transit</span>
                  </div>
                  
                  {/* Primary Text - Order Number */}
                  <div className="title-medium text-on-surface leading-tight">
                    Return order nr: {Math.floor(1000000 + Math.random() * 9000000)}
                  </div>
                  
                  {/* Secondary Text - Details */}
                  <div className="body-small text-on-surface leading-tight">
                    <div>Receiver: {partner.name}</div>

                  </div>
                </div>
                
                {/* Trailing Icon - More Options */}
                <div className="flex-shrink-0">
                  <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="5" r="2" fill="var(--on-surface)" />
                      <circle cx="12" cy="12" r="2" fill="var(--on-surface)" />
                      <circle cx="12" cy="19" r="2" fill="var(--on-surface)" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Select All and Action Buttons */}
      <div className="absolute left-[11px] size-[44px] top-[161px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 44">
          <path clipRule="evenodd" d={svgPaths.p3e435600} fill="#FFCCD4" fillRule="evenodd" />
        </svg>
      </div>

      {/* Action Buttons */}
      <div className="absolute h-[32px] left-[15.73%] right-[75.73%] top-[167px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <path clipRule="evenodd" d={svgPaths.p22167000} fill="#FFF0F5" fillRule="evenodd" />
          <path d={svgPaths.p1b4037f0} fill="#F20054" />
        </svg>
      </div>

      {/* Scan Button */}
      <button 
        className={`absolute bg-primary h-[32px] rounded-lg translate-x-[-50%] translate-y-[-50%] cursor-pointer ${
          isScanning ? 'opacity-50' : 'hover:bg-primary/90 transition-colors'
        }`}
        style={{ top: "181px", left: "320px" }}
        onClick={handleScan}
        disabled={isScanning}
      >
        <div className="flex flex-row items-center justify-center relative size-full">
          <div className="flex items-center justify-center h-10 px-6 relative">
            <div className="label-medium text-on-primary text-center text-nowrap relative shrink-0 uppercase">
              <p>{isScanning ? 'Scanning...' : 'Scan'}</p>
            </div>
          </div>
        </div>
      </button>

      {/* Add Manually Button */}
      <button 
        className="absolute label-medium text-primary text-center h-[20px] justify-center left-[194px] top-[181px] translate-x-[-50%] translate-y-[-50%] uppercase w-[108px] cursor-pointer hover:bg-primary-container/50 transition-colors rounded px-2"
        onClick={() => setShowManualAdd(!showManualAdd)}
      >
        <p className="text-[11px] whitespace-nowrap">Add manually</p>
      </button>

      {/* Manual Add Form */}
      {showManualAdd && (
        <div className="absolute bg-surface-container-high border border-outline-variant rounded-lg p-[16px] shadow-lg top-[200px] left-[50%] transform -translate-x-1/2 w-[300px] z-10">
          <div className="flex flex-col gap-[12px]">
            <div className="label-large text-on-surface relative shrink-0 w-full flex flex-col justify-center">
              <label>Item ID or Partner Reference</label>
            </div>
            <div className="h-[40px] overflow-clip relative w-full">
              <div className="absolute bg-surface-container border border-outline inset-0 rounded-sm" />
              <input
                type="text"
                id="return-builder-item-id"
                name="return-builder-item-id"
                placeholder="Enter item ID"
                value={manualItemId}
                onChange={(e) => setManualItemId(e.target.value)}
                className="absolute inset-[8px] bg-transparent border-none outline-none body-large text-on-surface w-full"
              />
            </div>
            <div className="flex gap-[8px] justify-end">
              <button
                className="px-[16px] py-[6px] border border-outline rounded-sm label-medium text-on-surface hover:bg-surface-container-highest transition-colors"
                onClick={() => setShowManualAdd(false)}
              >
                Cancel
              </button>
              <button
                className="px-[16px] py-[6px] bg-primary rounded-sm label-medium text-on-primary hover:bg-primary/90 transition-colors"
                onClick={handleManualAdd}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="absolute content-stretch flex flex-col h-[589px] items-center justify-start left-0 top-[203px]">
        
        {/* Tabs */}
        <Tabs activeTab={activeTab} onTabChange={setActiveTab} scannedCount={scannedItems.length} />

        {/* Item Count */}
        <div className="bg-surface content-stretch flex flex-col h-[42px] items-center justify-center relative shrink-0 w-[375px]">
          <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-full">
            <div className="flex flex-row items-center justify-center relative size-full">
              <div className="box-border content-stretch flex gap-[16px] items-center justify-center pl-[16px] pr-[24px] py-[8px] relative size-full">
                <div className="basis-0 content-stretch flex flex-col grow h-full items-end justify-end min-h-px min-w-px overflow-clip relative shrink-0">
                  <div className="body-large text-on-surface-variant relative shrink-0 w-full flex flex-col justify-center">
                    <p>{filteredItems.length} items</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {filteredItems.length === 0 ? (
          <div className="body-medium text-on-surface-variant text-center h-[281px] justify-center relative shrink-0 w-[335px] flex flex-col">
            <p>
              {activeTab === 'scanned' 
                ? 'No items scanned yet. Use the SCAN button or ADD MANUALLY to include items in return.'
                : 'Scan QR on hang tags to include items in return'
              }
            </p>
          </div>
        ) : (
          <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full max-h-[400px] overflow-y-auto">
            {filteredItems.map((item) => (
              <ReturnItemComponent 
                key={item.id} 
                item={item} 
                onUpdateItem={onUpdateItem} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTAs */}
      <div className="absolute bg-surface bottom-0 box-border content-stretch flex gap-[16px] items-center justify-center left-0 px-0 py-[20px] w-[375px]">
        <div className="absolute border-outline-variant border-[1px_0px_0px] border-solid inset-0 pointer-events-none" />
        
        <button className="bg-surface cursor-pointer h-[48px] md:h-[42px] relative rounded-lg shrink-0 w-[160px] border border-outline hover:bg-surface-container-high transition-colors min-h-[48px] md:min-h-0">
          <div className="flex flex-row items-center justify-center relative size-full">
            <div className="box-border content-stretch flex gap-[15px] h-[42px] items-center justify-center p-[30px] relative w-[160px]">
              <div className="label-large text-on-surface text-center text-nowrap relative shrink-0 uppercase">
                <p>Save & close</p>
              </div>
            </div>
          </div>
        </button>
        
        <button
          className={`bg-primary cursor-pointer h-[48px] md:h-[42px] relative rounded-lg shrink-0 w-[160px] min-h-[48px] md:min-h-0 ${
            !canCreateReturn ? 'opacity-50' : 'hover:bg-primary/90 transition-colors'
          }`}
          onClick={canCreateReturn ? handleCreateReturn : undefined}
          disabled={!canCreateReturn}
        >
          <div className="flex flex-row items-center justify-center relative size-full">
            <div className="box-border content-stretch flex gap-[15px] h-[42px] items-center justify-center p-[30px] relative w-[160px]">
              <div className="label-large text-on-primary text-center text-nowrap relative shrink-0 uppercase">
                <p>Return</p>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}