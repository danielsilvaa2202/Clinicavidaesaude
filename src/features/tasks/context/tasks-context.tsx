// src/features/tasks/context/tasks-context.tsx

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Task } from '../data/schema'

type DialogType = 'create' | 'update' | 'delete' | 'import' | null

interface TasksContextProps {
  open: DialogType
  setOpen: (dialogType: DialogType | null) => void

  currentRow: Task | null
  setCurrentRow: (row: Task | null) => void

  tasks: Task[]
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
}

const TasksContext = createContext<TasksContextProps>({} as TasksContextProps)

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<DialogType>(null)
  const [currentRow, setCurrentRow] = useState<Task | null>(null)
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      // Carrega do localStorage se existir
      const saved = localStorage.getItem('my-empresas')
      if (saved) {
        return JSON.parse(saved) as Task[]
      }
    } catch (error) {
      console.error('Erro ao carregar do localStorage', error)
    }
    // Se não tiver nada no localStorage, inicia com um mock
    return [
      {
        id: 1,
        codigoSistemaContabil: 'SIST-001',
        cnpj: '12345678000199', // armazenado apenas dígitos
        razaoSocial: 'Empresa Exemplo',
        regimeTributario: 'Lucro Real',
        cnpjResponsavelEntrega: '98765432000111',
      },
      {
        id: 2,
        codigoSistemaContabil: 'SIST-002',
        cnpj: '23456789000110',
        razaoSocial: 'Outra Empresa Ltda',
        regimeTributario: 'Lucro Presumido',
        cnpjResponsavelEntrega: '12000111000155',
      },
    ]
  })

  // Sempre que `tasks` mudar, salva no localStorage
  useEffect(() => {
    try {
      localStorage.setItem('my-empresas', JSON.stringify(tasks))
    } catch (error) {
      console.error('Erro ao salvar no localStorage', error)
    }
  }, [tasks])

  return (
    <TasksContext.Provider
      value={{ open, setOpen, currentRow, setCurrentRow, tasks, setTasks }}
    >
      {children}
    </TasksContext.Provider>
  )
}

export function useTasks() {
  return useContext(TasksContext)
}
