import React from 'react';
import { Page, Text, View, Document, Image } from '@react-pdf/renderer';
import { DocumentData } from '@/types/document';
import { styles } from './documentStyles';

export const DirectSalesDocument: React.FC<DocumentData> = ({
  company,
  customer,
  order,
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image style={styles.logo} src="/logo.png" />
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.invoiceTitle}>Venda Direta</Text>
            <Text>
              Número {order.id} / {order.storeId}
            </Text>
            <Text>{order.date}</Text>
          </View>
        </View>

        {/* Customer Details */}
        <View style={styles.invoiceDetails}>
          <View style={styles.customerInfo}>
            <Text>Sr.(a) {customer.name}</Text>
            {customer.nif && customer.nif !== '000 000 000' && (
              <Text>NIF: {customer.nif}</Text>
            )}
            {customer.email && <Text>Email: {customer.email}</Text>}
            {customer.phone && <Text>Tel: {customer.phone}</Text>}
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.tableHeader}>
          <Text style={styles.refColumn}>Ref.</Text>
          <Text style={styles.descriptionColumn}>Designação</Text>
          <Text style={styles.quantityColumn}>Quantidade</Text>
          <Text style={styles.unitPriceColumn}>Preço Unitário</Text>
          <Text style={styles.totalColumn}>Total</Text>
        </View>

        {/* Table Rows */}
        {order.items.map((item, index) => {
          // Narrow the type just like in the first component
          const unitPrice =
            typeof item.unitPrice === 'string'
              ? parseFloat(item.unitPrice.replace(',', '.'))
              : item.unitPrice;

          const itemTotal = (item.quantity * unitPrice).toFixed(2);

          return (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.refColumn}>{item.ref}</Text>
              <Text style={styles.descriptionColumn}>{item.description}</Text>
              <Text style={styles.quantityColumn}>{item.quantity}</Text>
              <Text style={styles.unitPriceColumn}>
                €{unitPrice.toFixed(2)}
              </Text>
              <Text style={styles.totalColumn}>€{itemTotal}</Text>
            </View>
          );
        })}

        {/* Total Section */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.vatText}>
              IVA incluido à taxa em vigor ({order.vat})
            </Text>
            <View style={styles.quantityColumn} />
            <Text style={[styles.unitPriceColumn, { fontWeight: 700 }]}>
              Total:
            </Text>
            <Text style={[styles.totalColumn, { fontWeight: 700 }]}>
              €{order.totalAmount.toFixed(2)}
            </Text>
          </View>
        </View>

        {order.notes && (
          <View style={styles.moreDetailsNotes}>
            <Text style={styles.deliveryAddressTitle}>Notas</Text>
            {(() => {
              let noteNumber = 0;
              return (
                <>
                  {order.notes && (
                    <Text>{`${++noteNumber}. ${order.notes}`}</Text>
                  )}
                </>
              );
            })()}
          </View>
        )}

        {/* Footer */}
        <View
          fixed
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}
        >
          <Text style={styles.footer}>Obrigado por confiar na Octosólido.</Text>
          <Text style={styles.footerCompanyInfo}>
            {`${company.designacaoSocial} | NIF: ${company.NIF}`}
          </Text>
        </View>
      </Page>
    </Document>
  );
};
