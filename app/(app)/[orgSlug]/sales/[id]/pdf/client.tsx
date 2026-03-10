// PDF view client: rehydrates form_data into DocumentData and renders the PDF
// using BlobProvider + PDFViewer — same pattern as PreviewStep.
'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BlobProvider } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { OrderDocument } from '@/components/documents/OrderDocument';
import { DirectSalesDocument } from '@/components/documents/DirectSales';
import { downloadPdf } from '@/utils/form';
import { formatOrderData } from '@/utils/format';
import { migrateFormData } from '@/utils/format/migrateFormData';
import type { Company } from '@/types/document';
import dynamic from 'next/dynamic';

const PDFViewer = dynamic(() => import('@/components/documents/PDFViewer'), {
  ssr: false,
});

interface PDFViewClientProps {
  formData: unknown;
  formDataVersion: number;
  company: Company;
  storeCode: string;
  orderNumber: string;
  documentId: string;
  orgSlug: string;
}

export function PDFViewClient({
  formData,
  formDataVersion,
  company,
  storeCode,
  orderNumber,
  documentId,
  orgSlug,
}: PDFViewClientProps) {
  const router = useRouter();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const documentData = useMemo(() => {
    const values = migrateFormData(formData, formDataVersion);
    return formatOrderData(values, { company, storeCode });
  }, [formData, formDataVersion, company, storeCode]);

  const isDelivery = documentData.order.salesType === 'delivery';
  const DocumentComponent = isDelivery ? OrderDocument : DirectSalesDocument;
  const documentType = isDelivery ? 'Encomenda' : 'Venda Direta';

  const handleDownload = async (url: string | null) => {
    if (!url) return;
    setIsDownloading(true);
    setDownloadError(null);
    try {
      await downloadPdf(url, orderNumber);
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadError('Erro ao transferir o PDF.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-white overflow-hidden">
      <div className="flex h-screen">
        {/* Left side — Document details */}
        <div className="flex-grow p-8">
          <BlobProvider document={<DocumentComponent {...documentData} />}>
            {({ url, loading }) => (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold tracking-tight">
                  {documentType} — {orderNumber}
                </h2>

                <div className="border rounded-lg divide-y divide-neutral-100">
                  <div className="px-6 py-4">
                    <h3 className="text-lg font-medium text-neutral-900">
                      Detalhes
                    </h3>
                  </div>

                  <div className="px-6 py-4">
                    <dl className="space-y-4">
                      <div className="flex justify-between items-center gap-4">
                        <dt className="text-sm font-medium text-neutral-600">
                          Cliente
                        </dt>
                        <dd className="text-sm font-semibold text-neutral-900">
                          {documentData.customer.name}
                        </dd>
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <dt className="text-sm font-medium text-neutral-600">
                          Data
                        </dt>
                        <dd className="text-sm font-semibold text-neutral-900">
                          {documentData.order.date}
                        </dd>
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <dt className="text-sm font-medium text-neutral-600">
                          Total de Itens
                        </dt>
                        <dd className="text-sm font-semibold text-neutral-900">
                          {documentData.order.items.length}
                        </dd>
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <dt className="text-sm font-medium text-neutral-600">
                          Valor Total
                        </dt>
                        <dd className="text-sm font-semibold text-neutral-900">
                          €{documentData.order.totalAmount.toFixed(2)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    onClick={() => handleDownload(url)}
                    disabled={loading || isDownloading}
                    className="flex-1"
                  >
                    {loading || isDownloading
                      ? 'A gerar PDF...'
                      : 'Transferir PDF'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                      router.push(`/${orgSlug}/sales/${documentId}`)
                    }
                  >
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push(`/${orgSlug}/sales`)}
                  >
                    Voltar
                  </Button>
                </div>

                {downloadError && (
                  <p className="text-sm text-red-700 mt-2">{downloadError}</p>
                )}
              </div>
            )}
          </BlobProvider>
        </div>

        {/* Right side — PDF preview */}
        <div className="w-[750px] h-screen shrink-0 bg-[#F6F3F0] p-8 flex items-center justify-center rounded-lg overflow-y-auto">
          <BlobProvider document={<DocumentComponent {...documentData} />}>
            {({ url, loading }) => (
              <div className="h-full">
                {!loading && url && (
                  <PDFViewer url={url} className="w-full h-auto" />
                )}
              </div>
            )}
          </BlobProvider>
        </div>
      </div>
    </div>
  );
}
