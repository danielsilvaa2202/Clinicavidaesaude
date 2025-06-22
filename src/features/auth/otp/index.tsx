import { Card } from '@/components/ui/card'
import AuthLayout from '../auth-layout'
import { OtpForm } from './components/otp-form'

export default function Otp() {
  return (
    <AuthLayout>
      <Card className="p-6">
        <div className="mb-2 flex flex-col space-y-2 text-left">
          <h1 className="text-md font-semibold tracking-tight">
            Redefinir Senha
          </h1>
          <p className="text-sm text-muted-foreground">
            Defina sua nova senha abaixo.
          </p>
        </div>
        <OtpForm />
      </Card>
    </AuthLayout>
  )
}
