import type { Route } from './+types/library';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

import { datalayer } from '../datalayer';
import type { LibraryDetails } from '../services/LibraryApi';
import { useEffect, useState, useReducer } from 'react';

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const library = await datalayer.libraryApi.getLibraryByName(params.libraryId);
  if (!library) {
    throw new Response('Not Found', { status: 404 });
  }
  const libraryData = await datalayer.libraryApi.getLibraryDetails(library.key);
  return { libraryData };
}

export default function Library({ loaderData }: Route.ComponentProps) {
  const libraryDetails: LibraryDetails[] = loaderData.libraryData;
  const [data, _setData] = useState(() => [...libraryDetails]);
  const rerender = useReducer(() => ({}), {})[1];

  const columnHelper = createColumnHelper<LibraryDetails>();

  const columns = [
    columnHelper.accessor('title', {
      header: () => 'Type',
      cell: (info) => info.getValue(),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('type', {
      header: () => 'Type',
      cell: (info) => info.renderValue(),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('year', {
      header: () => <span>Year</span>,
      footer: (info) => info.column.id,
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-2">
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          {table.getFooterGroups().map((footerGroup) => (
            <tr key={footerGroup.id}>
              {footerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.footer, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </tfoot>
      </table>
      <div className="h-4" />
      <button onClick={() => rerender()} className="border p-2">
        Rerender
      </button>
    </div>
  );
}
