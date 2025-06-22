import { createFileRoute } from '@tanstack/react-router'
import DashboardPage from '@/features/apps/dashboard_inicial'

export const Route = createFileRoute('/_authenticated/')({
  component: DashboardPage,
})
