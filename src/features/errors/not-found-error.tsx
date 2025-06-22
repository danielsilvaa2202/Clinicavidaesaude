import { useNavigate, useRouter } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export default function NotFoundError() {
  const navigate = useNavigate()
  const { history } = useRouter()
  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <h1 className='text-[7rem] font-bold leading-tight'>404</h1>
        <span className='font-medium'>Página não encontrada!</span>
        <p className='text-center text-muted-foreground'>
          Parece que essa página não existe ou foi removida!<br />
          Verifique e tente novamente.
        </p>
        <div className='mt-6 flex gap-4'>
          <Button variant='outline' onClick={() => history.go(-1)}>
            Retornar
          </Button>
          <Button onClick={() => navigate({ to: '/' })}>Inicial</Button>
        </div>
      </div>
    </div>
  )
}
