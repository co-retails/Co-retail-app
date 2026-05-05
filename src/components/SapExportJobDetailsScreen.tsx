import { ArrowLeft, AlertTriangle, Download, RotateCcw, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { StatusBadge } from './ui/status-badge';
import { SapExportJob } from '../data/mockSapExportJobs';
import { OrderItem } from './OrderCreationScreen';
import { downloadSapCsv } from '../utils/sapExportCsv';

interface SapExportJobDetailsScreenProps {
  job: SapExportJob;
  orderItems: OrderItem[];
  onBack: () => void;
  onRetry: (jobId: string) => void;
}

function formatTimestamp(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function SapExportJobDetailsScreen({
  job,
  orderItems,
  onBack,
  onRetry,
}: SapExportJobDetailsScreenProps) {
  const handleDownload = () => downloadSapCsv(job, orderItems);

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
            <h1 className="title-large text-on-surface truncate">{job.orderId}</h1>
            <p className="body-small text-on-surface-variant truncate">
              {job.partnerName} · {job.fileName}
            </p>
          </div>
          <StatusBadge status={job.status} size="lg" />
        </div>
      </div>

      <div className="px-4 md:px-6 py-6 max-w-7xl mx-auto space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="title-medium">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <SummaryRow label="Order" value={job.orderId} />
            <SummaryRow label="Partner" value={job.partnerName} />
            <SummaryRow label="Items in CSV" value={String(job.itemCount)} />
            <SummaryRow label="File name" value={job.fileName} />
            <SummaryRow label="Retry count" value={String(job.retryCount)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="title-medium flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <SummaryRow label="Created" value={formatTimestamp(job.createdAt)} />
            <SummaryRow label="Started" value={formatTimestamp(job.startedAt)} />
            <SummaryRow label="Completed" value={formatTimestamp(job.completedAt)} />
          </CardContent>
        </Card>

        {job.status === 'failed' && (
          <div className="rounded-lg bg-error-container text-on-error-container p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 space-y-1">
                <div className="label-large">
                  {job.errorCode ?? 'Export failed'}
                </div>
                {job.errorMessage && (
                  <div className="body-small">{job.errorMessage}</div>
                )}
                <div className="body-small opacity-80">
                  Contact SAP MDG support with the order ID and file name above.
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download CSV
          </Button>
          {job.status === 'failed' && (
            <Button variant="outline" onClick={() => onRetry(job.id)}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry export
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <span className="body-small text-on-surface-variant">{label}</span>
      <span className="body-medium text-on-surface text-right break-all">
        {value}
      </span>
    </div>
  );
}
