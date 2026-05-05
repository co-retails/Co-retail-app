export type SapExportJobStatus = 'queued' | 'in-progress' | 'success' | 'failed';

export interface SapExportJob {
  id: string;
  orderId: string;
  partnerId?: string;
  partnerName: string;
  status: SapExportJobStatus;
  itemCount: number;
  fileName: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  errorCode?: string;
  errorMessage?: string;
  retryCount: number;
}

const fileName = (orderId: string) => `sap-mdg-${orderId}.csv`;

export const mockSapExportJobs: SapExportJob[] = [
  {
    id: 'sap-job-001',
    orderId: 'THR-ORD-2024-002',
    partnerId: '2',
    partnerName: 'Thrifted',
    status: 'success',
    itemCount: 48,
    fileName: fileName('THR-ORD-2024-002'),
    createdAt: '2024-12-10T08:14:00.000Z',
    startedAt: '2024-12-10T08:14:02.000Z',
    completedAt: '2024-12-10T08:14:11.000Z',
    retryCount: 0,
  },
  {
    id: 'sap-job-002',
    orderId: 'SEL-ORD-2024-INTRANSIT-001',
    partnerId: '1',
    partnerName: 'Sellpy',
    status: 'success',
    itemCount: 64,
    fileName: fileName('SEL-ORD-2024-INTRANSIT-001'),
    createdAt: '2024-12-07T09:02:00.000Z',
    startedAt: '2024-12-07T09:02:03.000Z',
    completedAt: '2024-12-07T09:02:18.000Z',
    retryCount: 0,
  },
  {
    id: 'sap-job-003',
    orderId: 'SEL-ORD-2024-INTRANSIT-002',
    partnerId: '1',
    partnerName: 'Sellpy',
    status: 'failed',
    itemCount: 28,
    fileName: fileName('SEL-ORD-2024-INTRANSIT-002'),
    createdAt: '2024-12-06T11:30:00.000Z',
    startedAt: '2024-12-06T11:30:04.000Z',
    completedAt: '2024-12-06T11:30:34.000Z',
    errorCode: 'SAP_TIMEOUT',
    errorMessage: 'SAP MDG endpoint did not respond within 30s. The CSV was not accepted; SAP may need to retry from their side.',
    retryCount: 2,
  },
  {
    id: 'sap-job-004',
    orderId: 'THR-ORD-2024-004',
    partnerId: '2',
    partnerName: 'Thrifted',
    status: 'failed',
    itemCount: 36,
    fileName: fileName('THR-ORD-2024-004'),
    createdAt: '2024-12-08T07:45:00.000Z',
    startedAt: '2024-12-08T07:45:01.000Z',
    completedAt: '2024-12-08T07:45:06.000Z',
    errorCode: 'VALIDATION_FAILED',
    errorMessage: 'SAP MDG rejected 3 rows: missing brand code mapping for "Weekday Kids". Articles were not created.',
    retryCount: 1,
  },
  {
    id: 'sap-job-005',
    orderId: 'SEL-ORD-2024-APPROVAL-001',
    partnerId: '1',
    partnerName: 'Sellpy',
    status: 'in-progress',
    itemCount: 38,
    fileName: fileName('SEL-ORD-2024-APPROVAL-001'),
    createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    startedAt: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
    retryCount: 0,
  },
  {
    id: 'sap-job-006',
    orderId: 'SEL-ORD-2024-APPROVAL-002',
    partnerId: '1',
    partnerName: 'Sellpy',
    status: 'queued',
    itemCount: 42,
    fileName: fileName('SEL-ORD-2024-APPROVAL-002'),
    createdAt: new Date(Date.now() - 1000 * 30).toISOString(),
    retryCount: 0,
  },
  {
    id: 'sap-job-007',
    orderId: 'SEL-ORD-2024-APPROVAL-003',
    partnerId: '1',
    partnerName: 'Sellpy',
    status: 'failed',
    itemCount: 30,
    fileName: fileName('SEL-ORD-2024-APPROVAL-003'),
    createdAt: '2024-12-10T14:22:00.000Z',
    startedAt: '2024-12-10T14:22:02.000Z',
    completedAt: '2024-12-10T14:22:09.000Z',
    errorCode: 'DUPLICATE_ARTICLE',
    errorMessage: 'SAP MDG reports 5 duplicate article numbers already exist in the master. Manual deduplication required before re-export.',
    retryCount: 0,
  },
];
