import { useState } from 'react';
import { Card, CardContent } from './ui/card';

interface CategoryData {
  name: string;
  value: number;
  percentage: number;
}

interface PeriodData {
  categories: CategoryData[];
  totalSoldItems: number;
}

interface SalesData {
  yesterday: PeriodData;
  sevenDays: PeriodData;
  thirtyDays: PeriodData;
}

const mockSalesData: SalesData = {
  yesterday: {
    categories: [
      { name: 'Jeans', value: 55, percentage: 100 },
      { name: 'Hoodies & Sweatshirts', value: 49, percentage: 89 },
      { name: 'Tops', value: 45, percentage: 82 },
      { name: 'Jackets & Coats', value: 45, percentage: 82 },
      { name: 'Pants', value: 35, percentage: 64 }
    ],
    totalSoldItems: 425
  },
  sevenDays: {
    categories: [
      { name: 'Jeans', value: 312, percentage: 100 },
      { name: 'Tops', value: 287, percentage: 92 },
      { name: 'Hoodies & Sweatshirts', value: 268, percentage: 86 },
      { name: 'Shoes', value: 245, percentage: 78 },
      { name: 'Jackets & Coats', value: 223, percentage: 71 }
    ],
    totalSoldItems: 2780
  },
  thirtyDays: {
    categories: [
      { name: 'Jeans', value: 1456, percentage: 100 },
      { name: 'Tops', value: 1298, percentage: 89 },
      { name: 'Shoes', value: 1187, percentage: 81 },
      { name: 'Hoodies & Sweatshirts', value: 1089, percentage: 75 },
      { name: 'Jackets & Coats', value: 987, percentage: 68 }
    ],
    totalSoldItems: 11250
  }
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
              Top 5 categories - sold resell items
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
          
          {/* Total Sold Items - Below tabs */}
          <div className="px-4 pt-3 pb-2">
            <div className="flex items-baseline gap-2">
              <span className="title-small text-on-surface">
                {currentData.totalSoldItems.toLocaleString()}
              </span>
              <span className="body-small text-on-surface-variant">
                total sold items
              </span>
            </div>
          </div>
          
          {/* Chart */}
          <div className="p-4 space-y-3">
            {currentData.categories.map((category, index) => (
              <CategoryBar key={index} category={category} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}