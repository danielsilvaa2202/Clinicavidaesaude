// src/features/tasks/components/tasks-primary-buttons.tsx

import { Button } from '@/components/ui/button'
import { useTasks } from '../context/tasks-context'
import { PlusIcon, UploadIcon } from '@radix-ui/react-icons'

export function TasksPrimaryButtons() {
  const { setOpen } = useTasks()

  return (
    <div className='flex gap-x-2'>
      <Button
        onClick={() => setOpen('import')}
        size='sm'
        className='bg-[#217346] hover:bg-[#1e6f3b] text-[hsl(0,0%,100%)]'
      >
        <UploadIcon className='mr-2 h-4 w-4 text-[hsl(0,0%,100%)]' />
        Importar
      </Button>
      <Button onClick={() => setOpen('create')} size='sm'>
        <PlusIcon className='mr-2 h-4 w-4' />
        Nova Empresa
      </Button>
    </div>
  )
}
