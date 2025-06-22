import { Card } from '@/components/ui/card'
import AuthLayout from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

export default function SignIn() {
  return (
    <AuthLayout>
      <Card className='p-6'>
        <div className='flex flex-col space-y-2 text-left'>
          <h1 className='text-2xl font-semibold tracking-tight'>Entrar</h1>
          <p className='text-sm text-muted-foreground'>
            Insira seu e-mail e senha abaixo <br />
          </p>
        </div>
        <UserAuthForm />
        <p className='mt-4 px-8 text-center text-sm text-muted-foreground'>
          Ao clicar em entrar, você concorda com nossos{' '}
          <a
            href='/terms'
            className='underline underline-offset-4 hover:text-primary'
          >
            Termos de Serviço
          </a>{' '}
          e{' '}
          <a
            href='/privacy'
            className='underline underline-offset-4 hover:text-primary'
          >
            Política de Privacidade
          </a>
          .
        </p>
      </Card>
    </AuthLayout>
  )
}
