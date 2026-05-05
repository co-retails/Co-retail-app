import { useMemo } from 'react';
import { ArrowLeft, ChevronRight, Database } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { EmptyState } from './ui/empty-state';
import { StatusBadge } from './ui/status-badge';
import { useMediaQuery } from './ui/use-mobile';
import { SapExportJob } from '../data/mockSapExportJobs';

interface SapExportJobsScreenProps {
  jobs: SapExportJob[];
  onBack: () => void;
  onSelectJob: (jobId: string) => void;
}

function formatRelative(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / (1000 * 60));
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr} h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay} d ago`;
  return date.toLocaleDateString();
}

const STATUS_ORDER: Record<SapExportJob['status'], number> = {
  failed: 0,
  'in-progress': 1,
  queued: 2,
  success: 3,
};

export default function SapExportJobsScreen({
  jobs,
  onBack,
  onSelectJob,
}: SapExportJobsScreenProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const sortedJobs = useMemo(() => {
    return [...jobs].sort((a, b) => {
      const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      if (statusDiff !== 0) return statusDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [jobs]);

  return (
    <div className="min-h-screen bg-surface">
      <div className="w-full bg-surface border-b border-outline-variant sticky top-0 z-20">
        <div className="px-4 md:px-6 py-4 max-w-7xl mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-full"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5 text-on-surface" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="title-large text-on-surface truncate">SAP MDG export jobs</h1>
            <p className="body-small text-on-surface-variant truncate">
              Status of CSV exports sent to SAP MDG when partner orders register.
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 py-6 max-w-7xl mx-auto space-y-6">
        {sortedJobs.length === 0 ? (
          <Card>
            <CardContent className="py-2">
              <EmptyState
                icon={<Database className="w-6 h-6" />}
                title="No export jobs yet"
                description="A job appears here each time a partner registers an order."
              />
            </CardContent>
          </Card>
        ) : isDesktop ? (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4">Order</TableHead>
                    <TableHead>Partner</TableHead>
                    <TableHead className="text-right">Items</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedJobs.map((job) => (
                    <TableRow
                      key={job.id}
                      onClick={() => onSelectJob(job.id)}
                      className="cursor-pointer"
                    >
                      <TableCell className="px-4 font-medium text-on-surface">
                        {job.orderId}
                      </TableCell>
                      <TableCell className="text-on-surface-variant">
                        {job.partnerName}
                      </TableCell>
                      <TableCell className="text-right text-on-surface-variant">
                        {job.itemCount}
                      </TableCell>
                      <TableCell className="text-on-surface-variant">
                        {formatRelative(job.createdAt)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={job.status} size="lg" />
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <ChevronRight className="w-5 h-5 text-on-surface-variant inline" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sortedJobs.map((job) => (
              <button
                key={job.id}
                type="button"
                onClick={() => onSelectJob(job.id)}
                className="w-full text-left rounded-lg border border-outline-variant bg-surface-container hover:bg-surface-container-high active:bg-surface-container-highest transition-colors p-4 min-h-[112px] touch-manipulation"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="label-large text-on-surface truncate">
                      {job.orderId}
                    </div>
                    <div className="body-small text-on-surface-variant truncate">
                      {job.partnerName} · {job.itemCount} items
                    </div>
                    <div className="body-small text-on-surface-variant mt-1">
                      {formatRelative(job.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={job.status} />
                    <ChevronRight className="w-5 h-5 text-on-surface-variant" />
                  </div>
                </div>
                {job.status === 'failed' && job.errorMessage && (
                  <div className="mt-3 rounded-lg bg-error-container text-on-error-container px-3 py-2 body-small">
                    {job.errorCode ? <strong>{job.errorCode}: </strong> : null}
                    {job.errorMessage}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

