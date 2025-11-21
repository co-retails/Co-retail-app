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
    <div className="sticky top-0 bg-surface z-10 border-b border-outline-variant">
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
    <Card className="mx-4 md:mx-6 mb-6 bg-surface-container border border-outline-variant">
      <CardContent className="p-4">
        <div className="space-y-3">
          <label className="label-medium text-on-surface-variant">
            Stock check date
          </label>
          <Select value={selectedDate} onValueChange={onDateChange}>
            <SelectTrigger className="w-full bg-surface-container-high border border-outline rounded-[12px] h-[56px] px-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-on-surface-variant" />
                <SelectValue placeholder="Select date" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {availableDates.map((date) => (
                <SelectItem key={date.value} value={date.value}>
                  <span className="body-medium text-on-surface">{date.label}</span>
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
      </CardContent>
    </Card>
  );
}

function ReportSummaryCard({ session }: { session: StockCheckSession }) {
  const notScannedCount = session.totalItems - session.scannedItems;
  const completionPercentage = session.totalItems > 0 
    ? Math.round((session.scannedItems / session.totalItems) * 100) 
    : 0;
  
  return (
    <Card className="mx-4 md:mx-6 mb-6 bg-surface-container border border-outline-variant">
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
        </div>
      </CardContent>
    </Card>
  );
}

function InstructionsCard() {
  return (
    <Card className="mx-4 mb-6 bg-surface-container-low border border-outline-variant">
      <CardContent className="p-4">
        <p className="body-medium text-on-surface-variant leading-relaxed">
          To handle mismatch between actual stock in store and stock check report completed in the app, 
          please click 'Review items'.
        </p>
      </CardContent>
    </Card>
  );
}

function ActionButtons({ 
  onReviewItems, 
  onDone, 
  onExport 
}: { 
  onReviewItems: () => void; 
  onDone: () => void;
  onExport: () => void;
}) {
  return (
    <div className="sticky bottom-0 bg-surface border-t border-outline-variant p-4">
      <div className="flex gap-4 mb-3">
        <Button 
          variant="outline"
          onClick={onReviewItems}
          className="flex-1 border-primary text-primary hover:bg-primary-container/50 focus:bg-primary-container/50 active:bg-primary-container/70 transition-colors px-6 py-3 rounded-lg min-h-[48px] flex items-center justify-center label-large"
        >
          Review Items
        </Button>
        <Button 
          onClick={onDone}
          className="flex-1 bg-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 text-on-primary transition-colors px-6 py-3 rounded-lg min-h-[48px] flex items-center justify-center label-large"
        >
          Done
        </Button>
      </div>
      
      {/* Secondary action */}
      <Button 
        variant="ghost"
        onClick={onExport}
        className="w-full text-on-surface-variant hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors px-6 py-2 rounded-lg min-h-[48px] flex items-center justify-center"
      >
        <Download className="w-4 h-4 mr-2" />
        <span className="label-medium">Export Report</span>
      </Button>
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
    // Simulate export functionality
    const event = new CustomEvent('toast', {
      detail: { message: 'Report exported successfully', type: 'success' }
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="bg-surface min-h-screen flex flex-col">
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
        <ReportSummaryCard session={session} />
        
        {/* Instructions */}
        <InstructionsCard />
      </div>
      
      {/* Action Buttons */}
      <ActionButtons 
        onReviewItems={onReviewItems}
        onDone={onDone}
        onExport={handleExport}
      />
    </div>
  );
}
