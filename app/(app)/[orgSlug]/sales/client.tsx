// Sales history client: searchable, filterable table of past sales documents.
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import {
  fetchSalesDocuments,
  type SalesDocumentRow,
} from '@/lib/supabase/queries/sales-documents';
import { formatCurrency } from '@/utils/format/currency';

const PAGE_SIZE = 20;

interface SalesHistoryClientProps {
  documents: SalesDocumentRow[];
  totalCount: number;
  currentPage: number;
  orgSlug: string;
  orgId: string;
}

export function SalesHistoryClient({
  documents: initialDocuments,
  totalCount: initialCount,
  currentPage,
  orgSlug,
  orgId,
}: SalesHistoryClientProps) {
  const router = useRouter();
  const [documents, setDocuments] =
    useState<SalesDocumentRow[]>(initialDocuments);
  const [totalCount, setTotalCount] = useState(initialCount);
  const [search, setSearch] = useState('');
  const [salesTypeFilter, setSalesTypeFilter] = useState<
    'all' | 'direct' | 'delivery'
  >('all');
  const [isSearching, setIsSearching] = useState(false);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Debounced client-side search
  const performSearch = useCallback(
    async (query: string, type: 'all' | 'direct' | 'delivery') => {
      setIsSearching(true);
      try {
        const supabase = createClient();
        const { data, count } = await fetchSalesDocuments(supabase, orgId, {
          page: 1,
          search: query || undefined,
          salesType: type === 'all' ? undefined : type,
        });
        setDocuments(data);
        setTotalCount(count);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    },
    [orgId]
  );

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search || salesTypeFilter !== 'all') {
        performSearch(search, salesTypeFilter);
      } else {
        // Reset to initial server-rendered data
        setDocuments(initialDocuments);
        setTotalCount(initialCount);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, salesTypeFilter, performSearch, initialDocuments, initialCount]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Vendas</h1>
        <Button onClick={() => router.push(`/${orgSlug}/sales/new`)}>
          Nova Venda
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Pesquisar por cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <select
          value={salesTypeFilter}
          onChange={(e) =>
            setSalesTypeFilter(e.target.value as 'all' | 'direct' | 'delivery')
          }
          className="h-11 rounded-lg border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="all">Todos os tipos</option>
          <option value="delivery">Encomendas</option>
          <option value="direct">Vendas Diretas</option>
        </select>
      </div>

      {/* Table */}
      {documents.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          {isSearching ? (
            <p>A pesquisar...</p>
          ) : search || salesTypeFilter !== 'all' ? (
            <p>Nenhum resultado encontrado.</p>
          ) : (
            <div className="space-y-2">
              <p className="text-lg font-medium">Sem documentos</p>
              <p>Crie a sua primeira venda para começar.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Encomenda</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow
                  key={doc.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => router.push(`/${orgSlug}/sales/${doc.id}/pdf`)}
                >
                  <TableCell className="font-mono text-sm">
                    {doc.order_number}
                  </TableCell>
                  <TableCell>{formatDate(doc.document_date)}</TableCell>
                  <TableCell className="font-medium">
                    {doc.customer_name}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        doc.sales_type === 'delivery'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-green-50 text-green-700'
                      }`}
                    >
                      {doc.sales_type === 'delivery'
                        ? 'Encomenda'
                        : 'Venda Direta'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(doc.total_amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/${orgSlug}/sales/${doc.id}/pdf`);
                        }}
                      >
                        Ver
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/${orgSlug}/sales/${doc.id}`);
                        }}
                      >
                        Editar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !search && salesTypeFilter === 'all' && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-500">
            Página {currentPage} de {totalPages} ({totalCount} documentos)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() =>
                router.push(`/${orgSlug}/sales?page=${currentPage - 1}`)
              }
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() =>
                router.push(`/${orgSlug}/sales?page=${currentPage + 1}`)
              }
            >
              Seguinte
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
