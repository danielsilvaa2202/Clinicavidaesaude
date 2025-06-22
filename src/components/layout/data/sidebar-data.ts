// sidebar-data.ts

import {
  IconDashboard,
  IconReport,
  IconCalculator,
  IconSettings,
} from '@tabler/icons-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Admin',
    email: 'admin@vidaesaude.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [],
  navGroups: [
    {
      title: 'Inicial Dashboard',
      items: [
        {
          title: 'Dashboard Inicial',
          icon: IconDashboard,
          url: '/dashboard_inicial',
        },
      ],
    },
    {
      title: 'Módulos',
      items: [
        {
          title: 'Consultas',
          icon: IconReport,
          items: [
            {
              title: 'Gestão de Consultas',
              url: '/consultasgestao',
            },
            {
              title: 'Consulta',
              url: '/consultasmedico',
            },
          ],
        },
        {
          title: 'Pacientes',
          icon: IconCalculator,
          items: [
            {
              title: 'Gestão',
              url: '/pacientes',
            },
          ],
        },
        {
          title: 'Admin',
          icon: IconSettings,
          items: [
            {
              title: 'Gestão Profissionais',
              url: '/profissionais',
            },
            {
              title: 'Gestão Módulos',
              url: '/auxiliares_admin',
            },
          ],
        },
      ],
    },
  ],
}
