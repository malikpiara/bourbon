import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { formSchema, FormValues } from '@/lib/schema';
import { useCallback, useState } from 'react';
import { DocumentData } from '@/types/document';
import { Company } from '@/types/document';
import { downloadPdf } from '@/utils/form';
import { formatOrderData } from '@/utils/format';
import { StoreSelection, StoreOption } from './StoreSelection';
import { CustomerSection } from './CustomerSection';
import ProductSection from './ProductSection';
import { OrderMetadata } from './OrderMetadata';
import { fillFormWithTestData } from '@/lib/mocks/testData';
import { SalesTypeSelection } from './SalesTypeSelection';
import { PreviewStep } from './PreviewStep';
import { PaymentSection } from './PaymentSection';
import { generateOrderNumber } from '@/utils/generateOrderNumber';
import { createClient } from '@/lib/supabase/client';
import { insertSalesDocument } from '@/lib/supabase/mutations/sales-document';
import { updateSalesDocument } from '@/lib/supabase/mutations/update-sales-document';

// Define our form steps
type FormStep = 'store' | 'salesType' | 'details' | 'payments' | 'preview';

interface SalesFormProps {
  stores: StoreOption[];
  company: Company;
  orgId: string;
  /** Maps store UUID → store code (e.g. "OCT 1") */
  storeCodeMap: Record<string, string>;
  /** Pre-filled form values when editing an existing document */
  initialData?: FormValues;
  /** Supabase document ID when editing */
  documentId?: string;
  /** When true, skips store/salesType selection and updates instead of inserts */
  isEditMode?: boolean;
}

export function SalesForm({
  stores,
  company,
  orgId,
  storeCodeMap,
  initialData,
  documentId,
  isEditMode = false,
}: SalesFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>(
    isEditMode ? 'details' : 'store'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [documentData, setDocumentData] = useState<DocumentData | null>(null);
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
    defaultValues: initialData ?? {
      storeId: '',
      salesType: undefined,
      name: '',
      orderNumber: generateOrderNumber(),
      date: new Date(),
      email: '',
      phoneNumber: '',
      nif: '',
      address1: '',
      address2: '',
      postalCode: '',
      city: '',
      tableEntries: [],
      elevator: false,
      notes: '',
      sameAddress: true,
      billingAddress1: '',
      billingAddress2: '',
      billingPostalCode: '',
      billingCity: '',
      firstPayment: 0,
      secondPayment: 0,
      paymentType: undefined,
    },
  });

  const handleStoreSelect = (storeId: string) => {
    const selectedStore = stores.find((store) => store.id === storeId);
    form.setValue('storeId', storeId);

    if (selectedStore?.salesTypes.length === 1) {
      form.setValue('salesType', selectedStore.salesTypes[0]);
      setCurrentStep('details');
    } else {
      setCurrentStep('salesType');
    }
  };

  const handleSalesTypeSelect = (type: 'direct' | 'delivery') => {
    form.setValue('salesType', type);
    setCurrentStep('details');
  };

  const handlePreviewGeneration = useCallback(
    async (values: FormValues) => {
      try {
        const result = formSchema.safeParse(values);
        if (!result.success) {
          console.error('Validation Errors:', result.error.errors);
          setPdfError('Por favor, verifique os dados do formulário.');
          return;
        }

        // Save to Supabase
        setIsSaving(true);
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setPdfError('Sessão expirada. Por favor, inicie sessão novamente.');
          return;
        }

        if (isEditMode && documentId) {
          await updateSalesDocument({
            supabase,
            documentId,
            storeId: values.storeId,
            userId: user.id,
            values,
          });
        } else {
          const { orderNumber } = await insertSalesDocument({
            supabase,
            orgId,
            storeId: values.storeId,
            userId: user.id,
            values,
          });

          // Update the form's order number with the generated one
          form.setValue('orderNumber', orderNumber);
          values = { ...values, orderNumber };
        }

        setIsSaving(false);

        const storeCode = storeCodeMap[values.storeId] ?? values.storeId;
        const formattedData = formatOrderData(values, { company, storeCode });
        setDocumentData(formattedData);
        setCurrentStep('preview');
      } catch (error) {
        setIsSaving(false);
        console.error('Error generating preview:', error);
        setPdfError(
          error instanceof Error
            ? error.message
            : 'Ocorreu um erro ao gerar a pré-visualização.'
        );
      }
    },
    [orgId, company, storeCodeMap, form, isEditMode, documentId]
  );

  const handleDownload = useCallback(
    async (url: string | null) => {
      if (!url || !documentData) return;

      setIsGenerating(true);
      setPdfError(null);

      try {
        await downloadPdf(url, documentData.order.id);
      } catch (error) {
        console.error('Error downloading PDF:', error);
        setPdfError(
          error instanceof Error
            ? error.message
            : 'Ocorreu um erro ao transferir o PDF.'
        );
      } finally {
        setIsGenerating(false);
      }
    },
    [documentData]
  );

  const handleBackToForm = useCallback(() => {
    const currentValues = form.getValues();
    form.reset(currentValues);
    setCurrentStep('details');
    setDocumentData(null);
    setPdfError(null);
  }, [form]);

  const handleFillTestData = useCallback(() => {
    fillFormWithTestData(form, stores[0]?.id);
    setCurrentStep('details');
  }, [form, stores]);

  return (
    <FormProvider {...form}>
      <div className="space-y-8">
        {process.env.NODE_ENV === 'development' && !isEditMode && (
          <Button
            type="button"
            onClick={handleFillTestData}
            variant="outline"
            className="mb-4"
          >
            Fill Test Data
          </Button>
        )}

        {currentStep === 'store' && (
          <StoreSelection
            form={form}
            stores={stores}
            onStoreSelect={handleStoreSelect}
          />
        )}

        {currentStep === 'salesType' && (
          <SalesTypeSelection
            form={form}
            onSalesTypeSelect={handleSalesTypeSelect}
            salesTypes={['direct', 'delivery']}
          />
        )}

        {currentStep === 'details' && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) => {
                if (values.salesType === 'delivery') {
                  setCurrentStep('payments');
                } else {
                  handlePreviewGeneration(values);
                }
              })}
              className="space-y-8"
            >
              <OrderMetadata
                form={form}
                isOpen={isCollapsibleOpen}
                onOpenChange={setIsCollapsibleOpen}
              />

              <ProductSection form={form} />

              <CustomerSection form={form} />

              <Button
                type="submit"
                size={'lg'}
                disabled={
                  isSaving ||
                  !form.formState.isValid ||
                  (form.watch('salesType') === 'delivery' &&
                    !form.watch('sameAddress') &&
                    (!form.watch('billingAddress1') ||
                      !form.watch('billingPostalCode') ||
                      !form.watch('billingCity')))
                }
              >
                {form.watch('salesType') === 'delivery'
                  ? 'Continuar para Pagamentos'
                  : isSaving
                    ? 'A guardar...'
                    : 'Pré-visualizar Documento'}
              </Button>
            </form>
          </Form>
        )}

        {/* Only show payments step if it's a delivery */}
        {currentStep === 'payments' &&
          form.watch('salesType') === 'delivery' && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handlePreviewGeneration)}
                className="space-y-8"
              >
                <PaymentSection form={form} />

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    size={'lg'}
                    onClick={() => setCurrentStep('details')}
                  >
                    Voltar
                  </Button>
                  <Button type="submit" size={'lg'} disabled={isSaving}>
                    {isSaving ? 'A guardar...' : 'Pré-visualizar Documento'}
                  </Button>
                </div>
              </form>
            </Form>
          )}

        {currentStep === 'preview' && documentData && (
          <PreviewStep
            documentData={documentData}
            handleDownload={handleDownload}
            handleBackToForm={handleBackToForm}
            pdfError={pdfError}
            isGenerating={isGenerating}
          />
        )}
      </div>
    </FormProvider>
  );
}
