// src/features/tasks/components/tasks-import-dialog.tsx

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useTasks } from '../context/tasks-context'

// Ajustado para aceitar xlsx
const formSchema = z.object({
  file: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, {
      message: 'Por favor, selecione um arquivo',
    })
    .refine(
      (files) =>
        ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(
          files?.[0]?.type
        ),
      'O arquivo deve ser do tipo Excel (.xlsx)'
    ),
})

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TasksImportDialog({ open, onOpenChange }: Props) {
  // Caso queira usar tasks e setTasks para realmente inserir empresas
  const { tasks: _tasks, setTasks: _setTasks } = useTasks()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { file: undefined },
  })

  const fileRef = form.register('file')

  const onSubmit = async () => {
    const file = form.getValues('file')

    if (file && file[0]) {
      // Exemplo: apenas exibe toast com detalhes do arquivo
      const fileDetails = {
        name: file[0].name,
        size: file[0].size,
        type: file[0].type,
      }
      toast({
        title: 'Você importou o arquivo:',
        description: (
          <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
            <code className='text-white'>
              {JSON.stringify(fileDetails, null, 2)}
            </code>
          </pre>
        ),
      })

      // Se quiser criar empresas de fato:
      // parse o Excel e chame `_setTasks([..._tasks, ...novasEmpresas])`.
    }

    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val)
        form.reset()
      }}
    >
      <DialogContent className='sm:max-w-sm gap-2'>
        <DialogHeader className='text-left'>
          <DialogTitle>Importar</DialogTitle>
          <DialogDescription>
            Importar empresas de uma planilha Excel (.xlsx).
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id='task-import-form' onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name='file'
              render={() => (
                <FormItem className='space-y-1 mb-2'>
                  <FormLabel>Arquivo Excel</FormLabel>
                  <FormControl>
                    <Input type='file' {...fileRef} className='h-8' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter className='gap-2 sm:gap-0'>
          <DialogClose asChild>
            <Button variant='outline' size='sm'>
              Fechar
            </Button>
          </DialogClose>
          <Button type='submit' form='task-import-form' size='sm'>
            Importar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
