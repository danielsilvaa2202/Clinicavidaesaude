// src/features/tasks/components/columns.tsx

import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Task } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'
import { formatCnpj } from '../utils/cnpj'

export const columns: ColumnDef<Task>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
    cell: ({ row }) => <div className='w-[50px]'>{row.getValue('id')}</div>,
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'codigoSistemaContabil',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Código Sist. Contábil' />
    ),
    cell: ({ row }) => row.getValue('codigoSistemaContabil'),
    enableSorting: true,
  },
  {
    accessorKey: 'cnpj',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='CNPJ' />
    ),
    // Exibir com máscara
    cell: ({ row }) => {
      const cnpjRaw = row.getValue('cnpj') as string
      return formatCnpj(cnpjRaw)
    },
    enableSorting: true,
  },
  {
    accessorKey: 'razaoSocial',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Razão Social' />
    ),
    cell: ({ row }) => row.getValue('razaoSocial'),
    enableSorting: true,
  },
  {
    accessorKey: 'regimeTributario',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Regime Tributário' />
    ),
    cell: ({ row }) => row.getValue('regimeTributario'),
    enableSorting: true,
  },
  {
    accessorKey: 'cnpjResponsavelEntrega',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='CNPJ Resp. Entrega' />
    ),
    cell: ({ row }) => {
      const cnpjResp = row.getValue('cnpjResponsavelEntrega') as string
      return formatCnpj(cnpjResp)
    },
    enableSorting: true,
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
