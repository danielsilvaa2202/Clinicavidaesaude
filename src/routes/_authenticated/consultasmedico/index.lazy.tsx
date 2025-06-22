import ConsultaMedicoPage from '@/features/apps/consultasmedico'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/consultasmedico/')({
  component: ConsultaMedicoPage
})
