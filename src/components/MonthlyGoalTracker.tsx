import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription, SheetFooter } from './ui/sheet';
import { Progress } from './ui/progress';
import { Edit3, Target, TrendingUp } from 'lucide-react';
import { useMediaQuery } from './ui/use-mobile';

interface MonthlyGoalTrackerProps {
  currentSales: number;
  monthlyGoal: number;
}

export function GoalEditDialog({ 
  currentGoal, 
  onGoalUpdate 
}: { 
  currentGoal: number; 
  onGoalUpdate: (newGoal: number) => void; 
}) {
  const [newGoal, setNewGoal] = useState(currentGoal.toString());
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Reset goal value when dialog opens
  useEffect(() => {
    if (isOpen) {
      setNewGoal(currentGoal.toString());
      // Small delay to ensure sheet is fully rendered before focusing
      setTimeout(() => {
        inputRef.current?.focus();
        // Scroll input into view on mobile when keyboard opens
        if (isMobile && inputRef.current) {
          setTimeout(() => {
            inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 300);
        }
      }, 100);
    }
  }, [isOpen, currentGoal, isMobile]);

  const handleSave = () => {
    const goalValue = parseInt(newGoal);
    if (goalValue > 0 && !isNaN(goalValue)) {
      onGoalUpdate(goalValue);
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setNewGoal(currentGoal.toString());
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="h-8 w-8 p-0 text-on-surface-variant hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest"
        >
          <Edit3 className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side={isMobile ? "bottom" : "right"}
        className={isMobile 
          ? "max-h-[90vh] flex flex-col bg-surface-container border-t border-outline-variant" 
          : "w-full sm:max-w-md flex flex-col bg-surface-container border-l border-outline-variant"
        }
      >
        <SheetHeader className="flex-shrink-0 px-4 pt-4 pb-3 pr-12 md:px-6 md:pt-6 md:pb-4">
          <SheetTitle className="title-large text-on-surface">Edit monthly goal</SheetTitle>
          <SheetDescription className="body-medium text-on-surface-variant">
            Set your monthly sales goal to track your progress and performance.
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
          <div className="space-y-2">
            <label htmlFor="goal-input" className="label-medium text-on-surface-variant">
              Monthly sales goal (items)
            </label>
            <Input
              id="goal-input"
              ref={inputRef}
              type="number"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="Enter goal"
              className="bg-surface-container-high border border-outline text-on-surface min-h-[48px] text-base touch-manipulation"
              min="1"
              inputMode="numeric"
            />
          </div>
        </div>

        <SheetFooter className="flex-shrink-0 px-4 pt-3 pb-4 border-t border-outline-variant bg-surface-container md:px-6 md:pt-4 md:pb-6">
          <div className="flex gap-3 w-full">
            <Button 
              variant="ghost" 
              onClick={handleCancel}
              className="flex-1 h-12 md:h-10 min-h-[48px] md:min-h-0 text-on-surface hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest touch-manipulation"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className="flex-1 h-12 md:h-10 min-h-[48px] md:min-h-0 bg-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 text-on-primary touch-manipulation"
            >
              Save
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default function MonthlyGoalTracker({ 
  currentSales, 
  monthlyGoal 
}: MonthlyGoalTrackerProps) {
  const progressPercentage = Math.min((currentSales / monthlyGoal) * 100, 100);
  const isGoalAchieved = currentSales >= monthlyGoal;
  const remaining = Math.max(monthlyGoal - currentSales, 0);

  return (
    <Card className="bg-surface border-0 rounded-lg">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Progress section */}
            <div className="space-y-3">
              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="label-medium text-on-surface-variant">Progress</span>
                  <span className="label-medium text-on-surface">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
                <div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-4 pt-2">
                {/* Current sales */}
                <div className="text-center space-y-1">
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <div className="title-large text-primary">{currentSales}</div>
                  <div className="label-small text-on-surface-variant">Sold</div>
                </div>

                {/* Goal */}
                <div className="text-center space-y-1">
                  <div className="flex items-center justify-center gap-1">
                    <Target className="h-4 w-4 text-on-surface-variant" />
                  </div>
                  <div className="title-large text-on-surface">{monthlyGoal}</div>
                  <div className="label-small text-on-surface-variant">Goal</div>
                </div>

                {/* Remaining */}
                <div className="text-center space-y-1">
                  <div className="h-4 w-4 mx-auto"> </div>
                  <div className={`title-large ${isGoalAchieved ? 'text-primary' : 'text-on-surface'}`}>
                    {isGoalAchieved ? '+' : ''}{isGoalAchieved ? currentSales - monthlyGoal : remaining}
                  </div>
                  <div className="label-small text-on-surface-variant">
                    {isGoalAchieved ? 'Over goal' : 'Remaining'}
                  </div>
                </div>
              </div>

              {/* Status message */}
              {isGoalAchieved ? (
                <div className="bg-primary rounded-lg p-3 mt-3">
                  <p className="body-small text-on-primary text-center">
                    🎉 Congratulations! You've exceeded your monthly goal!
                  </p>
                </div>
              ) : null}
            </div>
          </div>
      </CardContent>
    </Card>
  );
}