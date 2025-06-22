// src/features/tasks/components/tasks-dialogs.tsx

import { toast } from '@/hooks/use-toast'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useTasks } from '../context/tasks-context'
import { TasksImportDialog } from './tasks-import-dialog'
import { TasksMutateDrawer } from './tasks-mutate-drawer'

export function TasksDialogs() {
  const { open, setOpen, currentRow, setCurrentRow, tasks, setTasks } = useTasks()

  return (
    <>
      {/* Drawer "create" */}
      <TasksMutateDrawer
        key='task-create'
        open={open === 'create'}
        // Se v = false => clique em Cancelar, setOpen(null)
        onOpenChange={(v) => {
          if (!v) setOpen(null)
        }}
      />

      {/* Diálogo de importação */}
      <TasksImportDialog
        key='tasks-import'
        open={open === 'import'}
        onOpenChange={(v) => {
          if (!v) setOpen(null)
        }}
      />

      {currentRow && (
        <>
          {/* Drawer "update" */}
          <TasksMutateDrawer
            key={`task-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={(v) => {
              if (!v) {
                setOpen(null)
                // Pequeno delay para limpar o 'currentRow' depois de fechar
                setTimeout(() => {
                  setCurrentRow(null)
                }, 300)
              }
            }}
            currentRow={currentRow}
          />

          {/* Confirmação de exclusão */}
          <ConfirmDialog
            key='task-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={(val) => {
              if (!val) {
                setOpen(null)
                setTimeout(() => {
                  setCurrentRow(null)
                }, 300)
              }
            }}
            handleConfirm={() => {
              // Aqui deleta a empresa do array
              setTasks(tasks.filter((t) => t.id !== currentRow.id))

              setOpen(null)
              setTimeout(() => {
                setCurrentRow(null)
              }, 300)
              toast({
                title: 'A Empresa foi deletada:',
                description: (
                  <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
                    <code className='text-white'>
                      {JSON.stringify(currentRow, null, 2)}
                    </code>
                  </pre>
                ),
              })
            }}
            className='max-w-md'
            title={`Excluir esta Empresa: ${currentRow.id} ?`}
            desc={
              <>
                Você está prestes a deletar a Empresa{' '}
                <strong>{currentRow.razaoSocial}</strong>. <br />
                Essa ação não poderá ser desfeita.
              </>
            }
            confirmText='Excluir'
          />
        </>
      )}
    </>
  )
}
