import React, { useState } from 'react';
import { ArrowLeft, Upload, Clock, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface PublishingVersionsScreenProps {
  onBack: () => void;
}

interface Version {
  id: string;
  version: string;
  status: 'draft' | 'published' | 'archived';
  publishedDate?: string;
  publishedBy?: string;
  changes: number;
  description: string;
}

const mockVersions: Version[] = [
  {
    id: '1',
    version: '1.3.0',
    status: 'draft',
    changes: 12,
    description: 'Added new attributes for sustainability metrics and updated price ladders for EUR'
  },
  {
    id: '2',
    version: '1.2.0',
    status: 'published',
    publishedDate: '2024-12-01',
    publishedBy: 'Admin User',
    changes: 8,
    description: 'Updated dropdown values for category and added France country overrides'
  },
  {
    id: '3',
    version: '1.1.0',
    status: 'published',
    publishedDate: '2024-11-15',
    publishedBy: 'Admin User',
    changes: 15,
    description: 'Major update to attribute dictionary and validation rules'
  },
  {
    id: '4',
    version: '1.0.0',
    status: 'archived',
    publishedDate: '2024-10-01',
    publishedBy: 'System',
    changes: 45,
    description: 'Initial configuration setup for all brands and countries'
  },
];

export function PublishingVersionsScreen({ onBack }: PublishingVersionsScreenProps) {
  const [versions, setVersions] = useState<Version[]>(mockVersions);
  const [pendingChanges] = useState(12);

  const getStatusBadge = (status: Version['status']) => {
    switch (status) {
      case 'draft':
        return (
          <Badge variant="outline" className="border-outline bg-surface-container-highest">
            <span className="label-small text-on-surface-variant">Draft</span>
          </Badge>
        );
      case 'published':
        return (
          <Badge variant="outline" className="border-tertiary bg-tertiary-container">
            <span className="label-small text-on-tertiary-container">Published</span>
          </Badge>
        );
      case 'archived':
        return (
          <Badge variant="outline" className="border-outline bg-surface-variant">
            <span className="label-small text-on-surface-variant">Archived</span>
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
            <div className="title-large text-on-surface">Publishing & Versions</div>
            <div className="body-medium text-on-surface-variant">
              Publish changes and manage version history
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl px-4 md:px-6 py-6">
        {/* Pending Changes Card */}
        {pendingChanges > 0 && (
          <Card className="p-6 border-accent bg-accent/5 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="title-medium text-on-surface mb-1">
                    Unpublished changes
                  </div>
                  <div className="body-medium text-on-surface-variant mb-4">
                    You have {pendingChanges} pending changes that haven't been published yet. 
                    Review and publish them to make them active in the system.
                  </div>
                  <div className="flex gap-3">
                    <Button>
                      <Upload className="w-5 h-5 mr-2" />
                      <span>Publish changes</span>
                    </Button>
                    <Button variant="outline">
                      <span>Review changes</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Version History */}
        <div className="mb-4">
          <div className="title-large text-on-surface mb-1">Version history</div>
          <div className="body-medium text-on-surface-variant">
            Track all published versions and their changes
          </div>
        </div>

        <div className="space-y-3">
          {versions.map((version) => (
            <Card 
              key={version.id} 
              className="p-6 border-outline-variant bg-surface-container"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 pt-1">
                  {version.status === 'published' ? (
                    <CheckCircle className="w-6 h-6 text-tertiary" />
                  ) : version.status === 'draft' ? (
                    <Clock className="w-6 h-6 text-on-surface-variant" />
                  ) : (
                    <Download className="w-6 h-6 text-on-surface-variant" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <div className="title-medium text-on-surface">
                      Version {version.version}
                    </div>
                    {getStatusBadge(version.status)}
                    <Badge variant="outline" className="border-outline bg-surface-container-highest">
                      <span className="label-small text-on-surface-variant">
                        {version.changes} changes
                      </span>
                    </Badge>
                  </div>
                  
                  <div className="body-medium text-on-surface mb-3">
                    {version.description}
                  </div>

                  {version.publishedDate && (
                    <div className="body-small text-on-surface-variant">
                      Published {version.publishedDate} by {version.publishedBy}
                    </div>
                  )}

                  {version.status === 'draft' && (
                    <div className="flex gap-2 mt-4">
                      <Button size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        <span>Publish</span>
                      </Button>
                      <Button size="sm" variant="outline">
                        <span>View changes</span>
                      </Button>
                    </div>
                  )}

                  {version.status !== 'draft' && (
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        <span>Export</span>
                      </Button>
                      <Button size="sm" variant="outline">
                        <span>View details</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
