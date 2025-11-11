import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';

interface CategoryData {
  name: string;
  value: number;
  percentage: number;
}

interface SalesData {
  yesterday: CategoryData[];
  sevenDays: CategoryData[];
  thirtyDays: CategoryData[];
}

const mockSalesData: SalesData = {
  yesterday: [
    { name: 'Jeans', value: 55, percentage: 100 },
    { name: 'Hoodies & Sweatshirts', value: 49, percentage: 89 },
    { name: 'Tops', value: 45, percentage: 82 },
    { name: 'Jackets & Coats', value: 45, percentage: 82 },
    { name: 'Pants', value: 35, percentage: 64 },
    { name: 'Dresses', value: 32, percentage: 58 },
    { name: 'Shoes', value: 28, percentage: 51 },
    { name: 'Accessories', value: 25, percentage: 45 },
    { name: 'Skirts', value: 22, percentage: 40 },
    { name: 'Bags', value: 18, percentage: 33 }
  ],
  sevenDays: [
    { name: 'Jeans', value: 312, percentage: 100 },
    { name: 'Tops', value: 287, percentage: 92 },
    { name: 'Hoodies & Sweatshirts', value: 268, percentage: 86 },
    { name: 'Shoes', value: 245, percentage: 78 },
    { name: 'Jackets & Coats', value: 223, percentage: 71 },
    { name: 'Pants', value: 198, percentage: 63 },
    { name: 'Dresses', value: 176, percentage: 56 },
    { name: 'Accessories', value: 154, percentage: 49 },
    { name: 'Bags', value: 132, percentage: 42 },
    { name: 'Skirts', value: 108, percentage: 35 }
  ],
  thirtyDays: [
    { name: 'Jeans', value: 1456, percentage: 100 },
    { name: 'Tops', value: 1298, percentage: 89 },
    { name: 'Shoes', value: 1187, percentage: 81 },
    { name: 'Hoodies & Sweatshirts', value: 1089, percentage: 75 },
    { name: 'Jackets & Coats', value: 987, percentage: 68 },
    { name: 'Pants', value: 876, percentage: 60 },
    { name: 'Dresses', value: 743, percentage: 51 },
    { name: 'Accessories', value: 654, percentage: 45 },
    { name: 'Bags', value: 532, percentage: 37 },
    { name: 'Skirts', value: 421, percentage: 29 }
  ]
};

type TimePeriod = 'yesterday' | 'sevenDays' | 'thirtyDays';

function CategoryBar({ category }: { category: CategoryData }) {
  return (
    <div className="flex items-center gap-2 h-7">
      <div className="w-20 shrink-0">
        <span className="label-small text-on-surface">{category.name}</span>
      </div>
      <div className="flex-1 bg-surface-variant rounded-sm h-3 relative">
        <div 
          className="bg-primary h-full rounded-sm transition-all duration-300"
          style={{ width: `${category.percentage}%` }}
        />
      </div>
      <div className="w-8 text-right">
        <span className="body-small text-on-surface">{category.value}</span>
      </div>
    </div>
  );
}

function TabButton({ 
  label, 
  isActive, 
  onClick 
}: { 
  label: string; 
  isActive: boolean; 
  onClick: () => void; 
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 relative py-3 px-4 transition-colors ${
        isActive 
          ? 'text-primary' 
          : 'text-on-surface-variant hover:text-on-surface focus:text-on-surface'
      }`}
    >
      <span className="label-medium">{label}</span>
      {isActive && (
        <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
      )}
    </button>
  );
}

export default function SalesDataDashboard() {
  const [activeTab, setActiveTab] = useState<TimePeriod>('yesterday');

  const currentData = mockSalesData[activeTab];

  const getTabLabel = (period: TimePeriod) => {
    switch (period) {
      case 'yesterday': return 'Yesterday';
      case 'sevenDays': return '7 days';
      case 'thirtyDays': return '30 days';
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="title-medium text-on-surface">Sales data</h2>
      
      <Card className="bg-surface-container border border-outline-variant rounded-lg">
        <CardContent className="p-0">
          {/* Header */}
          <div className="p-4 pb-2">
            <h4 className="body-medium text-on-surface">
              Top 10 categories - sold resell items
            </h4>
          </div>
          
          {/* Tabs */}
          <div className="px-4">
            <div className="flex border-b border-outline-variant">
              {(['yesterday', 'sevenDays', 'thirtyDays'] as TimePeriod[]).map((period) => (
                <TabButton
                  key={period}
                  label={getTabLabel(period)}
                  isActive={activeTab === period}
                  onClick={() => setActiveTab(period)}
                />
              ))}
            </div>
          </div>
          
          {/* Chart */}
          <div className="p-4 space-y-3">
            {currentData.map((category, index) => (
              <CategoryBar key={index} category={category} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}