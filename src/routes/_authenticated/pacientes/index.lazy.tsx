import PacientesPage from '@/features/apps/pacientes'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute(
  '/_authenticated/pacientes/',
)({
  component: PacientesPage,
})
