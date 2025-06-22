// src/features/tasks/components/tasks-mutate-drawer.tsx

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Task } from '../data/schema'
import { useTasks } from '../context/tasks-context'
import { unmaskCnpj } from '../utils/cnpj'

const formSchema = z.object({
  codigoSistemaContabil: z.string().min(1, 'Código é obrigatório.'),
  cnpj: z.string().min(1, 'CNPJ é obrigatório.'),
  razaoSocial: z.string().min(1, 'Razão Social é obrigatória.'),
  regimeTributario: z.string().min(1, 'Regime Tributário é obrigatório.'),
  cnpjResponsavelEntrega: z.string().min(1, 'CNPJ do responsável é obrigatório.'),
})

type TasksForm = z.infer<typeof formSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Task
}

export function TasksMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const { tasks, setTasks } = useTasks()

  const isUpdate = !!currentRow

  // Se for edição, carrega os campos do currentRow
  // Observação: o "cnpj" e "cnpjResponsavelEntrega" armazenado está sem máscara
  // mas aqui no form podemos mostrar com ou sem máscara. Vou deixar sem máscara,
  // e o user pode digitar como quiser, no onSubmit a gente unmask de novo.
  const form = useForm<TasksForm>({
    resolver: zodResolver(formSchema),
    defaultValues: currentRow
      ? {
          codigoSistemaContabil: currentRow.codigoSistemaContabil,
          cnpj: currentRow.cnpj, // já está sem máscara
          razaoSocial: currentRow.razaoSocial,
          regimeTributario: currentRow.regimeTributario,
          cnpjResponsavelEntrega: currentRow.cnpjResponsavelEntrega,
        }
      : {
          codigoSistemaContabil: '',
          cnpj: '',
          razaoSocial: '',
          regimeTributario: '',
          cnpjResponsavelEntrega: '',
        },
  })

  function onSubmit(data: TasksForm) {
    // Remove máscaras, deixando só dígitos
    const cnpjLimpo = unmaskCnpj(data.cnpj)
    const cnpjRespLimpo = unmaskCnpj(data.cnpjResponsavelEntrega)

    if (isUpdate && currentRow) {
      // EDITAR
      const updated = tasks.map((t) =>
        t.id === currentRow.id
          ? {
              ...t,
              ...data,
              // substitui CNPJ e cnpjResponsavelEntrega sem máscara
              cnpj: cnpjLimpo,
              cnpjResponsavelEntrega: cnpjRespLimpo,
              id: currentRow.id,
            }
          : t
      )
      setTasks(updated)
    } else {
      // CRIAR
      // gera novo ID
      const newId = tasks.length
        ? Math.max(...tasks.map((t) => t.id)) + 1
        : 1
      const newEmpresa: Task = {
        id: newId,
        codigoSistemaContabil: data.codigoSistemaContabil,
        cnpj: cnpjLimpo,
        razaoSocial: data.razaoSocial,
        regimeTributario: data.regimeTributario,
        cnpjResponsavelEntrega: cnpjRespLimpo,
      }
      setTasks((prev) => [...prev, newEmpresa])
    }

    onOpenChange(false)
    form.reset()

    toast({
      title: 'Empresa salva com sucesso:',
      description: (
        <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
          <code className='text-white'>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) {
          // se fechou, limpamos o form
          form.reset(
            currentRow ?? {
              codigoSistemaContabil: '',
              cnpj: '',
              razaoSocial: '',
              regimeTributario: '',
              cnpjResponsavelEntrega: '',
            }
          )
        }
      }}
    >
      <SheetContent className='flex flex-col'>
        <SheetHeader className='text-left'>
          <SheetTitle>{isUpdate ? 'Editar' : 'Cadastrar'} Empresa</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Edite as informações da empresa.'
              : 'Adicione as informações necessárias da empresa.'}
            Clique em salvar após concluir.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id='tasks-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-5 flex-1'
          >
            <FormField
              control={form.control}
              name='codigoSistemaContabil'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Código Sistema Contábil</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Ex: 1822' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='cnpj'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>CNPJ</FormLabel>
                  <FormControl>
                    {/* Pode digitar com ou sem máscara. Ao salvar, removemos tudo que não é dígito */}
                    <Input {...field} placeholder='00.000.000/0001-00 ou 00000000000100' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='razaoSocial'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Razão Social</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Nome da Empresa' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='regimeTributario'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Regime Tributário</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Ex: Lucro Presumido, MEI, etc.' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='cnpjResponsavelEntrega'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>CNPJ Responsável / Procurador</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='00.000.000/0001-00 ou 00000000000100' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>Cancelar</Button>
          </SheetClose>
          <Button form='tasks-form' type='submit'>
            Salvar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
