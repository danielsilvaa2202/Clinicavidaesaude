// src/features/tasks/data/schema.ts

import { z } from 'zod'

// Armazena em cnpj apenas dígitos (ex: '12345678000199')
export const taskSchema = z.object({
  id: z.number(),
  codigoSistemaContabil: z.string(),
  cnpj: z.string(), // somente dígitos internamente
  razaoSocial: z.string(),
  regimeTributario: z.string(),
  cnpjResponsavelEntrega: z.string(),
})

export type Task = z.infer<typeof taskSchema>
