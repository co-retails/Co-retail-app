import React, { useState } from 'react';
import { ArrowLeft, Plus, FileText, Calendar, Globe, Eye, EyeOff, MoreVertical, Edit, Trash2, Share2, Copy } from 'lucide-react';
import { LineSheet } from './ShowroomTypes';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

interface LineSheetsListScreenProps {
  lineSheets: LineSheet[];
  onBack: () => void;
  onCreate: () => void;
  onView: (lineSheetId: string) => void;
  onEdit?: (lineSheetId: string) => void;
  onDelete?: (lineSheetId: string) => void;
  onShare?: (lineSheetId: string) => void;
}

export default function LineSheetsListScreen({
  lineSheets,
  onBack,
  onCreate,
  onView,
  onEdit,
  onDelete,
  onShare
}: LineSheetsListScreenProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'draft'>('all');

  const filteredLineSheets = lineSheets.filter(ls => {
    if (filter === 'all') return true;
    return ls.status === filter;
  });

  const getStatusBadge = (status: LineSheet['status']) => {
    const config = {
      active: { label: 'Active', variant: 'default' as const },
      expired: { label: 'Expired', variant: 'outline' as const },
      draft: { label: 'Draft', variant: 'secondary' as const }
    };
    const { label, variant } = config[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Top App Bar */}
      <div className="sticky top-0 bg-surface z-10 border-b border-outline-variant">
        <div className="flex items-center h-16 px-4 md:px-6">
          <button 
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors mr-2"
            onClick={onBack}
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-on-surface" />
          </button>
          
          <h1 className="title-large text-on-surface flex-1">Line sheets</h1>

          <Button
            size="sm"
            className="bg-primary text-on-primary hover:bg-primary/90"
            onClick={onCreate}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 md:px-6 flex gap-2 pb-3">
          {(['all', 'active', 'expired', 'draft'] as const).map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-4 py-2 rounded-lg label-large transition-colors ${
                filter === filterOption
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              <span className="ml-2 body-small opacity-80">
                {filterOption === 'all' 
                  ? lineSheets.length 
                  : lineSheets.filter(ls => ls.status === filterOption).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-6 py-6 max-w-4xl mx-auto">
        {filteredLineSheets.length === 0 ? (
          <Card className="p-12 bg-surface-container border border-outline-variant text-center">
            <FileText className="w-12 h-12 text-on-surface-variant mx-auto mb-4" />
            <h3 className="title-large text-on-surface mb-2">No line sheets</h3>
            <p className="body-medium text-on-surface-variant mb-6">
              {filter === 'all' 
                ? 'Create your first line sheet to showcase products to buyers'
                : `No ${filter} line sheets found`}
            </p>
            {filter === 'all' && (
              <Button
                onClick={onCreate}
                className="bg-primary text-on-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create line sheet
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredLineSheets.map((lineSheet) => (
              <Card
                key={lineSheet.id}
                className="p-4 bg-surface-container border border-outline-variant hover:bg-surface-container-high transition-colors cursor-pointer"
                onClick={() => onView(lineSheet.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-container rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-on-primary-container" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="title-medium text-on-surface mb-1">{lineSheet.name}</h3>
                        <div className="flex items-center gap-3 flex-wrap">
                          {getStatusBadge(lineSheet.status)}
                          
                          <div className="flex items-center gap-1 text-on-surface-variant">
                            {lineSheet.visibility === 'public' ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
                            <span className="body-small">{lineSheet.visibility}</span>
                          </div>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-highest transition-colors">
                            <MoreVertical className="w-5 h-5 text-on-surface-variant" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onShare && (
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              onShare(lineSheet.id);
                            }}>
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                          )}
                          {onEdit && (
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              onEdit(lineSheet.id);
                            }}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(lineSheet.id);
                              }}
                              className="text-error"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <p className="label-small text-on-surface-variant mb-1">Products</p>
                        <p className="body-medium text-on-surface">{lineSheet.productIds.length}</p>
                      </div>

                      <div>
                        <p className="label-small text-on-surface-variant mb-1">Markets</p>
                        <p className="body-medium text-on-surface">{lineSheet.markets.length}</p>
                      </div>

                      <div>
                        <p className="label-small text-on-surface-variant mb-1">Available from</p>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-on-surface-variant" />
                          <p className="body-small text-on-surface">
                            {new Date(lineSheet.availabilityWindow.start).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="label-small text-on-surface-variant mb-1">Available until</p>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-on-surface-variant" />
                          <p className="body-small text-on-surface">
                            {new Date(lineSheet.availabilityWindow.end).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {lineSheet.markets.length > 0 && (
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <Globe className="w-4 h-4 text-on-surface-variant" />
                        {lineSheet.markets.slice(0, 5).map((market) => (
                          <Badge key={market} variant="outline" className="body-small">
                            {market}
                          </Badge>
                        ))}
                        {lineSheet.markets.length > 5 && (
                          <span className="body-small text-on-surface-variant">
                            +{lineSheet.markets.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
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
