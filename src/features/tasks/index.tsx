"use client";

import React, {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";

// ========================
// IMPORTS DOS COMPONENTES DE UI
// ========================
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
  CaretSortIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  DotsHorizontalIcon,
  Cross2Icon,
  PlusIcon,
  UploadIcon,
} from "@radix-ui/react-icons";

import { IconTrash } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

// ========================
// IMPORTS PARA TABS E LAYOUT
// ========================
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Header } from "@/components/layout/header";
import { TopNav } from "@/components/layout/top-nav";
import { ProfileDropdown } from "@/components/profile-dropdown";

// ========================
// UTILITÁRIOS
// ========================
export function unmaskCnpj(cnpj: string): string {
  return cnpj.replace(/\D/g, "");
}

export function formatCnpj(cnpj: string): string {
  const unmasked = unmaskCnpj(cnpj);
  if (unmasked.length === 14) {
    return unmasked.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      "$1.$2.$3/$4-$5"
    );
  }
  return cnpj;
}

// Formata datas do tipo "YYYY-MM-DD" para "DD/MM/YYYY"
function formatDateBR(dateString: string): string {
  if (!dateString.includes("-")) return dateString;
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

// ========================
// SCHEMA PARA IMPORTAÇÃO DE ARQUIVOS (usado inicialmente para planilhas Excel)
// (Para Empresas - caso precise)
const importSchema = z.object({
  file: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, {
      message: "Por favor, selecione um arquivo",
    })
    .refine(
      (files) =>
        ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"].includes(
          files?.[0]?.type
        ),
      "O arquivo deve ser do tipo Excel (.xlsx)"
    ),
});

// ========================
// 1) CONTEXTO E LÓGICA PARA EMPRESAS (Tasks)
// ========================
export const taskSchema = z.object({
  id: z.number(),
  codigoSistemaContabil: z.string(),
  cnpj: z.string(),
  razaoSocial: z.string(),
  regimeTributario: z.string(),
  cnpjResponsavelEntrega: z.string(),
});
export type Task = z.infer<typeof taskSchema>;

type DialogType = "create" | "update" | "delete" | "import" | null;

interface TasksContextProps {
  open: DialogType;
  setOpen: (dialogType: DialogType | null) => void;
  currentRow: Task | null;
  setCurrentRow: (row: Task | null) => void;
  tasks: Task[];
  setTasks: Dispatch<SetStateAction<Task[]>>;
}

const TasksContext = createContext<TasksContextProps>({} as TasksContextProps);

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<DialogType>(null);
  const [currentRow, setCurrentRow] = useState<Task | null>(null);

  // OBS: CNPJ Responsável de entrega fixo para todos: "11111111000155"
  // Foram adicionadas 2 empresas extras (total 6).
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      codigoSistemaContabil: "101",
      cnpj: "12345678000199",
      razaoSocial: "Google LLC",
      regimeTributario: "Lucro Real",
      cnpjResponsavelEntrega: "11111111000155",
    },
    {
      id: 2,
      codigoSistemaContabil: "1902",
      cnpj: "23456789000110",
      razaoSocial: "Apple Inc.",
      regimeTributario: "Lucro Presumido",
      cnpjResponsavelEntrega: "11111111000155",
    },
    {
      id: 3,
      codigoSistemaContabil: "2896",
      cnpj: "34567890000122",
      razaoSocial: "Microsoft Corporation",
      regimeTributario: "Lucro Real",
      cnpjResponsavelEntrega: "11111111000155",
    },
    {
      id: 4,
      codigoSistemaContabil: "45",
      cnpj: "45678901000133",
      razaoSocial: "Amazon.com Inc.",
      regimeTributario: "Lucro Presumido",
      cnpjResponsavelEntrega: "11111111000155",
    },
    {
      id: 5,
      codigoSistemaContabil: "910",
      cnpj: "56789012000144",
      razaoSocial: "Netflix Inc.",
      regimeTributario: "Lucro Real",
      cnpjResponsavelEntrega: "11111111000155",
    },
    {
      id: 6,
      codigoSistemaContabil: "2023",
      cnpj: "67890123000155",
      razaoSocial: "Tesla, Inc.",
      regimeTributario: "Lucro Presumido",
      cnpjResponsavelEntrega: "11111111000155",
    },
  ]);

  return (
    <TasksContext.Provider
      value={{ open, setOpen, currentRow, setCurrentRow, tasks, setTasks }}
    >
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  return useContext(TasksContext);
}

const tasksFormSchema = z.object({
  codigoSistemaContabil: z.string().min(1, "Código é obrigatório."),
  cnpj: z.string().min(1, "CNPJ é obrigatório."),
  razaoSocial: z.string().min(1, "Razão Social é obrigatória."),
  regimeTributario: z.string().min(1, "Regime Tributário é obrigatório."),
  cnpjResponsavelEntrega: z.string().min(1, "CNPJ do responsável é obrigatório."),
});
type TasksForm = z.infer<typeof tasksFormSchema>;

// Drawer para criar/editar Empresas
export function TasksMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: Task;
}) {
  const { tasks, setTasks } = useTasks();
  const isUpdate = !!currentRow;
  const form = useForm<TasksForm>({
    resolver: zodResolver(tasksFormSchema),
    defaultValues: currentRow
      ? {
          codigoSistemaContabil: currentRow.codigoSistemaContabil,
          cnpj: currentRow.cnpj,
          razaoSocial: currentRow.razaoSocial,
          regimeTributario: currentRow.regimeTributario,
          cnpjResponsavelEntrega: currentRow.cnpjResponsavelEntrega,
        }
      : {
          codigoSistemaContabil: "",
          cnpj: "",
          razaoSocial: "",
          regimeTributario: "",
          cnpjResponsavelEntrega: "11111111000155",
        },
  });

  function onSubmit(data: TasksForm) {
    const cnpjLimpo = unmaskCnpj(data.cnpj);
    const cnpjRespLimpo = unmaskCnpj(data.cnpjResponsavelEntrega);

    if (isUpdate && currentRow) {
      const updated = tasks.map((t) =>
        t.id === currentRow.id
          ? {
              ...t,
              ...data,
              cnpj: cnpjLimpo,
              cnpjResponsavelEntrega: cnpjRespLimpo,
              id: currentRow.id,
            }
          : t
      );
      setTasks(updated);
    } else {
      const newId = tasks.length ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
      const newEmpresa: Task = {
        id: newId,
        codigoSistemaContabil: data.codigoSistemaContabil,
        cnpj: cnpjLimpo,
        razaoSocial: data.razaoSocial,
        regimeTributario: data.regimeTributario,
        cnpjResponsavelEntrega: cnpjRespLimpo,
      };
      setTasks((prev) => [...prev, newEmpresa]);
    }
    onOpenChange(false);
    form.reset();
    toast({ title: "Empresa salva com sucesso!" });
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) {
          form.reset(
            currentRow ?? {
              codigoSistemaContabil: "",
              cnpj: "",
              razaoSocial: "",
              regimeTributario: "",
              cnpjResponsavelEntrega: "11111111000155",
            }
          );
        }
      }}
    >
      <SheetContent className="flex flex-col">
        <SheetHeader className="text-left">
          <SheetTitle>{isUpdate ? "Editar" : "Cadastrar"} Empresa</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? "Edite as informações da empresa."
              : "Adicione as informações necessárias da empresa."}{" "}
            Clique em salvar após concluir.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id="tasks-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 flex-1"
          >
            <FormField
              control={form.control}
              name="codigoSistemaContabil"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Código Sistema Contábil</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: 1822" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cnpj"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>CNPJ</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="00.000.000/0001-00 ou 00000000000100"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="razaoSocial"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Razão Social</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nome da Empresa" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="regimeTributario"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Regime Tributário</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex: Lucro Presumido, MEI, etc."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cnpjResponsavelEntrega"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>CNPJ Responsável / Procurador</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="00.000.000/0001-00 ou 00000000000100"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <SheetFooter className="gap-2">
          <SheetClose asChild>
            <Button variant="outline">Cancelar</Button>
          </SheetClose>
          <Button form="tasks-form" type="submit">
            Salvar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// Import Dialog para planilhas Excel (empresas) - caso precise
export function TasksImportDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const form = useForm<z.infer<typeof importSchema>>({
    resolver: zodResolver(importSchema),
    defaultValues: { file: undefined },
  });
  const fileRef = form.register("file");

  const onSubmit = async () => {
    const file = form.getValues("file");
    if (file && file[0]) {
      const fileDetails = {
        name: file[0].name,
        size: file[0].size,
        type: file[0].type,
      };
      toast({
        title: "Você importou o arquivo!",
        description: `Arquivo: ${fileDetails.name}`,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        form.reset();
      }}
    >
      <DialogContent className="sm:max-w-sm gap-2">
        <DialogHeader className="text-left">
          <DialogTitle>Importar</DialogTitle>
          <DialogDescription>
            Importar empresas de uma planilha Excel (.xlsx).
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id="task-import-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="file"
              render={() => (
                <FormItem className="space-y-1 mb-2">
                  <FormLabel>Arquivo Excel</FormLabel>
                  <FormControl>
                    <Input type="file" {...fileRef} className="h-8" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline" size="sm">
              Fechar
            </Button>
          </DialogClose>
          <Button type="submit" form="task-import-form" size="sm">
            Importar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Dialog genérico de confirmação
function ConfirmDialog({
  open,
  onOpenChange,
  handleConfirm,
  title,
  desc,
  confirmText,
  destructive,
}: {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  handleConfirm: () => void;
  title: React.ReactNode;
  desc?: React.ReactNode;
  confirmText?: string;
  destructive?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {desc && <DialogDescription>{desc}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={handleConfirm}
          >
            {confirmText || "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Junta todos os Dialogs usados na aba de Empresas (criar/editar/excluir/importar)
export function TasksDialogs() {
  const { open, setOpen, currentRow, setCurrentRow, tasks, setTasks } = useTasks();
  return (
    <>
      <TasksMutateDrawer
        key="task-create"
        open={open === "create"}
        onOpenChange={(v) => {
          if (!v) setOpen(null);
        }}
      />
      <TasksImportDialog
        key="tasks-import"
        open={open === "import"}
        onOpenChange={(v) => {
          if (!v) setOpen(null);
        }}
      />
      {currentRow && (
        <>
          <TasksMutateDrawer
            key={`task-update-${currentRow.id}`}
            open={open === "update"}
            onOpenChange={(v) => {
              if (!v) {
                setOpen(null);
                setTimeout(() => {
                  setCurrentRow(null);
                }, 300);
              }
            }}
            currentRow={currentRow}
          />
          <ConfirmDialog
            key="task-delete"
            destructive
            open={open === "delete"}
            onOpenChange={(val) => {
              if (!val) {
                setOpen(null);
                setTimeout(() => {
                  setCurrentRow(null);
                }, 300);
              }
            }}
            handleConfirm={() => {
              setTasks(tasks.filter((t) => t.id !== currentRow.id));
              setOpen(null);
              setTimeout(() => {
                setCurrentRow(null);
              }, 300);
              toast({ title: "Empresa deletada com sucesso!" });
            }}
            title={`Excluir esta Empresa?`}
            desc={
              <>
                Você está prestes a deletar a empresa{" "}
                <strong>{currentRow.razaoSocial}</strong>. <br />
                Essa ação não poderá ser desfeita.
              </>
            }
            confirmText="Excluir"
          />
        </>
      )}
    </>
  );
}

// -------------------------------
// DataTable e Componentes Auxiliares
// -------------------------------
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Row,
  Table as TanStackTable,
} from "@tanstack/react-table";

interface DataTablePaginationProps<TData> {
  table: TanStackTable<TData>;
}
export function DataTablePagination<TData extends object>({
  table,
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-center justify-between overflow-auto px-2">
      <div className="hidden flex-1 text-sm text-muted-foreground sm:block">
        {table.getFilteredSelectedRowModel().rows.length} de{" "}
        {table.getFilteredRowModel().rows.length} linha(s) selecionada(s).
      </div>
      <div className="flex items-center sm:space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="hidden text-sm font-medium sm:block">Itens por página</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Página {table.getState().pagination.pageIndex + 1} de{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Primeira página</span>
            <DoubleArrowLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Página anterior</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Próxima página</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Última página</span>
            <DoubleArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface DataTableToolbarProps<TData> {
  table: TanStackTable<TData>;
  actions?: React.ReactNode;
}
export function DataTableToolbar<TData extends object>({
  table,
  actions,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
        <Input
          placeholder="Pesquisar por Razão Social..."
          value={(table.getColumn("razaoSocial")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("razaoSocial")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[250px]"
        />
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Limpar Filtros
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      {actions && <div className="flex items-center">{actions}</div>}
    </div>
  );
}

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}
export function DataTableRowActions<TData extends object>({
  row,
}: DataTableRowActionsProps<TData>) {
  // Verifica se é empresa ou certificado examinando propriedades
  const rowData = row.original as any;
  const { setOpen, setCurrentRow } = useTasks();
  const certContext = useCertificates();

  // Se tiver "codigoSistemaContabil", então é Empresa (Tasks)
  const isEmpresa = typeof rowData.codigoSistemaContabil !== "undefined";

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {isEmpresa ? (
          <>
            <DropdownMenuItem
              onClick={() => {
                setCurrentRow(rowData);
                setOpen("update");
              }}
            >
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setCurrentRow(rowData);
                setOpen("delete");
              }}
            >
              Apagar
              <DropdownMenuShortcut>
                <IconTrash size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </>
        ) : (
          // Certificado
          <DropdownMenuItem
            onClick={() => {
              certContext.setCurrentRow(rowData);
              certContext.setOpen("delete");
            }}
          >
            Apagar
            <DropdownMenuShortcut>
              <IconTrash size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: import("@tanstack/react-table").Column<TData, TValue>;
  title: string;
}
export function DataTableColumnHeader<TData extends object, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 data-[state=open]:bg-accent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <span>{title}</span>
        {column.getIsSorted() === "desc" ? (
          <ArrowDownIcon className="ml-2 h-4 w-4" />
        ) : column.getIsSorted() === "asc" ? (
          <ArrowUpIcon className="ml-2 h-4 w-4" />
        ) : (
          <CaretSortIcon className="ml-2 h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  toolbarActions?: React.ReactNode;
}
export function DataTable<TData extends object, TValue>({
  columns,
  data,
  toolbarActions,
}: DataTableProps<TData, TValue>) {
  // Se removermos seleção de linha, podemos setar rowSelection = {}
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: false, // <--- Desabilita a seleção de linha (checkbox)
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} actions={toolbarActions} />
      <div className="rounded-md border overflow-auto max-h-[500px]">
        <Table className="min-w-full font-sans text-sm">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-gray-200 sticky top-0 z-10"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-gray-50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Sem resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableCaption className="text-sm text-gray-500">
            {table.getRowModel().rows.length} resultado(s).
          </TableCaption>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}

// ========================
// 2.1) COLUNAS E BOTÕES PARA EMPRESAS
// ========================
export const columns: ColumnDef<Task>[] = [
  // REMOVIDOS: Checkbox e ID
  {
    accessorKey: "codigoSistemaContabil",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Código" />
    ),
    cell: ({ row }) => row.getValue("codigoSistemaContabil"),
    enableSorting: true,
  },
  {
    accessorKey: "cnpj",
    header: ({ column }) => <DataTableColumnHeader column={column} title="CNPJ" />,
    cell: ({ row }) => {
      const cnpjRaw = row.getValue("cnpj") as string;
      return formatCnpj(cnpjRaw);
    },
    enableSorting: true,
  },
  {
    accessorKey: "razaoSocial",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Razão Social" />
    ),
    cell: ({ row }) => row.getValue("razaoSocial"),
    enableSorting: true,
  },
  {
    accessorKey: "regimeTributario",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Regime Tributário" />
    ),
    cell: ({ row }) => row.getValue("regimeTributario"),
    enableSorting: true,
  },
  {
    accessorKey: "cnpjResponsavelEntrega",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="CNPJ Resp. Entrega" />
    ),
    cell: ({ row }) => {
      const cnpjResp = row.getValue("cnpjResponsavelEntrega") as string;
      return formatCnpj(cnpjResp);
    },
    enableSorting: true,
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];

export function TasksPrimaryButtons() {
  const { setOpen } = useTasks();
  return (
    <div className="flex gap-x-2">
      {/* Botão de importar Excel para empresas */}
      <Button
        onClick={() => setOpen("import")}
        size="sm"
        className="bg-[#217346] hover:bg-[#1e6f3b] text-white"
      >
        <UploadIcon className="mr-2 h-4 w-4" />
        Importar
      </Button>
      {/* Botão de nova empresa */}
      <Button onClick={() => setOpen("create")} size="sm">
        <PlusIcon className="mr-2 h-4 w-4" />
        Nova Empresa
      </Button>
    </div>
  );
}

function TasksTableWrapper() {
  const { tasks } = useTasks();
  return (
    <DataTable
      columns={columns}
      data={tasks}
      toolbarActions={<TasksPrimaryButtons />}
    />
  );
}

// ========================
// 2.2) CONTEXTO E COMPONENTES PARA CERTIFICADOS
// ========================
// Trocar "nome" para "apelido"
export const certificateSchema = z.object({
  id: z.number(),
  apelido: z.string(),
  cnpj: z.string(),
  razaoSocial: z.string(),
  validade: z.string(),
  // Status somente "Válido" ou "Vencido"
  status: z.enum(["Válido", "Vencido"]),
});
export type Certificate = z.infer<typeof certificateSchema>;

interface CertificatesContextProps {
  open: DialogType;
  setOpen: (dialogType: DialogType | null) => void;
  currentRow: Certificate | null;
  setCurrentRow: (row: Certificate | null) => void;
  certificates: Certificate[];
  setCertificates: Dispatch<SetStateAction<Certificate[]>>;
}

const CertificatesContext = createContext<CertificatesContextProps>(
  {} as CertificatesContextProps
);

export function CertificatesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState<DialogType>(null);
  const [currentRow, setCurrentRow] = useState<Certificate | null>(null);

  // Ajuste dos dados iniciais (exemplo)
  const [certificates, setCertificates] = useState<Certificate[]>([
    {
      id: 1,
      apelido: "Certificado Google",
      cnpj: "12345678000199",
      razaoSocial: "Google Brasil Internet Ltda",
      validade: "2025-12-31", // ISO
      status: "Válido",
    },
  ]);

  return (
    <CertificatesContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        certificates,
        setCertificates,
      }}
    >
      {children}
    </CertificatesContext.Provider>
  );
}

export function useCertificates() {
  return useContext(CertificatesContext);
}

// Schema para importação de certificado PFX: agora trocamos "companyName" por "password"
// Atualizamos para que o campo senha seja opcional, pois será desabilitado.
const certificateImportSchema = z.object({
  file: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, {
      message: "Por favor, selecione um arquivo",
    })
    .refine(
      (files) => files[0].name.toLowerCase().endsWith(".pfx"),
      "O arquivo deve ser do tipo PFX (.pfx)"
    ),
  password: z.string().optional(),
});

// Form para edição manual do certificado (opcional, manter ou não)
const certificateFormSchema = z.object({
  apelido: z.string().min(1, "Apelido é obrigatório."),
  cnpj: z.string().min(1, "CNPJ é obrigatório."),
  razaoSocial: z.string().min(1, "Razão Social é obrigatória."),
  validade: z.string().min(1, "Validade é obrigatória."),
  // Status somente Válido ou Vencido
  status: z.enum(["Válido", "Vencido"]),
});
type CertificateForm = z.infer<typeof certificateFormSchema>;

// Drawer para editar manualmente (se desejar habilitar)
export function CertificatesMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: Certificate;
}) {
  const { certificates, setCertificates } = useCertificates();
  const isUpdate = !!currentRow;

  const form = useForm<CertificateForm>({
    resolver: zodResolver(certificateFormSchema),
    defaultValues: currentRow
      ? {
          apelido: currentRow.apelido,
          cnpj: currentRow.cnpj,
          razaoSocial: currentRow.razaoSocial,
          validade: currentRow.validade,
          status: currentRow.status,
        }
      : {
          apelido: "",
          cnpj: "",
          razaoSocial: "",
          validade: "",
          status: "Válido",
        },
  });

  function onSubmit(data: CertificateForm) {
    const cnpjLimpo = unmaskCnpj(data.cnpj);
    if (isUpdate && currentRow) {
      const updated = certificates.map((c) =>
        c.id === currentRow.id
          ? {
              ...c,
              ...data,
              cnpj: cnpjLimpo,
              id: currentRow.id,
            }
          : c
      );
      setCertificates(updated);
    } else {
      const newId = certificates.length
        ? Math.max(...certificates.map((c) => c.id)) + 1
        : 1;
      const newCert: Certificate = {
        id: newId,
        apelido: data.apelido,
        cnpj: cnpjLimpo,
        razaoSocial: data.razaoSocial,
        validade: data.validade,
        status: data.status,
      };
      setCertificates((prev) => [...prev, newCert]);
    }
    onOpenChange(false);
    form.reset();
    toast({ title: "Certificado salvo com sucesso!" });
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) {
          form.reset(
            currentRow ?? {
              apelido: "",
              cnpj: "",
              razaoSocial: "",
              validade: "",
              status: "Válido",
            }
          );
        }
      }}
    >
      <SheetContent className="flex flex-col">
        <SheetHeader className="text-left">
          <SheetTitle>
            {isUpdate ? "Editar" : "Cadastrar"} Certificado
          </SheetTitle>
          <SheetDescription>
            {isUpdate
              ? "Edite as informações do certificado."
              : "Adicione as informações necessárias do certificado."}{" "}
            Clique em salvar após concluir.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id="certificates-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 flex-1"
          >
            <FormField
              control={form.control}
              name="apelido"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Apelido</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Apelido do Certificado" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cnpj"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>CNPJ</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="00.000.000/0001-00 ou 00000000000100"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="razaoSocial"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Razão Social</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Razão Social" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="validade"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Validade (YYYY-MM-DD)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="2025-12-31" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Select
                      {...field}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="h-8 w-[150px]">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Válido">Válido</SelectItem>
                        <SelectItem value="Vencido">Vencido</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <SheetFooter className="gap-2">
          <SheetClose asChild>
            <Button variant="outline">Cancelar</Button>
          </SheetClose>
          <Button form="certificates-form" type="submit">
            Salvar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// Import dialog para Certificados: pede arquivo .pfx e SENHA (campo senha desabilitado)
export function CertificatesImportDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { certificates, setCertificates } = useCertificates();

  const form = useForm<z.infer<typeof certificateImportSchema>>({
    resolver: zodResolver(certificateImportSchema),
    defaultValues: { file: undefined, password: "" },
  });

  const fileRef = form.register("file");

  const onSubmit = async () => {
    const { file } = form.getValues();
    if (file && file[0]) {
      const fileDetails = {
        name: file[0].name,
        size: file[0].size,
        type: file[0].type,
      };

      // Lógica de exemplo atualizada:
      // 1) Remove a extensão .pfx e recorta os espaços
      const baseName = fileDetails.name.replace(/\.pfx$/i, "").trim();
      // 2) Pega as três primeiras palavras
      const words = baseName.split(" ").filter(Boolean);
      const displayName = words.slice(0, 3).join(" ");
      // 3) Cria a Razão Social concatenando o displayName com um sufixo desejado
      const razaoSocial = `${displayName} Empresa LTDA`;

      const newId = certificates.length
        ? Math.max(...certificates.map((c) => c.id)) + 1
        : 1;

      const newCert: Certificate = {
        id: newId,
        apelido: displayName, // Apelido = as três primeiras palavras do nome do arquivo
        cnpj: "11111111000199",
        razaoSocial,
        validade: "2026-02-15",
        status: "Válido",
      };

      setCertificates([...certificates, newCert]);

      toast({
        title: "Certificado importado!",
        description: `Arquivo: ${fileDetails.name}`,
      });
    }

    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        form.reset();
      }}
    >
      <DialogContent className="sm:max-w-sm gap-2">
        <DialogHeader className="text-left">
          <DialogTitle>Importar Certificado</DialogTitle>
          <DialogDescription>Importar certificado PFX (.pfx).</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="cert-import-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-2"
          >
            <FormField
              control={form.control}
              name="file"
              render={() => (
                <FormItem className="space-y-1">
                  <FormLabel>Arquivo PFX</FormLabel>
                  <FormControl>
                    <Input type="file" {...fileRef} className="h-8" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Digite a senha do certificado"
                      disabled
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline" size="sm">
              Fechar
            </Button>
          </DialogClose>
          <Button type="submit" form="cert-import-form" size="sm">
            Importar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Dialogs para excluir (e se houvesse edição manual) na aba Certificados
export function CertificatesDialogs() {
  const {
    open,
    setOpen,
    currentRow,
    setCurrentRow,
    certificates,
    setCertificates,
  } = useCertificates();

  return (
    <>
      <CertificatesImportDialog
        key="cert-import"
        open={open === "import"}
        onOpenChange={(v) => {
          if (!v) setOpen(null);
        }}
      />
      {currentRow && open === "delete" && (
        <ConfirmDialog
          key="cert-delete"
          destructive
          open={open === "delete"}
          onOpenChange={(val) => {
            if (!val) {
              setOpen(null);
              setTimeout(() => {
                setCurrentRow(null);
              }, 300);
            }
          }}
          handleConfirm={() => {
            setCertificates(certificates.filter((c) => c.id !== currentRow.id));
            setOpen(null);
            setTimeout(() => {
              setCurrentRow(null);
            }, 300);
            toast({ title: "Certificado deletado com sucesso!" });
          }}
          title={`Excluir este Certificado?`}
          desc={
            <>
              Você está prestes a deletar o certificado{" "}
              <strong>{currentRow.apelido}</strong>. <br />
              Essa ação não poderá ser desfeita.
            </>
          }
          confirmText="Excluir"
        />
      )}
    </>
  );
}

// Definição de colunas para Certificados
export const certificateColumns: ColumnDef<Certificate>[] = [
  {
    // primeira coluna: Apelido
    accessorKey: "apelido",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Apelido" />
    ),
    cell: ({ row }) => row.getValue("apelido"),
    enableSorting: true,
  },
  {
    accessorKey: "cnpj",
    header: ({ column }) => <DataTableColumnHeader column={column} title="CNPJ" />,
    cell: ({ row }) => {
      const cnpjRaw = row.getValue("cnpj") as string;
      return formatCnpj(cnpjRaw);
    },
    enableSorting: true,
  },
  {
    accessorKey: "razaoSocial",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Razão Social" />
    ),
    cell: ({ row }) => row.getValue("razaoSocial"),
    enableSorting: true,
  },
  {
    accessorKey: "validade",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Validade" />
    ),
    cell: ({ row }) => {
      const validade = row.getValue("validade") as string;
      return formatDateBR(validade); // Exibe no formato DD/MM/YYYY
    },
    enableSorting: true,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="STATUS" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      // Ajustar estilo do Badge dependendo do status
      const statusStyles: Record<string, string> = {
        Válido: "bg-green-600 text-white",
        Vencido: "bg-red-500 text-white",
      };
      return (
        <Badge className={`${statusStyles[status]} px-2 py-1 rounded cursor-pointer`}>
          {status}
        </Badge>
      );
    },
    enableSorting: true,
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];

export function CertificatesPrimaryButtons() {
  const { setOpen } = useCertificates();
  return (
    <div className="flex gap-x-2">
      <Button
        onClick={() => setOpen("import")}
        size="sm"
        className="bg-[#217346] hover:bg-[#1e6f3b] text-white"
      >
        <UploadIcon className="mr-2 h-4 w-4" />
        Importar Certificado
      </Button>
    </div>
  );
}

function CertificatesTableWrapper() {
  const { certificates } = useCertificates();
  return (
    <DataTable
      columns={certificateColumns}
      data={certificates}
      toolbarActions={<CertificatesPrimaryButtons />}
    />
  );
}

// ========================
// PÁGINA PRINCIPAL "CadastroPage"
// ========================
const topNavLinks = [
  { title: "Processamento", href: "/processamentoDCTFWEB", isActive: false, disabled: false },
  { title: "Cadastro", href: "/cadastros", isActive: false, disabled: false },
];

export default function CadastroPage() {
  const [tabValue, setTabValue] = useState("empresas");

  return (
    <TasksProvider>
      <CertificatesProvider>
        <Header>
          <TopNav links={topNavLinks} />
          <div className="ml-auto flex items-center space-x-4">
            <ProfileDropdown />
          </div>
        </Header>
        <main className="p-4">
          <h1 className="text-2xl font-bold mb-4">Cadastros</h1>

          <Tabs
            value={tabValue}
            onValueChange={setTabValue}
            className="w-full mb-6"
          >
            <TabsList className="flex space-x-4 border-b border-gray-200 items-center">
              <TabsTrigger
                value="empresas"
                className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${
                  tabValue === "empresas"
                    ? "bg-white border-t border-l border-r border-gray-200 text-gray-900 font-bold"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Empresas
              </TabsTrigger>
              <TabsTrigger
                value="certificados"
                className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${
                  tabValue === "certificados"
                    ? "bg-white border-t border-l border-r border-gray-200 text-gray-900 font-bold"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Certificados
              </TabsTrigger>
            </TabsList>

            <TabsContent value="empresas">
              <TasksTableWrapper />
              <TasksDialogs />
            </TabsContent>
            <TabsContent value="certificados">
              <CertificatesTableWrapper />
              <CertificatesDialogs />
            </TabsContent>
          </Tabs>
        </main>
      </CertificatesProvider>
    </TasksProvider>
  );
}
