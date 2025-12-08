import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Progress } from './ui/progress';
import { Edit3, Target, TrendingUp } from 'lucide-react';

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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="h-8 w-8 p-0 text-on-surface-variant hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest"
        >
          <Edit3 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-surface-container border border-outline-variant">
        <DialogHeader>
          <DialogTitle className="title-large text-on-surface">Edit monthly goal</DialogTitle>
          <DialogDescription className="body-medium text-on-surface-variant">
            Set your monthly sales goal to track your progress and performance.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="label-medium text-on-surface-variant">
              Monthly sales goal (items)
            </label>
            <Input
              type="number"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="Enter goal"
              className="bg-surface-container-high border border-outline text-on-surface"
              min="1"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button 
              variant="ghost" 
              onClick={handleCancel}
              className="text-on-surface hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 text-on-primary"
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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