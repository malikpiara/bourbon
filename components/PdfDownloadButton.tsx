'use client';

import { BlobProvider } from '@react-pdf/renderer';
import { OrderDocument } from '@/components/documents/OrderDocument';
import React from 'react';
import { mockData } from '@/lib/mocks/mockData';

export const PdfDownloadButton = () => {
  return (
    <BlobProvider document={<OrderDocument {...mockData} />}>
      {({ loading, url }) => {
        if (loading) {
          return <button>Loading...</button>;
        }

        return (
          <a
            href={url || ''}
            download="encomenda.pdf"
            className="download-button"
          >
            <button>Download PDF</button>
          </a>
        );
      }}
    </BlobProvider>
  );
};
