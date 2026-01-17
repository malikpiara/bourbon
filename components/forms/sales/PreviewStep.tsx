import { BlobProvider } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { DocumentData } from '@/types/document';
import { OrderDocument } from '@/components/documents/OrderDocument';
import { DirectSalesDocument } from '@/components/documents/DirectSales';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { PAYMENT_TYPES } from '@/lib/constants';

const PDFViewer = dynamic(() => import('@/components/documents/PDFViewer'), {
  ssr: false,
});

interface PreviewStepProps {
  documentData: DocumentData;
  handleDownload: (url: string) => void;
  handleBackToForm: () => void;
  pdfError: string | null;
  isGenerating: boolean;
}

export const PreviewStep = ({
  documentData,
  handleDownload,
  handleBackToForm,
  pdfError,
  isGenerating,
}: PreviewStepProps) => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  if (!documentData) {
    return <p>Erro: Os dados do documento estão indisponíveis.</p>;
  }

  const isDelivery = documentData.order.salesType === 'delivery';
  const DocumentComponent = isDelivery ? OrderDocument : DirectSalesDocument;
  const documentType = isDelivery ? 'Encomenda' : 'Venda Direta';

  return (
    <div className="absolute inset-0 z-50 bg-white overflow-hidden">
      <div className="flex h-screen">
        {/* Left side - Form content */}
        <div className="flex-grow p-8">
          <BlobProvider document={<DocumentComponent {...documentData} />}>
            {({ url, loading }) => (
              <div className="space-y-6">
                <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                  Detalhes da {documentType}
                </h2>

                <div className="border rounded-lg  divide-y divide-neutral-100">
                  <div className="px-6 py-4">
                    <h3 className="text-lg font-medium text-neutral-900">
                      Detalhes da {documentType}
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
                          Número
                        </dt>
                        <dd className="text-sm font-semibold text-neutral-900">
                          {documentData.order.id}
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
                      {isDelivery && (
                        <>
                          <div className="flex justify-between items-center gap-4">
                            <dt className="text-sm font-medium text-neutral-600">
                              Primeiro Pagamento
                            </dt>
                            <dd className="text-sm font-semibold text-neutral-900">
                              €
                              {documentData.order.firstPayment?.toFixed(2) ||
                                '0.00'}
                            </dd>
                          </div>
                          <div className="flex justify-between items-center gap-4">
                            <dt className="text-sm font-medium text-neutral-600">
                              Segundo Pagamento
                            </dt>
                            <dd className="text-sm font-semibold text-neutral-900">
                              €
                              {documentData.order.secondPayment?.toFixed(2) ||
                                '0.00'}
                            </dd>
                          </div>
                          {documentData.order.paymentType && (
                            <div className="flex justify-between items-center gap-4">
                              <dt className="text-sm font-medium text-neutral-600">
                                Método de Pagamento
                              </dt>
                              <dd className="text-sm font-semibold text-neutral-900 uppercase">
                                {PAYMENT_TYPES.find(
                                  (type) =>
                                    type.value ===
                                    documentData.order.paymentType
                                )?.label || documentData.order.paymentType}
                              </dd>
                            </div>
                          )}
                        </>
                      )}
                      {isDelivery && documentData.customer.address && (
                        <div className="flex justify-between items-start gap-4">
                          <dt className="text-sm font-medium text-neutral-600">
                            Morada de Entrega
                          </dt>
                          <dd className="text-sm font-semibold text-neutral-900 text-right">
                            {documentData.customer.address.address1}
                            {documentData.customer.address.address2 && (
                              <span className="block">
                                {documentData.customer.address.address2}
                              </span>
                            )}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    onClick={() => {
                      if (url) handleDownload(url);
                    }}
                    disabled={loading || isGenerating}
                    className="flex-1"
                  >
                    {loading || isGenerating
                      ? 'A gerar PDF...'
                      : 'Transferir PDF'}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleBackToForm}
                    variant="outline"
                    className="flex-1"
                  >
                    Voltar ao Formulário
                  </Button>
                </div>

                {pdfError && (
                  <p className="text-sm text-red-700 mt-2">{pdfError}</p>
                )}
              </div>
            )}
          </BlobProvider>
        </div>

        {/* Right side - PDF Preview */}
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
};
