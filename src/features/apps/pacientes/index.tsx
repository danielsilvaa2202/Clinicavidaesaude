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
  DialogClose
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogTrigger,
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

interface TopNavLink {
  title: string;
  href: string;
  isActive: boolean;
  disabled: boolean;
}
interface Patient {
  id_paciente: number;
  pac_cpf: string;
  pac_nome: string;
  pac_email: string;
  pac_telefone: string;
  pac_data_nascimento: string;
  pac_genero: string;
  pac_cep: string;
  pac_endereco: string;
  pac_cidade: string;
  pac_estado: string;
  pac_data_cadastro: string;
  pac_ativo: boolean;
}

const topNavLinks: TopNavLink[] = [
  { title: "Início", href: "/", isActive: true, disabled: false },
  { title: "Consultas", href: "/consultasgestao", isActive: false, disabled: false },
  { title: "Pacientes", href: "/pacientes", isActive: true, disabled: false }
];

const CPF_RE = /^\d{11}$/;
const CEP_RE = /^\d{8}$/;

const UF_SET = new Set([
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB",
  "PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
]);
const DDD_SET = new Set([
  "11","12","13","14","15","16","17","18","19","21","22","24","27","28",
  "31","32","33","34","35","37","38","41","42","43","44","45","46","47","48",
  "49","51","53","54","55","61","62","64","63","65","66","67","68","69",
  "71","73","74","75","77","79","81","82","83","84","85","86","87","88",
  "89","91","92","93","94","95","96","97","98","99"
]);

const validarCPF = (c: string): boolean => {
  const cpf = c.replace(/\D/g, "");
  if (!CPF_RE.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
  const calc = (m: number) => {
    let s = 0;
    for (let i = 0; i < m; i++) s += parseInt(cpf[i]) * (m + 1 - i);
    return ((s * 10) % 11) % 10;
  };
  return calc(9) === +cpf[9] && calc(10) === +cpf[10];
};

const formatCPF = (v: string) =>
  v.replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4")
    .slice(0, 14);

const formatPhone = (v: string) =>
  v.replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .slice(0, 15);

const formatCep = (v: string) =>
  v.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2").slice(0, 9);

const isPastOrToday = (d: string) => new Date(d) <= new Date();

const NAME_PART_RE = /^[A-ZÀ-Ö][a-zà-ö]+$/;
const getNomeError = (raw: string) => {
  const v = raw.trim();
  if (!v) return "Nome é obrigatório.";
  if (/\s{2,}/.test(v)) return "Não use espaços duplos.";
  const parts = v.split(" ");
  if (parts.length < 2) return "Informe nome e sobrenome.";
  if (v.length < 6 || v.length > 60) return "6–60 caracteres.";
  if (parts.some(p => p.length < 2 || !NAME_PART_RE.test(p)))
    return "Cada parte deve ter ≥2 letras e iniciar com maiúscula.";
  return "";
};
const EMAIL_RE =
  /^[a-z0-9](?:[a-z0-9._%+-]{0,62}[a-z0-9])?@(?:[a-z0-9-]+\.)+[a-z]{2,6}$/i;
const REPEATED_TLD_RE = /(\.[a-z]{2,6})\1+$/i;
const getEmailError = (e: string) => {
  if (!e) return "E-mail é obrigatório.";

  const email = e.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return "Formato de e-mail inválido.";

  const domain = email.split("@")[1];

  if (REPEATED_TLD_RE.test(domain)) return "Domínio inválido (sufixo repetido).";

  return "";
};
const getTelefoneError = (v: string) => {
  const n = v.replace(/\D/g, "");
  if (!n) return "Telefone é obrigatório.";
  if (n.length !== 10 && n.length !== 11) return "Use 10 ou 11 dígitos.";
  if (!DDD_SET.has(n.slice(0, 2))) return `DDD "${n.slice(0, 2)}" inválido.`;
  if (/^(\d)\1+$/.test(n.slice(2))) return "Não use dígitos iguais.";
  if (n.length === 11 && n[2] !== "9") return 'Celular deve iniciar com "9".';
  if (n.length === 10 && !/[2-5]/.test(n[2])) return "Fixo inicia com 2–5.";
  return "";
};
const getCidadeError = (v: string) =>
  !v ? "Cidade é obrigatória." : /^[A-Za-zÀ-ÖØ-öø-ÿ ]{2,40}$/.test(v)
    ? ""
    : "Somente letras, 2–40 caracteres.";
const getUFError = (v: string) =>
  !v ? "UF é obrigatória." : UF_SET.has(v.toUpperCase()) ? "" : "UF inválida.";

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const matchesSearch = (p: Patient, term: string) => {
  if (!term) return true;
  const t = normalize(term);
  const nascimento = new Date(p.pac_data_nascimento)
    .toISOString()
    .slice(0, 10)
    .split("-")
    .reverse()
    .join("/");
  const fields = [
    p.pac_nome,
    p.pac_cpf,
    formatCPF(p.pac_cpf),
    nascimento,
    p.pac_email,
    p.pac_telefone,
    formatPhone(p.pac_telefone),
    p.pac_endereco,
    p.pac_cidade,
    p.pac_estado
  ].map(normalize);
  return fields.some(f => f.includes(t));
};

const PacientesPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | "all">("active");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [cpf, setCpf] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [cep, setCep] = useState("");
  const [address, setAddress] = useState("");
  const [number, setNumber] = useState("");
  const [city, setCity] = useState("");
  const [uf, setUf] = useState("");
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [cepStatus, setCepStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [alertOpen, setAlertOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchPatients = () => {
    fetch("/api/pacientes?ativo=all")
      .then(res => res.json())
      .then(setPatients)
      .catch(console.error);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const clearForm = () => {
    setCpf("");
    setName("");
    setEmail("");
    setPhone("");
    setBirthDate("");
    setGender("");
    setCep("");
    setAddress("");
    setNumber("");
    setCity("");
    setUf("");
    setErrors({});
    setCepStatus("idle");
  };

  const openCreateDialog = () => {
    clearForm();
    setDialogMode("create");
    setDialogOpen(true);
  };
  const openEditDialog = (id: number) => {
    const p = patients.find(x => x.id_paciente === id);
    if (p) {
      setCpf(p.pac_cpf);
      setName(p.pac_nome);
      setEmail(p.pac_email);
      setPhone(p.pac_telefone);
      setBirthDate(new Date(p.pac_data_nascimento).toISOString().slice(0, 10));
      setGender(p.pac_genero);
      setCep(p.pac_cep);
      const [st, num = ""] = p.pac_endereco.split(",").map(s => s.trim());
      setAddress(st);
      setNumber(num);
      setCity(p.pac_cidade);
      setUf(p.pac_estado);
      setCepStatus("success");
    }
    setDialogMode("edit");
    setSelectedPatientId(id);
    setDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!patientToDelete) return;
    fetch(`/api/pacientes/${patientToDelete.id_paciente}`, { method: "DELETE" })
      .then(async r => {
        if (!r.ok) {
          const d = await r.json().catch(() => ({}));
          if (r.status === 409 && d?.erro) {
            setErrorMsg(`Não é possível inativar ${patientToDelete.pac_nome} — existem consultas em aberto.`);
            setErrorOpen(true);
            return;
          }
          setErrorMsg("Erro ao inativar paciente.");
          setErrorOpen(true);
          return;
        }
        setErrorMsg(`Paciente ${patientToDelete.pac_nome} inativado com sucesso.`);
        setErrorOpen(true);
        setAlertOpen(false);
        fetchPatients();
      })
      .catch(() => {
        setErrorMsg("Erro ao inativar paciente.");
        setErrorOpen(true);
      });
  };

  const handleReactivate = (id: number) =>
    fetch(`/api/pacientes/${id}/reativar`, { method: "PUT" })
      .then(r => {
        if (!r.ok) throw new Error();
        fetchPatients();
      })
      .catch(console.error);

  useEffect(() => {
    const raw = cep.replace(/\D/g, "");
    if (!raw) return setCepStatus("idle");
    if (!CEP_RE.test(raw)) return setCepStatus("error");
    if (raw.length === 8) {
      setCepStatus("loading");
      fetch(`https://brasilapi.com.br/api/cep/v2/${raw}`)
        .then(async r => {
          if (!r.ok) throw new Error();
          const d = await r.json();
          setAddress(d.street || "");
          setCity(d.city || "");
          setUf(d.state || "");
          setCepStatus("success");
        })
        .catch(() => {
          setAddress("");
          setCity("");
          setUf("");
          setCepStatus("error");
        });
    }
  }, [cep]);

  const calculateAge = (d: string) => {
    const birth = new Date(d);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age;
  };

  const validateField = (field: string, value: string) => {
    let msg = "";
    const raw = value.replace(/\D/g, "");
    const v = value.trim();
    switch (field) {
      case "cpf":
        if (!raw) msg = "CPF é obrigatório.";
        else if (!validarCPF(raw)) msg = "CPF inválido.";
        break;
      case "name":
        msg = getNomeError(v);
        break;
      case "email":
        msg = getEmailError(v);
        break;
      case "phone":
        msg = getTelefoneError(v);
        break;
      case "birthDate":
        if (!v) msg = "Data de nascimento é obrigatória.";
        else if (!isPastOrToday(v)) msg = "Data futura não permitida.";
        else {
          const age = calculateAge(v);
          if (age < 0 || age > 120) msg = "Idade inválida.";
        }
        break;
      case "cep":
        if (!raw) msg = "CEP é obrigatório.";
        else if (!CEP_RE.test(raw)) msg = "CEP deve ter 8 dígitos.";
        break;
      case "address":
        if (cepStatus !== "success" && !v) msg = "Endereço é obrigatório.";
        break;
      case "number":
        if (!v) msg = "Número é obrigatório.";
        else if (!/^\d+$/.test(v) && v !== "S/N") msg = "Somente dígitos ou 'S/N'.";
        break;
      case "city":
        if (cepStatus !== "success") msg = getCidadeError(v);
        break;
      case "uf":
        if (cepStatus !== "success") msg = getUFError(v);
        break;
      case "gender":
        if (!v) msg = "Gênero é obrigatório.";
        break;
    }
    setErrors(prev => ({ ...prev, [field]: msg }));
  };

  const handleChange =
    (
      field: string,
      setter: (v: string) => void,
      formatter?: (v: string) => string
    ) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      if (
        cepStatus === "success" &&
        (field === "address" || field === "city" || field === "uf")
      )
        return;
      const raw = e.target.value;
      const formatted = formatter ? formatter(raw) : raw;
      setter(formatted);
      validateField(field, formatted);
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const values: Record<string, string> = {
      cpf,
      name,
      email,
      phone,
      birthDate,
      gender,
      cep,
      address,
      number,
      city,
      uf
    };
    Object.entries(values).forEach(([k, v]) => validateField(k, v));
    if (Object.values(errors).some(Boolean)) return;
    const payload = {
      pac_cpf: cpf,
      pac_nome: name,
      pac_email: email,
      pac_telefone: phone,
      pac_data_nascimento: birthDate,
      pac_genero: gender,
      pac_cep: cep,
      pac_endereco: `${address}, ${number}`,
      pac_cidade: city,
      pac_estado: uf
    };
    const url =
      dialogMode === "create"
        ? "/api/pacientes"
        : `/api/pacientes/${selectedPatientId}`;
    const method = dialogMode === "create" ? "POST" : "PUT";
    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(async r => {
        if (!r.ok) {
          const data = await r.json().catch(() => ({}));
          if ((r.status === 409 || r.status === 400) && data?.message?.includes("CPF")) {
            setErrors(prev => ({ ...prev, cpf: "CPF já cadastrado." }));
            return;
          }
          throw new Error();
        }
        return r.json();
      })
      .then(() => {
        setDialogOpen(false);
        clearForm();
        fetchPatients();
      })
      .catch(() => alert("Erro ao salvar paciente"));
  };

  const isFormValid =
    cpf &&
    name &&
    birthDate &&
    gender &&
    cep &&
    number &&
    address &&
    !Object.values(errors).some(Boolean);

  const filteredPatients = patients.filter(p => {
    const statusOk =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? p.pac_ativo
        : !p.pac_ativo;
    return statusOk && matchesSearch(p, searchTerm);
  });

  return (
    <>
      <Header>
        <TopNav links={topNavLinks} />
        <div className="ml-auto flex items-center space-x-4">
          <ProfileDropdown />
        </div>
      </Header>

      <main className="p-4 space-y-6">
        <h1 className="text-3xl font-bold">Lista de Pacientes</h1>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Pesquisar..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-48"
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
            <option value="all">Todos</option>
          </select>
          <Button onClick={openCreateDialog}>Cadastrar Paciente</Button>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Pacientes Cadastrados</CardTitle>
            <CardDescription>
              {statusFilter === "all"
                ? `Total: ${filteredPatients.length}`
                : statusFilter === "active"
                ? `Ativos: ${filteredPatients.length}`
                : `Inativos: ${filteredPatients.length}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[450px]">
              <Table className="w-full text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Nascimento</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead>Cidade/Estado</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map(p => (
                    <TableRow
                      key={p.id_paciente}
                      className={!p.pac_ativo ? "bg-gray-100" : ""}
                    >
                      <TableCell>{p.pac_nome}</TableCell>
                      <TableCell>{formatCPF(p.pac_cpf)}</TableCell>
                      <TableCell>
                        {new Date(p.pac_data_nascimento)
                          .toISOString()
                          .slice(0, 10)
                          .split("-")
                          .reverse()
                          .join("/")}
                      </TableCell>
                      <TableCell>{p.pac_email}</TableCell>
                      <TableCell>{formatPhone(p.pac_telefone)}</TableCell>
                      <TableCell>{p.pac_endereco}</TableCell>
                      <TableCell>
                        {p.pac_cidade} / {p.pac_estado}
                      </TableCell>
                      <TableCell>
                        {p.pac_ativo ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(p.id_paciente)}
                            >
                              Editar
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => setPatientToDelete(p)}
                                >
                                  Inativar
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Inativar Paciente?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Essa ação não poderá ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => {
                                      setAlertOpen(false);
                                      handleConfirmDelete();
                                    }}
                                  >
                                    Inativar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReactivate(p.id_paciente)}
                          >
                            Reativar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredPatients.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="py-4 text-center">
                        Nenhum paciente encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableCaption className="text-sm text-muted-foreground mt-2">
                  Total de {filteredPatients.length} paciente(s).
                </TableCaption>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>

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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[800px] w-full max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Cadastrar Paciente" : "Editar Paciente"}
            </DialogTitle>
            <DialogDescription>Preencha os campos obrigatórios.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-1">
                <Label>CPF *</Label>
                <Input
                  value={formatCPF(cpf)}
                  onChange={handleChange("cpf", setCpf, formatCPF)}
                />
                {errors.cpf && <p className="text-red-600 text-sm">{errors.cpf}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <Label>Nome *</Label>
                <Input value={name} onChange={handleChange("name", setName)} />
                {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <Label>E-mail</Label>
                <Input value={email} onChange={handleChange("email", setEmail)} />
                {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <Label>Telefone *</Label>
                <Input
                  value={formatPhone(phone)}
                  onChange={handleChange("phone", setPhone, formatPhone)}
                />
                {errors.phone && <p className="text-red-600 text-sm">{errors.phone}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <Label>Data de Nascimento *</Label>
                <Input
                  type="date"
                  value={birthDate}
                  onChange={handleChange("birthDate", setBirthDate)}
                />
                {errors.birthDate && (
                  <p className="text-red-600 text-sm">{errors.birthDate}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <Label>Gênero *</Label>
                <select
                  value={gender}
                  onChange={handleChange("gender", setGender)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="">Selecione</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                  <option value="Outro">Outro</option>
                </select>
                {errors.gender && <p className="text-red-600 text-sm">{errors.gender}</p>}
              </div>

              <div className="flex flex-col gap-1 relative">
                <Label>CEP *</Label>
                <Input
                  value={formatCep(cep)}
                  onChange={handleChange("cep", setCep, formatCep)}
                />
                {cepStatus === "loading" && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                )}
                {errors.cep && <p className="text-red-600 text-sm">{errors.cep}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <Label>Endereço *</Label>
                <Input
                  disabled={cepStatus === "success"}
                  readOnly={cepStatus === "success"}
                  value={address}
                  onChange={handleChange("address", setAddress)}
                />
                {errors.address && (
                  <p className="text-red-600 text-sm">{errors.address}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <Label>Número *</Label>
                <div className="flex gap-2">
                  <Input
                    value={number}
                    onChange={handleChange("number", setNumber)}
                    disabled={number === "S/N"}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant={number === "S/N" ? "outline" : "secondary"}
                    onClick={() => {
                      const novoValor = number === "S/N" ? "" : "S/N";
                      setNumber(novoValor);
                      validateField("number", novoValor);
                    }}
                  >
                    {number === "S/N" ? "Desfazer" : "Sem número"}
                  </Button>
                </div>
                {errors.number && <p className="text-red-600 text-sm">{errors.number}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <Label>Cidade {cepStatus !== "success" && "*"}</Label>
                <Input
                  disabled={cepStatus === "success"}
                  readOnly={cepStatus === "success"}
                  value={city}
                  onChange={handleChange("city", setCity)}
                />
                {errors.city && <p className="text-red-600 text-sm">{errors.city}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <Label>Estado {cepStatus !== "success" && "*"}</Label>
                <Input
                  disabled={cepStatus === "success"}
                  readOnly={cepStatus === "success"}
                  value={uf}
                  onChange={handleChange("uf", setUf)}
                  maxLength={2}
                  className="uppercase"
                />
                {errors.uf && <p className="text-red-600 text-sm">{errors.uf}</p>}
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={!isFormValid}>
                {dialogMode === "create" ? "Cadastrar" : "Salvar"}
              </Button>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PacientesPage;
