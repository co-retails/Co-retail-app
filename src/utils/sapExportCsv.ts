import { OrderItem } from '../components/OrderCreationScreen';
import { SapExportJob } from '../data/mockSapExportJobs';

const HEADERS = [
  'ItemID',
  'Brand',
  'Gender',
  'Category',
  'Subcategory',
  'Size',
  'Color',
  'Price',
  'PartnerItemID',
];

function escapeCell(value: unknown): string {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

export function buildSapCsv(items: OrderItem[]): string {
  const headerRow = HEADERS.join(',');

  if (!items || items.length === 0) {
    return [
      headerRow,
      escapeCell('# no items recorded for historical job'),
    ].join('\n');
  }

  const rows = items.map((item) =>
    [
      item.itemId,
      item.brand,
      item.gender,
      item.category,
      item.subcategory,
      item.size,
      item.color,
      item.price,
      item.partnerItemId ?? '',
    ]
      .map(escapeCell)
      .join(','),
  );

  return [headerRow, ...rows].join('\n');
}

export function downloadSapCsv(job: SapExportJob, items: OrderItem[]): void {
  const csv = buildSapCsv(items);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', job.fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
