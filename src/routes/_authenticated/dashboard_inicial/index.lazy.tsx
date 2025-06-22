import DashboardPage from '@/features/apps/dashboard_inicial'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/dashboard_inicial/')({
  component: DashboardPage
})


