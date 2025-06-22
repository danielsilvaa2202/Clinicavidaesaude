import EventosPage from '@/features/apps/consultasgestao'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/consultasgestao/')({
  component: EventosPage
})
