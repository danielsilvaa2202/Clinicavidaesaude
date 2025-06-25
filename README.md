<h1 align="center">
  Clínica <strong>Vida & Saúde</strong> · Sistema Web de Gestão
</h1>

<p align="center">
  Aplicação front-end que digitaliza todo o fluxo de trabalho da clínica — do agendamento da consulta ao histórico clínico — com <strong>Vite + React + TypeScript</strong> e <strong>Tailwind CSS</strong>.
</p>

<p align="center">
  Interface construída do zero com <a href="https://ui.shadcn.com"><strong>shadcn/ui</strong></a> (open-source).  
  Todos os componentes foram customizados para atender às necessidades da Clínica Vida & Saúde. 🎨
</p>

---

## ⚙️ Principais módulos

| Tela / módulo | Funcionalidades-chave |
|---------------|----------------------|
| **Agenda de Consultas** | Cadastro, edição, reagendamento, presença/ausência, detecção de conflitos de horário, exportação, envio de e-mail de lembrete e de feedback |
| **Pacientes** | CRUD completo com validação de CPF, e-mail, telefone e CEP (auto-preenchimento) |
| **Profissionais** | Cadastro de médicos, enfermeiros e outros cargos; CRM/COREN; permissões; inativar/reativar |
| **Auxiliares** | Manutenção de tabelas de apoio (especialidades, medicamentos, CID, posologias, durações) + exportação XLSX |
| **Histórico Médico** | Observações, alergias, doenças pessoais / familiares, prescrições e medicamentos por consulta |

---

## 🛠️ Tecnologias

- **Vite** (front-end bundler)  
- **React 18** + **TypeScript**  
- **Tailwind CSS**  
- **shadcn/ui** (componentes acessíveis e personalizáveis)  
- **SheetJS (XLSX)** para exportação de dados  

---

## 👥 Equipe · Trabalho de Conclusão de Curso

- Ana Clara de S. C. Lopes  
- Daniel Alves Silva  
- Jayana Emine Barbosa Manoel  
- Kailane Del Conti Cassiolato  
- Ketlyn Kassiane de Jesus Canal  
- Lidielly Alcantara Jacinto  
- Renata Boppre Scharf  

---

## 🚀 Instalação rápida

```bash
# escolha seu gerenciador de pacotes
pnpm install          # ou: npm install --legacy-peer-deps
pnpm dev              # ou: npm run dev
