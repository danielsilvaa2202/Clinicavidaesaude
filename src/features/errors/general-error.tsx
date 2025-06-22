import { useNavigate, useRouter } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface GeneralErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  minimal?: boolean
  code?: number 
}

export default function GeneralError({
  className,
  minimal = false,
  code = 500, 
}: GeneralErrorProps) {
  const navigate = useNavigate()
  const { history } = useRouter()

  // Mensagens personalizadas
  let title = code
  let subtitle = "Oops! Alguma coisa deu errado :')"
  let description = "Pedimos desculpa pela inconveniência. Tente novamente mais tarde."

  if (code === 401) {
    title = 401
    subtitle = "Não autorizado"
    description = "Você precisa fazer login para acessar essa página."
  } else if (code === 403) {
    title = 403
    subtitle = "Acesso negado"
    description = "Você não tem permissão para acessar essa página."
  } else if (code === 404) {
    title = 404
    subtitle = "Página não encontrada"
    description = "O recurso que você procurou não existe."
  }

  return (
    <div className={cn('h-svh w-full', className)}>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        {!minimal && (
          <h1 className='text-[7rem] font-bold leading-tight'>{title}</h1>
        )}
        <span className='font-medium'>{subtitle}</span>
        <p className='text-center text-muted-foreground'>{description}</p>
        {!minimal && (
          <div className='mt-6 flex gap-4'>
            <Button variant='outline' onClick={() => history.go(-1)}>
              Retornar
            </Button>
            <Button onClick={() => navigate({ to: '/' })}>Inicial</Button>
          </div>
        )}
      </div>
    </div>
  )
}
