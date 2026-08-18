'use client';

import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Search, Edit2, Trash2 } from 'lucide-react';

const columnHelper = createColumnHelper();

const CATEGORY_BADGE = {
  Handicrafts: 'badge-amber',
  'Organic Produce': 'badge-green',
  'Processed Food': 'badge-blue',
  Textiles: 'badge-purple',
  Other: 'badge-gray',
};

/**
 * ProductBatchTable
 * TanStack Table for SHG leader's product batch management.
 *
 * @param {Array} data - Product batch array
 * @param {function} onEdit - Edit callback
 * @param {function} onDelete - Delete/deactivate callback
 */
export default function ProductBatchTable({ data = [], onEdit, onDelete }) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = [
    columnHelper.accessor('productName', {
      header: 'Product',
      cell: (info) => (
        <div>
          <p className="font-medium text-brand-green-100 text-sm">{info.getValue()}</p>
          <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">
            {info.row.original.description}
          </p>
        </div>
      ),
    }),
    columnHelper.accessor('category', {
      header: 'Category',
      cell: (info) => (
        <span className={CATEGORY_BADGE[info.getValue()] || 'badge-gray'}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('unitPrice', {
      header: 'Price/Unit',
      cell: (info) => (
        <span className="font-semibold text-brand-amber-400">
          ₹{info.getValue()}/{info.row.original.unit}
        </span>
      ),
    }),
    columnHelper.accessor('moq', {
      header: 'MOQ',
      cell: (info) => (
        <span className="text-sm text-gray-300">
          {info.getValue()} {info.row.original.unit}
        </span>
      ),
    }),
    columnHelper.accessor('currentStock', {
      header: 'Stock',
      cell: (info) => {
        const stock = info.getValue();
        const moq = info.row.original.moq;
        const isLow = stock < moq * 1.5;
        return (
          <span className={`text-sm font-medium ${isLow ? 'text-red-400' : 'text-brand-green-300'}`}>
            {stock} {info.row.original.unit}
            {isLow && <span className="text-[10px] text-red-500 ml-1">(Low)</span>}
          </span>
        );
      },
    }),
    columnHelper.accessor('leadTimeDays', {
      header: 'Lead Time',
      cell: (info) => <span className="text-sm text-gray-400">{info.getValue()} days</span>,
    }),
    columnHelper.accessor('isActive', {
      header: 'Status',
      cell: (info) => (
        <span className={info.getValue() ? 'badge-green' : 'badge-red'}>
          {info.getValue() ? 'Active' : 'Inactive'}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit?.(row.original)}
            className="p-1.5 rounded-lg bg-surface-700/60 hover:bg-surface-600 text-gray-400 hover:text-brand-green-300 transition-colors"
            title="Edit batch"
            aria-label={`Edit ${row.original.productName}`}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete?.(row.original._id)}
            className="p-1.5 rounded-lg bg-surface-700/60 hover:bg-red-900/30 text-gray-400 hover:text-red-400 transition-colors"
            title="Deactivate batch"
            aria-label={`Delete ${row.original.productName}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="glass-card overflow-hidden">
      {/* ─── Toolbar ──────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-brand-green-900/20 flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search products..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="input-field pl-9 py-2 text-xs"
            id="product-table-search"
          />
        </div>
        <p className="text-xs text-gray-500 ml-auto">
          {table.getFilteredRowModel().rows.length} products
        </p>
      </div>

      {/* ─── Table ────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="table-header">
            <tr>
              {table.getHeaderGroups()[0].headers.map((header) => (
                <th
                  key={header.id}
                  className="table-head-cell cursor-pointer select-none"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center gap-1">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      <span className="text-gray-600">
                        {header.column.getIsSorted() === 'asc' ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : header.column.getIsSorted() === 'desc' ? (
                          <ArrowDown className="w-3 h-3" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-gray-500 text-sm">
                  No products found. Add your first product batch!
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="table-row">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="table-cell">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ─── Pagination ───────────────────────────────────── */}
      <div className="px-4 py-3 border-t border-brand-green-900/20 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1.5 rounded-lg bg-surface-700/60 disabled:opacity-30 hover:bg-surface-600 text-gray-400 transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1.5 rounded-lg bg-surface-700/60 disabled:opacity-30 hover:bg-surface-600 text-gray-400 transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
