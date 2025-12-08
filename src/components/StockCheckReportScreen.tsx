import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, Calendar, Download, FileText } from 'lucide-react';
import { StockCheckSession } from './StockCheckScreen';

interface StockCheckReportScreenProps {
  session: StockCheckSession;
  onBack: () => void;
  onReviewItems: () => void;
  onDone: () => void;
  onDateChange?: (date: string) => void;
  availableSessions?: StockCheckSession[];
}

function TopAppBar({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <div className="sticky top-0 md:top-16 bg-surface z-[90] border-b border-outline-variant md:shadow-sm">
      <div className="flex items-center h-16 px-4 md:px-6">
        {/* Leading icon - Back button */}
        <button 
          className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors mr-2"
          onClick={onBack}
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-on-surface" />
        </button>
        
        {/* Title */}
        <h1 className="title-large text-on-surface flex-1">
          {title}
        </h1>
      </div>
    </div>
  );
}

function ReportDateSelector({ 
  selectedDate, 
  onDateChange,
  availableDates 
}: { 
  selectedDate: string; 
  onDateChange: (date: string) => void; 
  availableDates: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 mb-6">
      <div className="space-y-2">
        <label className="label-medium text-on-surface-variant">
          Stock check date
        </label>
        <Select value={selectedDate} onValueChange={onDateChange}>
          <SelectTrigger 
            className="w-full bg-surface-container border border-outline-variant rounded-lg min-h-[48px] body-large px-4"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-on-surface-variant" />
              <SelectValue placeholder="Select date" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-surface-container-high border border-outline">
            {availableDates.map((date) => (
              <SelectItem key={date.value} value={date.value} className="body-large">
                {date.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {availableDates.length > 1 && (
          <p className="body-small text-on-surface-variant">
            {availableDates.length} stock check{availableDates.length > 1 ? 's' : ''} available. Select a date to view the report.
          </p>
        )}
      </div>
    </div>
  );
}

function ReportSummaryCard({ session, onExport }: { session: StockCheckSession; onExport: () => void }) {
  const notScannedCount = session.totalItems - session.scannedItems;
  const completionPercentage = session.totalItems > 0 
    ? Math.round((session.scannedItems / session.totalItems) * 100) 
    : 0;
  
  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 mb-6">
      <Card className="bg-surface-container border border-outline-variant">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-on-surface-variant" />
              <h3 className="title-medium text-on-surface">
                Report summary
              </h3>
              <span className="body-small text-on-surface-variant">
                (number of items)
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="body-medium text-on-surface">Total:</span>
                  <span className="body-medium text-on-surface">{session.totalItems}</span>
                </div>
                <div className="flex justify-between">
                  <span className="body-medium text-on-surface">Scanned:</span>
                  <span className="body-medium text-on-surface">{session.scannedItems}</span>
                </div>
                <div className="flex justify-between">
                  <span className="body-medium text-on-surface">Not scanned:</span>
                  <span className="body-medium text-on-surface">{notScannedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="body-medium text-on-surface">Scanned not found:</span>
                  <span className="body-medium text-on-surface">{session.notFoundItems}</span>
                </div>
              </div>
              
              {/* Visual progress indicator */}
              <div className="flex flex-col justify-center">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="label-small text-on-surface-variant">Completion</span>
                    <span className="label-small text-on-surface-variant">
                      {completionPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-surface-variant rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Export Report Button - moved close to report summary */}
            <div className="pt-4 border-t border-outline-variant">
              <Button 
                onClick={onExport}
                variant="outline"
                className="w-full md:w-auto md:min-w-[220px] border-primary text-primary hover:bg-primary-container/50 focus:bg-primary-container/50 active:bg-primary-container/70 transition-colors px-6 py-3 rounded-lg h-[56px] flex items-center justify-center label-large"
              >
                <Download className="w-5 h-5 mr-2" />
                <span>Export Report</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InstructionsCard() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 mb-6">
      <Card className="bg-surface-container-low border border-outline-variant">
        <CardContent className="p-4">
          <p className="body-medium text-on-surface-variant leading-relaxed">
            To handle mismatch between actual stock in store and stock check report completed in the app, 
            please click 'Review items'.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ActionButtons({ 
  onReviewItems, 
  onExport 
}: { 
  onReviewItems: () => void; 
  onExport: () => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant p-4 md:py-6 z-20">
      <div className="w-full max-w-6xl mx-auto flex flex-row flex-wrap gap-3 md:gap-4 md:justify-end">
        <Button 
          onClick={onReviewItems}
          className="w-full md:w-auto md:min-w-[220px] bg-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 text-on-primary transition-colors px-6 py-3 rounded-lg h-[56px] flex items-center justify-center label-large"
        >
          Review Items
        </Button>
      </div>
    </div>
  );
}

export default function StockCheckReportScreen({ 
  session, 
  onBack, 
  onReviewItems, 
  onDone,
  onDateChange,
  availableSessions 
}: StockCheckReportScreenProps) {
  const [selectedDate, setSelectedDate] = useState(session.date);
  
  // Update selected date when session changes
  useEffect(() => {
    setSelectedDate(session.date);
  }, [session.date]);
  
  // Generate available dates from sessions or use default
  const availableDates = availableSessions && availableSessions.length > 0
    ? availableSessions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort by date descending (newest first)
        .map(s => {
          const date = new Date(s.date);
          const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          const isToday = s.date === new Date().toISOString().split('T')[0];
          return {
            value: s.date,
            label: isToday ? `${formattedDate} (today)` : formattedDate
          };
        })
    : [
        {
          value: session.date,
          label: (() => {
            const date = new Date(session.date);
            const formattedDate = date.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
            const isToday = session.date === new Date().toISOString().split('T')[0];
            return isToday ? `${formattedDate} (today)` : formattedDate;
          })()
        }
      ];

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    if (onDateChange) {
      onDateChange(newDate);
    }
  };

  const handleExport = () => {
    // Export all item details to spreadsheet
    if (!session.items || session.items.length === 0) {
      const event = new CustomEvent('toast', {
        detail: { message: 'No items to export', type: 'error' }
      });
      window.dispatchEvent(event);
      return;
    }

    // Prepare CSV data with all item details
    const headers = [
      'Item ID',
      'Title',
      'Brand',
      'Size',
      'Color',
      'Price',
      'Status',
      'Order Number',
      'Date',
      'Category'
    ];

    const rows = session.items.map(item => [
      item.itemId || '',
      item.title || '',
      item.brand || '',
      item.size || '',
      item.color || '',
      item.price?.toString() || '',
      item.status || '',
      item.orderNumber || '',
      item.date || session.date,
      item.category || ''
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `stock-check-report-${session.date}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    const event = new CustomEvent('toast', {
      detail: { message: 'Report exported successfully', type: 'success' }
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="bg-surface min-h-screen flex flex-col">
      {/* Spacer for top nav on desktop */}
      <div className="hidden md:block h-16"></div>
      {/* Top App Bar */}
      <TopAppBar onBack={onBack} title="Stock check report" />
      
      {/* Content */}
      <div className="flex-1 pb-40">
        {/* Report Date Selector */}
        <div className="pt-6">
          <ReportDateSelector 
            selectedDate={selectedDate} 
            onDateChange={handleDateChange}
            availableDates={availableDates}
          />
        </div>
        
        {/* Report Summary */}
        <ReportSummaryCard session={session} onExport={handleExport} />
        
        {/* Instructions */}
        <InstructionsCard />
      </div>
      
      {/* Action Buttons */}
      <ActionButtons 
        onReviewItems={onReviewItems}
        onExport={handleExport}
      />
    </div>
  );
}
