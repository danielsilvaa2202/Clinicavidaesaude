import AdminPage from '@/features/apps/profissionais'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute(
  '/_authenticated/profissionais/',
)({
  component: AdminPage,
})
