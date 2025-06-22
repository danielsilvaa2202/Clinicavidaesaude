import { Link } from '@tanstack/react-router'
import { Card } from '@/components/ui/card'
import AuthLayout from '../auth-layout'
import { SignUpForm } from './components/sign-up-form'

export default function SignUp() {
  return (
    <AuthLayout>
      <Card className='p-6'>
        <div className='mb-2 flex flex-col space-y-2 text-left'>
          <h1 className='text-lg font-semibold tracking-tight'>
            Criar uma conta
          </h1>
          <p className='text-sm text-muted-foreground'>
            Insira suas informações abaixo para criar uma conta. <br />
            Já possui uma conta?{' '}
            <Link
              to='/sign-in'
              className='underline underline-offset-4 hover:text-primary'
            >
              Entrar
            </Link>
          </p>
        </div>
        <SignUpForm />
        <p className='mt-4 px-8 text-center text-sm text-muted-foreground'>
          Ao criar uma conta, você concorda com nossos{' '}
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
