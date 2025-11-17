import React, { useState } from 'react';
import { ArrowLeft, Plus, Search, Shield, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface ValidationRulesScreenProps {
  onBack: () => void;
}

interface ValidationRule {
  id: string;
  name: string;
  description: string;
  ruleType: 'format' | 'range' | 'dependency' | 'custom';
  severity: 'error' | 'warning';
  enabled: boolean;
  affectedAttributes: string[];
  lastModified: string;
}

const mockRules: ValidationRule[] = [
  {
    id: '1',
    name: 'Price Range Validation',
    description: 'Ensures price values match defined price ladder points',
    ruleType: 'range',
    severity: 'error',
    enabled: true,
    affectedAttributes: ['Price'],
    lastModified: '2024-12-01'
  },
  {
    id: '2',
    name: 'Brand-Category Compatibility',
    description: 'Validates that category selections are valid for the selected brand',
    ruleType: 'dependency',
    severity: 'error',
    enabled: true,
    affectedAttributes: ['Brand', 'Category'],
    lastModified: '2024-11-28'
  },
  {
    id: '3',
    name: 'Description Length Check',
    description: 'Warns if product description exceeds recommended character limit',
    ruleType: 'format',
    severity: 'warning',
    enabled: true,
    affectedAttributes: ['Description'],
    lastModified: '2024-11-25'
  },
  {
    id: '4',
    name: 'Size-Gender Validation',
    description: 'Ensures size values are appropriate for the selected gender',
    ruleType: 'dependency',
    severity: 'error',
    enabled: false,
    affectedAttributes: ['Size', 'Gender'],
    lastModified: '2024-11-20'
  },
  {
    id: '5',
    name: 'SKU Format Check',
    description: 'Validates SKU follows the correct format pattern',
    ruleType: 'format',
    severity: 'error',
    enabled: true,
    affectedAttributes: ['SKU'],
    lastModified: '2024-11-15'
  },
];

export function ValidationRulesScreen({ onBack }: ValidationRulesScreenProps) {
  const [rules, setRules] = useState<ValidationRule[]>(mockRules);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRules = rules.filter(rule =>
    rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rule.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleRule = (id: string) => {
    setRules(rules.map(rule =>
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const getSeverityBadge = (severity: ValidationRule['severity']) => {
    if (severity === 'error') {
      return (
        <Badge variant="outline" className="border-error bg-error-container">
          <span className="label-small text-on-error-container">Error</span>
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-outline bg-surface-container-highest">
        <span className="label-small text-on-surface-variant">Warning</span>
      </Badge>
    );
  };

  const getRuleTypeBadge = (type: ValidationRule['ruleType']) => {
    return (
      <Badge variant="outline" className="border-outline bg-secondary-container">
        <span className="label-small text-on-secondary-container capitalize">{type}</span>
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-surface pb-20 md:pb-0">
      {/* Top App Bar */}
      <div className="sticky top-0 bg-surface z-10 border-b border-outline-variant">
        <div className="flex items-center h-16 px-4 md:px-6 gap-2">
          <button
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors"
            onClick={onBack}
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-on-surface" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="title-large text-on-surface">Validation rules</div>
            <div className="body-medium text-on-surface-variant">
              Configure validation checks for data quality
            </div>
          </div>
          <Button className="gap-2">
            <Plus className="w-5 h-5" />
            <span>Add rule</span>
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="border-b border-outline-variant bg-surface-container-low">
        <div className="max-w-6xl px-4 md:px-6 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <input
              type="text"
              id="validation-rules-search"
              name="validation-rules-search"
              placeholder="Search validation rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-11 pr-4 rounded-lg border border-outline bg-surface-container text-on-surface body-large placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl px-4 md:px-6 py-6">
        <div className="mb-6 p-4 rounded-lg bg-primary-container border border-outline-variant">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-on-primary-container flex-shrink-0 mt-0.5" />
            <div>
              <div className="title-small text-on-primary-container mb-1">
                Validation overview
              </div>
              <div className="body-medium text-on-primary-container">
                {rules.filter(r => r.enabled).length} of {rules.length} rules are currently active. 
                Validation rules help maintain data quality and consistency across the system.
              </div>
            </div>
          </div>
        </div>

        {filteredRules.length === 0 ? (
          <Card className="p-12 border-outline bg-surface-container text-center">
            <div className="title-large text-on-surface mb-2">No rules found</div>
            <div className="body-medium text-on-surface-variant mb-6">
              {searchQuery 
                ? 'Try adjusting your search criteria'
                : 'Create validation rules to ensure data quality'}
            </div>
            <Button>
              <Plus className="w-5 h-5 mr-2" />
              <span>Add first rule</span>
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredRules.map((rule) => (
              <Card 
                key={rule.id} 
                className={`p-6 border-outline-variant transition-all ${
                  rule.enabled 
                    ? 'bg-surface-container' 
                    : 'bg-surface-container opacity-60'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <div className="title-medium text-on-surface">{rule.name}</div>
                      {getSeverityBadge(rule.severity)}
                      {getRuleTypeBadge(rule.ruleType)}
                    </div>
                    
                    <div className="body-medium text-on-surface-variant mb-3">
                      {rule.description}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="label-medium text-on-surface-variant">Affects:</span>
                      {rule.affectedAttributes.map((attr, index) => (
                        <span
                          key={index}
                          className="label-medium px-2 py-0.5 rounded bg-surface-container-highest text-on-surface"
                        >
                          {attr}
                        </span>
                      ))}
                    </div>

                    <div className="body-small text-on-surface-variant">
                      Last modified {rule.lastModified}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleRule(rule.id)}
                      className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
                        rule.enabled
                          ? 'bg-tertiary-container hover:bg-tertiary-container/80'
                          : 'bg-surface-container-highest hover:bg-surface-container-high'
                      }`}
                      aria-label={rule.enabled ? 'Disable rule' : 'Enable rule'}
                    >
                      {rule.enabled ? (
                        <ToggleRight className="w-6 h-6 text-on-tertiary-container" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-on-surface-variant" />
                      )}
                    </button>
                    <button
                      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-highest transition-colors"
                      aria-label="Edit rule"
                    >
                      <Edit2 className="w-5 h-5 text-on-surface-variant" />
                    </button>
                    <button
                      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-error-container transition-colors"
                      aria-label="Delete rule"
                    >
                      <Trash2 className="w-5 h-5 text-error" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
