"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Header } from "@/components/layout/header";
import { TopNav } from "@/components/layout/top-nav";
import { ProfileDropdown } from "@/components/profile-dropdown";

interface Cargo {
  id_cargo: number;
  cargo_nome: string;
}

interface Especialidade {
  id_especialidade: number;
  espec_nome: string;
}

interface Professional {
  id_profissional: number;
  prof_nome: string;
  prof_cpf: string;
  prof_email: string;
  prof_telefone: string;
  prof_genero: string;
  prof_data_nascimento: string;
  prof_ativo: boolean;
  id_cargo: number;
  cargo_nome: string;
  crm?: string;
  id_especialidade?: number;
  coren?: string;
}

const COREN_RE = /^\d{4,7}(?:\/[A-Z]{2})?$/;
const CRM_RE = /^\d{6,7}(?:\/[A-Z]{2})?$/;
const DEFAULT_PASSWORD_MASK = "********";
const ALL_ACCESS_OPTIONS = ["consultas", "pacientes", "admin"] as const;
const CPF_RE = /^\d{11}$/;
const VALID_DDDS = [
  "11", "12", "13", "14", "15", "16", "17", "18", "19", "21", "22", "24", "27", "28",
  "31", "32", "33", "34", "35", "37", "38", "41", "42", "43", "44", "45", "46", "47",
  "48", "49", "51", "53", "54", "55", "61", "62", "64", "63", "65", "66", "67", "68",
  "69", "71", "73", "74", "75", "77", "79", "81", "82", "83", "84", "85", "86", "87",
  "88", "89", "91", "92", "93", "94", "95", "96", "97", "98", "99"
];
const EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
const REPEATED_TLD_RE = /(\.[a-z]{2,6})\1+$/i;

const normalizar = (s: string = "") =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const soDigitos = (s: string = "") => s.replace(/\D/g, "");

export const validarCPF = (c: string): boolean => {
  const cpf = c.replace(/\D/g, "");
  if (!CPF_RE.test(cpf)) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  const calc = (m: number) => {
    let s = 0;
    for (let i = 0; i < m; i++) s += +cpf[i] * (m + 1 - i);
    return ((s * 10) % 11) % 10;
  };
  return calc(9) === +cpf[9] && calc(10) === +cpf[10];
};

export const formatCPF = (v: string) =>
  v
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4")
    .slice(0, 14);

export const formatPhone = (v: string) =>
  v
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .slice(0, 15);

export const validarEmail = (v: string): boolean => {
  const email = v.trim();
  if (!email) return false;
  if (email !== email.toLowerCase() || /\s/.test(email)) return false;
  const partes = email.split("@");
  if (partes.length !== 2) return false;
  const [local, dominio] = partes;
  if (
    local.length > 64 ||
    !/^[a-z0-9](?:[a-z0-9._%+-]{0,62}[a-z0-9])?$/.test(local) ||
    /\.\./.test(local)
  )
    return false;
  const labels = dominio.split(".");
  if (
    labels.length < 2 ||
    labels.some(
      lab => lab.length < 2 || lab.length > 63 || !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(lab)
    )
  )
    return false;
  if (REPEATED_TLD_RE.test(dominio)) return false;
  return true;
};

export const validarTelefone = (v: string): boolean => {
  const nums = v.replace(/\D/g, "");
  if (!(nums.length === 10 || nums.length === 11)) return false;
  const ddd = nums.slice(0, 2);
  if (!VALID_DDDS.includes(ddd)) return false;
  const body = nums.slice(2);
  if (/^(\d)\1+$/.test(body)) return false;
  if (nums.length === 11) return nums[2] === "9";
  return /[2-8]/.test(nums[2]);
};

export const getTelefoneError = (v: string) => {
  const nums = v.replace(/\D/g, "");
  if (!nums) return "Telefone é obrigatório.";
  if (!(nums.length === 10 || nums.length === 11))
    return "Use 10 dígitos (fixo) ou 11 dígitos (móvel).";
  const ddd = nums.slice(0, 2);
  if (!VALID_DDDS.includes(ddd)) return `DDD "${ddd}" inválido.`;
  const body = nums.slice(2);
  if (/^(\d)\1+$/.test(body)) return "Não use todos os dígitos iguais.";
  if (nums.length === 11 && nums[2] !== "9")
    return 'Em celular (11 dígitos), o 3º dígito deve ser "9".';
  if (nums.length === 10 && !/[2-8]/.test(nums[2]))
    return "Em fixo (10 dígitos), o 3º dígito deve ser 2–8.";
  return "";
};

export const getSenhaError = (v: string, mode: "create" | "edit") => {
  if (mode === "create" && !v) return "Senha é obrigatória.";
  if (mode === "edit" && v === DEFAULT_PASSWORD_MASK) return "";
  if (v.length < 6) return "Mínimo 6 caracteres.";
  if (!/[A-Z]/.test(v)) return "Falta ao menos 1 letra maiúscula.";
  if (!/[a-z]/.test(v)) return "Falta ao menos 1 letra minúscula.";
  if (!/\d/.test(v)) return "Falta ao menos 1 dígito.";
  if (!/[^A-Za-z0-9]/.test(v)) return "Falta ao menos 1 caractere especial.";
  return "";
};

export default function ProfissionaisPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | "all">("active");
  const [roleFilter, setRoleFilter] = useState("");
  const [dlgOpen, setDlgOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selId, setSelId] = useState<number | null>(null);
  const [cpf, setCpf] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [fone, setFone] = useState("");
  const [data, setData] = useState("");
  const [genero, setGenero] = useState("");
  const [cargoId, setCargoId] = useState<number | "">("");
  const [crm, setCrm] = useState("");
  const [espId, setEspId] = useState<number | "">("");
  const [coren, setCoren] = useState("");
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [showPass, setShowPass] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Professional | null>(null);
  const [cargoDlgOpen, setCargoDlgOpen] = useState(false);
  const [cargoName, setCargoName] = useState("");
  const [cargoEditingId, setCargoEditingId] = useState<number | null>(null);
  const [accessDlgOpen, setAccessDlgOpen] = useState(false);
  const [selectedAccessRole, setSelectedAccessRole] = useState("");
  const [allowedAccesses, setAllowedAccesses] = useState<string[]>([]);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const load = () =>
    fetch("/api/profissionais?ativo=all")
      .then(r => r.json())
      .then(setProfessionals);

  const loadCargos = () =>
    fetch("/api/cargos")
      .then(r => r.json())
      .then(setCargos);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    loadCargos();
  }, []);

  useEffect(() => {
    fetch("/api/especialidades")
      .then(r => r.json())
      .then(setEspecialidades);
  }, []);

  const cargoNome = (id: number | "") =>
    id === "" ? "" : cargos.find(c => c.id_cargo === +id)?.cargo_nome ?? "";

  const ehMedico = cargoNome(cargoId).toLowerCase() === "médico";
  const ehEnfermeiro = cargoNome(cargoId).toLowerCase() === "enfermeiro";

  const check = (f: string, v: string) => {
    let m = "";
    const val = v.trim();

    if (["nome", "email", "fone", "crm", "coren"].includes(f)) {
      if (v !== val) {
        m = "Remova espaços no início/fim.";
        setErrs(p => ({ ...p, [f]: m }));
        return;
      }
      if (/\s{2,}/.test(v)) {
        m = "Não use espaços duplos.";
        setErrs(p => ({ ...p, [f]: m }));
        return;
      }
    }

    switch (f) {
      case "nome":
        if (!val) m = "Nome é obrigatório.";
        else {
          const parts = val.split(" ");
          if (parts.length < 2) m = "Informe nome e sobrenome.";
          else if (parts.some(p => p.length < 2)) m = "Cada parte ≥2 letras.";
          else if (!parts.every(p => /^[A-ZÀ-Ÿ][a-zà-ÿ]+$/.test(p)))
            m = "Cada parte inicia com maiúscula e só letras.";
        }
        break;

      case "email":
        if (!val) m = "E-mail é obrigatório.";
        else if (!validarEmail(val)) m = "Formato de e-mail inválido.";
        break;

      case "fone":
        m = getTelefoneError(v);
        break;

      case "senha":
        m = getSenhaError(v, mode);
        break;

      case "cpf":
        if (!val) m = "CPF é obrigatório.";
        else if (!validarCPF(val)) m = "CPF inválido.";
        break;

      case "data": {
        if (!val) m = "Data de nascimento é obrigatória.";
        else {
          const hoje = new Date();
          const nasc = new Date(val);
          if (nasc > hoje) m = "Data não pode ser futura.";
          else {
            let idade = hoje.getFullYear() - nasc.getFullYear();
            const mm = hoje.getMonth() - nasc.getMonth();
            if (mm < 0 || (mm === 0 && hoje.getDate() < nasc.getDate())) idade--;
            if (idade < 18) m = "Mínimo 18 anos.";
            else if (idade > 100) m = "Idade não pode ser >100 anos.";
          }
        }
        break;
      }

      case "crm":
        if (ehMedico) {
          if (!val) m = "CRM é obrigatório.";
          else if (!CRM_RE.test(val))
            m = "CRM inválido. Deve ter de 6 a 7 dígitos, opcionalmente seguido de /UF.";
        }
        break;

      case "coren":
        if (ehEnfermeiro) {
          if (!val) m = "COREN é obrigatório.";
          else if (!COREN_RE.test(val)) m = "COREN inválido.";
        }
        break;
    }
    setErrs(p => ({ ...p, [f]: m }));
  };

  const h =
    (f: string, set: (v: string) => void, fmt?: (v: string) => string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const v = fmt ? fmt(e.target.value) : e.target.value;
      set(v);
      check(f, v);
    };

  const reset = () => {
    setCpf("");
    setNome("");
    setEmail("");
    setSenha("");
    setFone("");
    setData("");
    setGenero("");
    setCargoId("");
    setCrm("");
    setEspId("");
    setCoren("");
    setErrs({});
  };

  const openNew = () => {
    reset();
    setMode("create");
    setSelId(null);
    setDlgOpen(true);
  };

  const openEdit = (p: Professional) => {
    reset();
    setCpf(p.prof_cpf);
    setNome(p.prof_nome);
    setEmail(p.prof_email);
    setFone(p.prof_telefone);
    setData(new Date(p.prof_data_nascimento).toISOString().slice(0, 10));
    setGenero(p.prof_genero);
    setCargoId(p.id_cargo);
    setCrm(p.crm || "");
    setEspId(p.id_especialidade || "");
    setCoren(p.coren || "");
    setSenha(DEFAULT_PASSWORD_MASK);
    setShowPass(false);
    setMode("edit");
    setSelId(p.id_profissional);
    setDlgOpen(true);
  };

  const valid = () =>
    !!(
      cpf &&
      nome &&
      email &&
      fone &&
      data &&
      cargoId !== "" &&
      !Object.values(errs).some(e => e) &&
      (mode === "create" ? senha.length >= 6 : true) &&
      (!ehMedico || (crm && espId)) &&
      (!ehEnfermeiro || coren)
    );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    ["cpf", "nome", "email", "fone", "data", "senha", "crm", "coren"].forEach(f => {
      const map: any = { cpf, nome, email, fone, data, senha, crm, coren };
      check(f, map[f]);
    });
    if (!valid()) return;
    const body: any = {
      prof_nome: nome,
      prof_cpf: cpf.replace(/\D/g, ""),
      prof_email: email,
      prof_telefone: fone,
      prof_genero: genero,
      prof_data_nascimento: data,
      id_cargo: +cargoId
    };
    if (senha && senha !== DEFAULT_PASSWORD_MASK) body.prof_senha = senha;
    if (ehMedico) {
      body.crm = crm;
      body.id_especialidade = espId;
    }
    if (ehEnfermeiro) body.coren = coren;
    const url =
      mode === "create" ? "/api/profissionais" : `/api/profissionais/${selId}`;
    const method = mode === "create" ? "POST" : "PUT";
    const ok = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(r => r.ok);
    if (!ok) {
      alert("Erro ao salvar, tente novamente.");
      return;
    }
    setDlgOpen(false);
    load();
  };

  const del = async () => {
    if (!toDelete) return;
    const resp = await fetch(`/api/profissionais/${toDelete.id_profissional}`, {
      method: "DELETE"
    });
    if (!resp.ok) {
      const d = await resp.json().catch(() => ({}));
      if (resp.status === 409 && d?.erro) {
        setErrorMsg(
          `Não é possível inativar ${toDelete.prof_nome} — existem consultas em aberto.`
        );
      } else {
        setErrorMsg("Erro ao inativar profissional.");
      }
      setErrorOpen(true);
      return;
    }
    setErrorMsg(`Profissional ${toDelete.prof_nome} inativado com sucesso.`);
    setErrorOpen(true);
    setAlertOpen(false);
    load();
  };

  const reactivate = async (id: number) => {
    await fetch(`/api/profissionais/${id}/reativar`, { method: "PUT" });
    load();
  };

  const openCargoDlg = () => {
    setCargoEditingId(null);
    setCargoName("");
    setCargoDlgOpen(true);
  };

  const editCargo = (c: Cargo) => {
    setCargoEditingId(c.id_cargo);
    setCargoName(c.cargo_nome);
    setCargoDlgOpen(true);
  };

  const saveCargo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cargoName.trim()) return;
    const url = cargoEditingId ? `/api/cargos/${cargoEditingId}` : "/api/cargos";
    const method = cargoEditingId ? "PUT" : "POST";
    const ok = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cargo_nome: cargoName })
    }).then(r => r.ok);
    if (ok) {
      setCargoDlgOpen(false);
      loadCargos();
    }
  };

  const deleteCargo = async (id: number) => {
    if (!confirm("Excluir cargo?")) return;
    await fetch(`/api/cargos/${id}`, { method: "DELETE" });
    loadCargos();
  };

  const toggleAccess = (a: string) =>
    setAllowedAccesses(prev =>
      prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]
    );

  const saveAccesses = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      `Acessos salvos para o cargo ${selectedAccessRole}: ${allowedAccesses.join(", ")}`
    );
    setAccessDlgOpen(false);
  };

  const listaFiltrada = professionals
    .filter(p =>
      status === "all" ? true : status === "active" ? p.prof_ativo : !p.prof_ativo
    )
    .filter(p => !roleFilter || normalizar(p.cargo_nome) === normalizar(roleFilter))
    .filter(p => {
      const termoTxt = normalizar(search);
      const termoNum = soDigitos(search);
      if (!termoTxt && !termoNum) return true;
      const camposTxt = [
        p.prof_nome,
        p.cargo_nome,
        p.prof_email,
        p.crm ?? "",
        p.coren ?? "",
        especialidades.find(e => e.id_especialidade === p.id_especialidade)?.espec_nome ?? ""
      ].map(normalizar);
      const camposNum = [p.prof_cpf, p.prof_telefone].map(soDigitos);
      const matchTxt = termoTxt ? camposTxt.some(c => c.includes(termoTxt)) : false;
      const matchNum = termoNum ? camposNum.some(c => c.includes(termoNum)) : false;
      return matchTxt || matchNum;
    });

  return (
    <>
      <Header>
        <TopNav
          links={[
            { title: "Início", href: "/", isActive: true, disabled: false },
            { title: "Consultas", href: "/consultasgestao", isActive: false, disabled: false },
            { title: "Pacientes", href: "/pacientes", isActive: true, disabled: false }
          ]}
        />
        <div className="ml-auto flex items-center space-x-4">
          <ProfileDropdown />
        </div>
      </Header>

      <main className="p-4 space-y-6">
        <h1 className="text-3xl font-bold">Gerenciamento de Profissionais</h1>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisar..."
            className="w-48"
          />
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">Todos os Cargos</option>
            {cargos.map(c => (
              <option key={c.id_cargo} value={c.cargo_nome}>
                {c.cargo_nome}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as any)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
            <option value="all">Todos</option>
          </select>
          <Button onClick={openNew}>Adicionar Profissional</Button>
          <Button onClick={openCargoDlg}>Gerenciar Cargos</Button>
          <Dialog open={accessDlgOpen} onOpenChange={setAccessDlgOpen}>
            <DialogTrigger asChild>
              <Button>Gerenciar Acessos</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg p-6">
              <DialogHeader>
                <DialogTitle>Gerenciar Acessos</DialogTitle>
                <DialogDescription>
                  Defina quais módulos cada cargo pode acessar.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={saveAccesses} className="space-y-4">
                <div>
                  <Label className="mb-1 block">Cargo</Label>
                  <select
                    value={selectedAccessRole}
                    onChange={e => setSelectedAccessRole(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="">Selecione…</option>
                    {cargos.map(c => (
                      <option key={c.id_cargo} value={c.cargo_nome}>
                        {c.cargo_nome}
                      </option>
                    ))}
                  </select>
                </div>
                <fieldset>
                  <legend className="text-sm mb-2">Módulos</legend>
                  {ALL_ACCESS_OPTIONS.map(ac => (
                    <label key={ac} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={allowedAccesses.includes(ac)}
                        onChange={() => toggleAccess(ac)}
                      />
                      <span>{ac}</span>
                    </label>
                  ))}
                </fieldset>
                <DialogFooter>
                  <Button type="submit" size="sm">
                    Salvar
                  </Button>
                  <DialogClose asChild>
                    <Button variant="outline" size="sm">
                      Cancelar
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Profissionais</CardTitle>
            <CardDescription>
              {status === "all"
                ? `Total: ${listaFiltrada.length}`
                : status === "active"
                ? `Ativos: ${listaFiltrada.length}`
                : `Inativos: ${listaFiltrada.length}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[450px]">
              <Table className="w-full text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Nasc.</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listaFiltrada.map(p => (
                    <TableRow
                      key={p.id_profissional}
                      className={!p.prof_ativo ? "bg-gray-100" : ""}
                    >
                      <TableCell>{p.prof_nome}</TableCell>
                      <TableCell>{formatCPF(p.prof_cpf)}</TableCell>
                      <TableCell>{p.cargo_nome}</TableCell>
                      <TableCell>
                        {new Date(p.prof_data_nascimento).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>{p.prof_email}</TableCell>
                      <TableCell>{formatPhone(p.prof_telefone)}</TableCell>
                      <TableCell>
                        {p.prof_ativo ? (
                          <>
                            <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="ml-2"
                              onClick={() => {
                                setToDelete(p);
                                setAlertOpen(true);
                              }}
                            >
                              Inativar
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => reactivate(p.id_profissional)}
                          >
                            Reativar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {listaFiltrada.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Nenhum profissional encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableCaption>
                  Total de {listaFiltrada.length} profissional(is)
                </TableCaption>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>

      <Dialog open={dlgOpen} onOpenChange={setDlgOpen}>
        <DialogContent className="max-w-[800px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Adicionar" : "Editar"} Profissional
            </DialogTitle>
            <DialogDescription>Campos * são obrigatórios.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit}>
            <div className="grid gap-4 py-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-1">
                <Label>CPF *</Label>
                <Input value={formatCPF(cpf)} onChange={h("cpf", setCpf, formatCPF)} />
                {errs.cpf && <p className="text-red-600 text-sm">{errs.cpf}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <Label>Nome *</Label>
                <Input value={nome} onChange={h("nome", setNome)} />
                {errs.nome && <p className="text-red-600 text-sm">{errs.nome}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <Label>E-mail</Label>
                <Input value={email} onChange={h("email", setEmail)} />
                {errs.email && <p className="text-red-600 text-sm">{errs.email}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <Label>Senha {mode === "create" && "*"}</Label>
                <div className="relative">
                  <Input
                    type={showPass ? "text" : "password"}
                    value={senha}
                    placeholder={mode === "edit" ? "•••••••• (deixe assim para não alterar)" : ""}
                    onFocus={() => {
                      if (senha === DEFAULT_PASSWORD_MASK) setSenha("");
                    }}
                    onChange={h("senha", setSenha)}
                    className="pr-10"
                  />
                  {mode === "edit" && (
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute inset-y-0 right-3 flex items-center"
                      title={showPass ? "Ocultar" : "Mostrar"}
                    >
                      {showPass ? "🙈" : "👁️"}
                    </button>
                  )}
                </div>
                {errs.senha && <p className="text-red-600 text-sm">{errs.senha}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <Label>Telefone</Label>
                <Input value={formatPhone(fone)} onChange={h("fone", setFone, formatPhone)} />
                {errs.fone && <p className="text-red-600 text-sm">{errs.fone}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <Label>Data de Nascimento *</Label>
                <Input type="date" value={data} onChange={h("data", setData)} />
                {errs.data && <p className="text-red-600 text-sm">{errs.data}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <Label>Gênero</Label>
                <select
                  className="px-3 py-2 border rounded-md"
                  value={genero}
                  onChange={e => setGenero(e.target.value)}
                >
                  <option value="">Selecione…</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                  <option value="O">Outros</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <Label>Cargo *</Label>
                <select
                  className="px-3 py-2 border rounded-md"
                  value={cargoId}
                  onChange={e => setCargoId(+e.target.value)}
                >
                  <option value="">Selecione…</option>
                  {cargos.map(c => (
                    <option key={c.id_cargo} value={c.id_cargo}>
                      {c.cargo_nome}
                    </option>
                  ))}
                </select>
              </div>
              {ehMedico && (
                <>
                  <div className="flex flex-col gap-1">
                    <Label>CRM *</Label>
                    <Input value={crm} onChange={h("crm", setCrm)} />
                    {errs.crm && <p className="text-red-600 text-sm">{errs.crm}</p>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label>Especialidade *</Label>
                    <select
                      className="px-3 py-2 border rounded-md"
                      value={espId}
                      onChange={e => setEspId(+e.target.value)}
                    >
                      <option value="">Selecione…</option>
                      {especialidades.map(e => (
                        <option key={e.id_especialidade} value={e.id_especialidade}>
                          {e.espec_nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              {ehEnfermeiro && (
                <div className="flex flex-col gap-1">
                  <Label>COREN *</Label>
                  <Input value={coren} onChange={h("coren", setCoren)} />
                  {errs.coren && <p className="text-red-600 text-sm">{errs.coren}</p>}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={!valid()}>
                Salvar
              </Button>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Inativar Profissional?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Você poderá reativá-lo depois, se necessário.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={del}>Inativar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={errorOpen} onOpenChange={setErrorOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aviso</AlertDialogTitle>
            <AlertDialogDescription>{errorMsg}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorOpen(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={cargoDlgOpen} onOpenChange={setCargoDlgOpen}>
        <DialogContent className="max-w-[700px] w-full">
          <DialogHeader>
            <DialogTitle>Gerenciar Cargos</DialogTitle>
            <DialogDescription>Crie, edite ou exclua cargos</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <ScrollArea className="h-[200px]">
              <Table className="w-full table-auto text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cargos.map(c => (
                    <TableRow key={c.id_cargo}>
                      <TableCell>{c.id_cargo}</TableCell>
                      <TableCell>{c.cargo_nome}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => editCargo(c)}>
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="ml-2"
                          onClick={() => deleteCargo(c.id_cargo)}
                        >
                          Excluir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {cargos.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        Nenhum cargo cadastrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>

            <form onSubmit={saveCargo} className="space-y-2">
              <Label>Nome do Cargo</Label>
              <Input value={cargoName} onChange={e => setCargoName(e.target.value)} />
              <DialogFooter>
                <Button type="submit">
                  {cargoEditingId ? "Salvar Alterações" : "Adicionar Cargo"}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
