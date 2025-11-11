import React, { useState } from 'react';
import { ArrowLeft, Search, Filter, FileText, User, Calendar, Download } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface AuditLogScreenProps {
  onBack: () => void;
}

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: 'create' | 'update' | 'delete' | 'publish';
  entityType: string;
  entityName: string;
  changes?: string;
  details: string;
}

const mockAuditLog: AuditEntry[] = [
  {
    id: '1',
    timestamp: '2024-12-09 14:32:15',
    user: 'Admin User',
    action: 'update',
    entityType: 'Price Ladder',
    entityName: 'SEK Price Points - H&M',
    changes: '3 changes',
    details: 'Updated price points: added 350 SEK, removed 275 SEK, modified 400 SEK'
  },
  {
    id: '2',
    timestamp: '2024-12-09 11:15:42',
    user: 'Admin User',
    action: 'create',
    entityType: 'Country Override',
    entityName: 'COS - Germany',
    details: 'Created new country override with 5 attribute modifications'
  },
  {
    id: '3',
    timestamp: '2024-12-08 16:45:30',
    user: 'System',
    action: 'publish',
    entityType: 'Configuration',
    entityName: 'Version 1.2.0',
    changes: '8 changes',
    details: 'Published configuration version 1.2.0 with dropdown value updates'
  },
  {
    id: '4',
    timestamp: '2024-12-08 14:20:11',
    user: 'Admin User',
    action: 'update',
    entityType: 'Dropdown Values',
    entityName: 'Category',
    changes: '2 changes',
    details: 'Added "Swimwear" and "Sportswear" to category dropdown options'
  },
  {
    id: '5',
    timestamp: '2024-12-07 10:55:22',
    user: 'Admin User',
    action: 'delete',
    entityType: 'Validation Rule',
    entityName: 'Deprecated Color Format Check',
    details: 'Removed outdated validation rule for color formatting'
  },
  {
    id: '6',
    timestamp: '2024-12-07 09:30:45',
    user: 'Partner User',
    action: 'update',
    entityType: 'Partner Pricing',
    entityName: 'Chinese Partner - EUR',
    changes: '7 changes',
    details: 'Updated EUR price points for Chinese Partner'
  },
  {
    id: '7',
    timestamp: '2024-12-06 15:12:03',
    user: 'Admin User',
    action: 'create',
    entityType: 'Attribute',
    entityName: 'Sustainability Score',
    details: 'Added new attribute "Sustainability Score" to dictionary'
  },
  {
    id: '8',
    timestamp: '2024-12-05 13:40:18',
    user: 'Admin User',
    action: 'update',
    entityType: 'Validation Rule',
    entityName: 'Price Range Validation',
    details: 'Modified validation rule severity from warning to error'
  },
];

export function AuditLogScreen({ onBack }: AuditLogScreenProps) {
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(mockAuditLog);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLog = auditLog.filter(entry =>
    entry.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.entityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getActionBadge = (action: AuditEntry['action']) => {
    switch (action) {
      case 'create':
        return (
          <Badge variant="outline" className="border-tertiary bg-tertiary-container">
            <span className="label-small text-on-tertiary-container">Create</span>
          </Badge>
        );
      case 'update':
        return (
          <Badge variant="outline" className="border-accent bg-accent/10">
            <span className="label-small text-accent">Update</span>
          </Badge>
        );
      case 'delete':
        return (
          <Badge variant="outline" className="border-error bg-error-container">
            <span className="label-small text-on-error-container">Delete</span>
          </Badge>
        );
      case 'publish':
        return (
          <Badge variant="outline" className="border-primary bg-primary-container">
            <span className="label-small text-on-primary-container">Publish</span>
          </Badge>
        );
    }
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
            <div className="title-large text-on-surface">Audit log</div>
            <div className="body-medium text-on-surface-variant">
              Track all configuration changes and actions
            </div>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="w-5 h-5" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="border-b border-outline-variant bg-surface-container-low">
        <div className="max-w-6xl px-4 md:px-6 py-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Search by user, entity, or action..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-lg border border-outline bg-surface-container text-on-surface body-large placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-5 h-5" />
              <span>Filter</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl px-4 md:px-6 py-6">
        {filteredLog.length === 0 ? (
          <Card className="p-12 border-outline bg-surface-container text-center">
            <div className="title-large text-on-surface mb-2">No audit entries found</div>
            <div className="body-medium text-on-surface-variant">
              Try adjusting your search criteria or filters
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredLog.map((entry) => (
              <Card 
                key={entry.id} 
                className="p-6 border-outline-variant bg-surface-container hover:bg-surface-container-high transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 pt-1">
                    <FileText className="w-6 h-6 text-on-surface-variant" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {getActionBadge(entry.action)}
                      <Badge variant="outline" className="border-outline bg-surface-container-highest">
                        <span className="label-small text-on-surface-variant">{entry.entityType}</span>
                      </Badge>
                      {entry.changes && (
                        <Badge variant="outline" className="border-outline bg-surface-container-highest">
                          <span className="label-small text-on-surface-variant">{entry.changes}</span>
                        </Badge>
                      )}
                    </div>

                    <div className="title-medium text-on-surface mb-2">
                      {entry.entityName}
                    </div>
                    
                    <div className="body-medium text-on-surface-variant mb-3">
                      {entry.details}
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-on-surface-variant" />
                        <span className="body-small text-on-surface-variant">{entry.user}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-on-surface-variant" />
                        <span className="body-small text-on-surface-variant">{entry.timestamp}</span>
                      </div>
                    </div>
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
