'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react'; // We'll use this icon for the copy button

// Custom styles for text selection - keeping this from the second file as it adds useful functionality
const textLayerStyles = `
  .react-pdf__Page__textContent {
    opacity: 0.5;
  }

  .react-pdf__Page__textContent ::selection {
    background: rgba(250, 233, 157, 1);  /* Light yellow */
    color: #000;
  }

  .textLayer {
    opacity: 0.5;
    mix-blend-mode: multiply;
  }

  .textLayer ::selection {
    background: rgba(250, 233, 157, 1);
    color: #000;
  }

  /* For Firefox */
  .textLayer ::-moz-selection {
    background: rgba(250, 233, 157, 1);
    color: #000;
  }

  .react-pdf__Page__textContent {
    pointer-events: auto !important;
  }
`;

// Interface for our selection position
interface SelectionPosition {
  x: number;
  y: number;
  show: boolean;
  text: string;
}

// Try to set up the polyfill, but wrap it in a try-catch in case something goes wrong
try {
  if (typeof window !== 'undefined' && !Promise.withResolvers) {
    Promise.withResolvers = function <T>() {
      let resolve!: (value: T | PromiseLike<T>) => void;
      let reject!: (reason?: unknown) => void;

      const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
      });

      return { promise, resolve, reject };
    };
  }

  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
} catch (error) {
  console.error('Error initializing PDF viewer:', error);
}

interface PDFViewerProps {
  url: string | null;
  className?: string;
}

const PDFViewer = ({ url, className }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [key, setKey] = useState(0);
  const [initializationError, setInitializationError] =
    useState<boolean>(false);

  // Add new state for selection position
  const [selection, setSelection] = useState<SelectionPosition>({
    x: 0,
    y: 0,
    show: false,
    text: '',
  });

  // Handler for text selection
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();

    if (selection && selection.toString().trim().length > 0) {
      // Make sure we're selecting text within the PDF document
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Check if the selection is within our PDF container
      const pdfContainer = document.querySelector('.react-pdf__Document');
      if (!pdfContainer?.contains(range.commonAncestorContainer)) {
        return;
      }

      setSelection({
        x: rect.left + rect.width / 2,
        y: rect.top,
        show: true,
        text: selection.toString().trim(), // Make sure to trim whitespace
      });
    } else {
      setSelection((prev) => ({ ...prev, show: false }));
    }
  }, []);

  // Modify the handleCopy function to ensure we're copying the text
  const handleCopy = useCallback(async () => {
    try {
      if (!selection.text) {
        console.warn('No text selected to copy');
        return;
      }

      // Try using the modern clipboard API first
      await navigator.clipboard.writeText(selection.text);
      console.log('Text copied successfully:', selection.text);

      // Add a fallback for older browsers
      if (!navigator.clipboard) {
        const textArea = document.createElement('textarea');
        textArea.value = selection.text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      // Hide the tooltip after successful copy
      setSelection((prev) => ({ ...prev, show: false }));
    } catch (err) {
      console.error('Failed to copy text:', err);
      // Optionally, show an error message to the user
    }
  }, [selection.text]);

  // Add event listeners for selection changes
  useEffect(() => {
    document.addEventListener('selectionchange', handleTextSelection);
    // Also hide tooltip when clicking outside
    document.addEventListener('mousedown', (e) => {
      if (!(e.target as Element).closest('.selection-tooltip')) {
        setSelection((prev) => ({ ...prev, show: false }));
      }
    });

    return () => {
      document.removeEventListener('selectionchange', handleTextSelection);
      document.removeEventListener('mousedown', () => {});
    };
  }, [handleTextSelection]);

  useEffect(() => {
    setIsClient(true);
    // Check if the necessary features are available
    if (typeof window !== 'undefined' && !Promise.withResolvers) {
      setInitializationError(true);
    }

    // Add custom styles to document
    const styleSheet = document.createElement('style');
    styleSheet.textContent = textLayerStyles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }): void => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error: Error): void => {
    console.error('Error loading PDF:', error);
    setError(error);
    setLoading(false);
  };

  const handlePageChange = (newPage: number) => {
    setPageNumber(newPage);
    setKey((prev) => prev + 1);
  };

  if (!isClient) {
    return null;
  }

  // Common loading state component for reuse
  const LoadingState = () => (
    <div className="flex justify-center items-center h-64 bg-neutral-100 rounded-lg">
      <p className="text-neutral-500">A carregar PDF...</p>
    </div>
  );

  // If we detect that the browser doesn't support necessary features
  if (initializationError) {
    return (
      <div className="flex flex-col justify-center items-center h-64 bg-neutral-100 rounded-lg">
        <p className="text-neutral-500">
          A visualização do PDF não está disponível no momento.
        </p>
        <p className="text-sm text-neutral-400 mt-2">
          Por favor, utilize o botão de download para ver o documento.
        </p>
      </div>
    );
  }

  if (!url) {
    return (
      <div className="flex justify-center items-center h-64 bg-neutral-100 rounded-lg">
        <p className="text-neutral-500">Nenhum PDF para visualizar</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className || ''}`}>
      <div className="flex-grow mb-16">
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={<LoadingState />}
          error={
            <div className="flex flex-col justify-center items-center h-64 bg-neutral-100 rounded-lg">
              <p className="text-neutral-500">
                Não foi possível carregar o PDF.
              </p>
              <p className="text-sm text-neutral-400 mt-2">
                Por favor, utilize o botão de download para ver o documento.
              </p>
            </div>
          }
        >
          {!error && !loading && (
            <div key={key} className="animate-slide-fade">
              <Page
                pageNumber={pageNumber}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="rounded-lg overflow-hidden"
                width={700}
              />
            </div>
          )}

          <SelectionTooltip position={selection} onCopy={handleCopy} />
        </Document>
      </div>

      {/* Only show controls if everything loaded successfully */}
      {!loading && !error && numPages > 1 && (
        <div className="fixed bottom-8 right-5 flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-full shadow-lg z-10">
          <Button
            onClick={() => handlePageChange(Math.max(1, pageNumber - 1))}
            disabled={pageNumber <= 1}
            variant="outline"
            size="sm"
          >
            Anterior
          </Button>

          <p className="text-sm font-medium px-2">
            Página {pageNumber} de {numPages}
          </p>

          <Button
            onClick={() => handlePageChange(Math.min(numPages, pageNumber + 1))}
            disabled={pageNumber >= numPages}
            variant="outline"
            size="sm"
          >
            Seguinte
          </Button>
        </div>
      )}
    </div>
  );
};

// We'll create a separate component for our selection tooltip
const SelectionTooltip = ({
  position,
  onCopy,
}: {
  position: SelectionPosition;
  onCopy: () => void;
}) => {
  if (!position.show) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent losing selection
    e.stopPropagation(); // Prevent event bubbling
    onCopy();
  };

  return (
    <div
      className="selection-tooltip fixed z-50 bg-white rounded-lg shadow-lg px-3 py-2 transform -translate-x-1/2"
      style={{
        top: `${position.y - 45}px`,
        left: `${position.x}px`,
      }}
    >
      <button
        onClick={handleClick}
        className="flex items-center gap-2 text-sm text-neutral-700 hover:text-neutral-900"
      >
        <Copy size={14} />
        <span>Copiar</span>
      </button>
    </div>
  );
};

export default PDFViewer;
