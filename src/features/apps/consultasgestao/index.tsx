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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
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

interface Consultation {
  id_consulta: number;
  consult_data: string;
  consult_hora: string;
  doctorId: number;
  doctorName: string;
  doctorCPF: string;
  patientId: number;
  patientName: string;
  patientCPF: string;
  specialtyId: number;
  specialty: string;
  statusId: number;
  status: string;
}

interface Status {
  id_consult_status: number;
  status_consulta: string;
}

interface Doctor {
  id_medico: number;
  id_profissional: number;
  prof_nome: string;
  prof_cpf: string;
}

interface Patient {
  id_paciente: number;
  pac_nome: string;
  pac_cpf: string;
}

interface Specialty {
  id_tipo_consulta: number;
  tipoconsulta_nome: string;
}

const topNavLinks: TopNavLink[] = [
  { title: "Início", href: "/", isActive: false, disabled: false },
  { title: "Consultas", href: "/consultasgestao", isActive: true, disabled: false },
  { title: "Pacientes", href: "/pacientes", isActive: false, disabled: false }
];

const ITEMS_PER_PAGE = 10;

const formatDateLocal = (iso: string) => {
  const datePart = iso.split("T")[0];
  const [year, month, day] = datePart.split("-");
  return `${day}/${month}/${year}`;
};

export default function ConsultasPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [allStatuses, setAllStatuses] = useState<Status[]>([]);
  const [allSpecialties, setAllSpecialties] = useState<Specialty[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [registrationFrom, setRegistrationFrom] = useState("");
  const [registrationTo, setRegistrationTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "reschedule">("create");
  const [selectedConsultationId, setSelectedConsultationId] = useState<number | null>(null);
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [newTime, setNewTime] = useState("");
  const [errors, setErrors] = useState<{ date?: string; time?: string }>({});
  const [newSpecialtyId, setNewSpecialtyId] = useState<number | "">("");
  const [doctorSearch, setDoctorSearch] = useState("");
  const [doctorResults, setDoctorResults] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [patientSearch, setPatientSearch] = useState("");
  const [patientResults, setPatientResults] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [selectedPatientCPF, setSelectedPatientCPF] = useState("");

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  })
    .format(new Date())
    .replace(/(\d{4})-(\d{2})-(\d{2})/, "$1-$2-$3");

  const currentTime = new Date().toTimeString().slice(0, 5);

  useEffect(() => {
    if (!selectedDoctorId || !newDate || !newTime) return;
    if (errors.date || errors.time) return;
    const controller = new AbortController();
    const qs = new URLSearchParams({
      id_profissional: String(selectedDoctorId),
      data_ini: newDate,
      data_fim: newDate
    }).toString();
    fetch(`/api/consultas?${qs}`, { signal: controller.signal })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then((list: { consult_hora: string; id_consulta: number }[]) => {
        const conflict = list.some(
          c => c.consult_hora.slice(0, 5) === newTime && c.id_consulta !== selectedConsultationId
        );
        setErrors(prev => ({
          ...prev,
          time: conflict ? "Médico já ocupado neste horário." : ""
        }));
      })
      .catch(() => {});
    return () => controller.abort();
  }, [selectedDoctorId, newDate, newTime, errors.date]);

  const validateDate = (value: string) => {
    if (!value) return "Data é obrigatória.";
    if (value < today) return "Não pode ser anterior à data de hoje.";
    return "";
  };

  const validateTime = (value: string) => {
    if (!value) return "Hora é obrigatória.";
    if (newDate === today && value < currentTime) return "Selecione hora futura para hoje.";
    return "";
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const d = e.target.value;
    setNewDate(d);
    setErrors(prev => ({
      ...prev,
      date: validateDate(d),
      time: prev.time && newTime ? validateTime(newTime) : prev.time
    }));
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = e.target.value;
    setNewTime(t);
    setErrors(prev => ({ ...prev, time: validateTime(t) }));
  };

  useEffect(() => {
    fetch("/api/statusconsulta")
      .then(r => r.json())
      .then((data: Status[]) => setAllStatuses(data))
      .catch(console.error);

    fetch("/api/tiposconsulta")
      .then(r => r.json())
      .then((data: Specialty[]) => setAllSpecialties(data))
      .catch(console.error);
  }, []);

  const fetchConsultations = () => {
    const params = new URLSearchParams();
    if (registrationFrom) params.append("data_ini", registrationFrom);
    if (registrationTo) params.append("data_fim", registrationTo);
    fetch(`/api/consultas?${params}`)
      .then(r => r.json())
      .then((data: any[]) =>
        setConsultations(
          data.map(c => ({
            id_consulta: c.id_consulta,
            consult_data: c.consult_data,
            consult_hora: c.consult_hora,
            doctorId: c.id_profissional || c.id_medico,
            doctorName: c.profissional_nome || c.prof_nome,
            doctorCPF: c.prof_cpf || "",
            patientId: c.id_paciente,
            patientName: c.pac_nome || "",
            patientCPF: c.paciente_cpf || "",
            specialtyId: c.id_tipo_consulta,
            specialty: c.tipoconsulta_nome || "",
            statusId: c.id_consult_status,
            status: c.status_consulta || "—"
          }))
        )
      )
      .then(() => setCurrentPage(1))
      .catch(console.error);
  };

  useEffect(() => {
    fetchConsultations();
    const iv = setInterval(fetchConsultations, 15000);
    window.addEventListener("focus", fetchConsultations);
    return () => {
      clearInterval(iv);
      window.removeEventListener("focus", fetchConsultations);
    };
  }, [registrationFrom, registrationTo]);

  const prefillForm = (c: Consultation) => {
    setSelectedConsultationId(c.id_consulta);
    setNewDate(c.consult_data.split("T")[0]);
    setNewTime(c.consult_hora ? c.consult_hora.substring(0, 5) : "");
    setNewSpecialtyId(c.specialtyId);
    setSelectedDoctorId(c.doctorId);
    setDoctorSearch(c.doctorName);
    setSelectedPatientId(c.patientId);
    setPatientSearch(c.patientName);
    setSelectedPatientCPF(c.patientCPF);
  };

  const clearForm = () => {
    setSelectedConsultationId(null);
    setNewDate("");
    setNewTime("");
    setNewSpecialtyId("");
    setDoctorSearch("");
    setDoctorResults([]);
    setSelectedDoctorId(null);
    setPatientSearch("");
    setPatientResults([]);
    setSelectedPatientId(null);
    setSelectedPatientCPF("");
  };

  const openCreateDialog = () => {
    setDialogMode("create");
    clearForm();
    setNewDate(today);
    setErrors({});
    setDialogOpen(true);
  };

  const openEditDialog = (c: Consultation) => {
    setDialogMode("edit");
    prefillForm(c);
    setDialogOpen(true);
  };

  const openRescheduleDialog = (c: Consultation) => {
    setDialogMode("reschedule");
    prefillForm(c);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dateErr = validateDate(newDate);
    const timeErr = validateTime(newTime);
    setErrors({ date: dateErr, time: timeErr });
    if (dateErr || timeErr) return;
    try {
      const params = new URLSearchParams({
        id_profissional: String(selectedDoctorId),
        data_ini: newDate,
        data_fim: newDate
      });
      const resp = await fetch(`/api/consultas?${params.toString()}`);
      if (!resp.ok) throw new Error();
      const existing: { consult_hora: string; id_consulta: number }[] = await resp.json();
      const conflict = existing.some(
        c => c.consult_hora.slice(0, 5) === newTime && c.id_consulta !== selectedConsultationId
      );
      if (conflict) {
        setErrors(prev => ({ ...prev, time: "Médico já ocupado neste horário." }));
        return;
      }
    } catch {
      alert("Não foi possível verificar disponibilidade do médico.");
      return;
    }
    let url = "/api/consultas";
    let method: "POST" | "PUT" = "POST";
    const payload: any = {
      id_paciente: selectedPatientId,
      id_profissional: selectedDoctorId,
      consult_data: newDate,
      consult_hora: newTime,
      id_tipo_consulta: newSpecialtyId
    };
    if (dialogMode !== "create") {
      url = `/api/consultas/${selectedConsultationId}`;
      method = "PUT";
      payload.id_consult_status =
        dialogMode === "reschedule"
          ? 5
          : consultations.find(c => c.id_consulta === selectedConsultationId)?.statusId;
    } else {
      payload.id_consult_status = 1;
    }
    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(r => {
        if (!r.ok) throw new Error("Erro no servidor");
        return r.json();
      })
      .then(() => {
        setDialogOpen(false);
        clearForm();
        fetchConsultations();
      })
      .catch(() => alert("Erro ao salvar."));
  };

  const handleStatusChange = (id: number, statusId: number) => {
    fetch(`/api/consultas/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_consult_status: statusId })
    })
      .then(r => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(() =>
        setConsultations(prev =>
          prev.map(c =>
            c.id_consulta === id
              ? {
                  ...c,
                  statusId,
                  status:
                    allStatuses.find(s => s.id_consult_status === statusId)?.status_consulta ||
                    c.status
                }
              : c
          )
        )
      )
      .catch(() => alert("Falha ao mudar status."));
  };

  useEffect(() => {
    if (doctorSearch.length < 2) return setDoctorResults([]);
    const ctrl = new AbortController();
    fetch(`/api/medicos?search=${doctorSearch}`, { signal: ctrl.signal })
      .then(r => r.json())
      .then(data =>
        setDoctorResults(
          data.map((d: any) => ({
            id_medico: d.id_medico,
            id_profissional: d.id_profissional,
            prof_nome: d.prof_nome,
            prof_cpf: d.prof_cpf
          }))
        )
      )
      .catch(e => e.name !== "AbortError" && console.error(e));
    return () => ctrl.abort();
  }, [doctorSearch]);

  const selectDoctor = (d: Doctor) => {
    setSelectedDoctorId(d.id_profissional);
    setDoctorSearch(d.prof_nome);
    setDoctorResults([]);
  };

  useEffect(() => {
    if (patientSearch.length < 2) return setPatientResults([]);
    const ctrl = new AbortController();
    fetch(`/api/pacientes?search=${patientSearch}`, { signal: ctrl.signal })
      .then(r => r.json())
      .then(data =>
        setPatientResults(
          data.map((p: any) => ({
            id_paciente: p.id_paciente,
            pac_nome: p.pac_nome,
            pac_cpf: p.pac_cpf
          }))
        )
      )
      .catch(e => e.name !== "AbortError" && console.error(e));
    return () => ctrl.abort();
  }, [patientSearch]);

  const selectPatient = (p: Patient) => {
    setSelectedPatientId(p.id_paciente);
    setPatientSearch(p.pac_nome);
    setSelectedPatientCPF(p.pac_cpf);
    setPatientResults([]);
  };

  const filtered = consultations.filter(c => {
    const t = searchTerm.toLowerCase();
    return (
      c.consult_data.includes(t) ||
      c.consult_hora.includes(t) ||
      c.doctorName.toLowerCase().includes(t) ||
      c.patientName.toLowerCase().includes(t) ||
      c.specialty.toLowerCase().includes(t) ||
      c.status.toLowerCase().includes(t)
    );
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleExport = () => {
    const headers = ["Data", "Hora", "Médico", "Paciente", "Especialidade", "Status"];
    const rows = filtered.map(c => [
      formatDateLocal(c.consult_data),
      c.consult_hora,
      c.doctorName,
      c.patientName,
      c.specialty,
      c.status
    ]);
    const csv =
      "\uFEFF" +
      [headers.join(","), ...rows.map(r => r.map(v => `"${v}"`).join(","))].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "consultas.csv";
    link.click();
  };

  return (
    <>
      <Header>
        <TopNav links={topNavLinks} />
        <div className="ml-auto flex items-center space-x-4">
          <ProfileDropdown />
        </div>
      </Header>

      <main className="p-4 space-y-6">
        <h1 className="text-3xl font-bold">Consultas Agendadas</h1>

        <div className="flex flex-wrap gap-2 items-end">
          <div>
            <Label>De</Label>
            <Input
              type="date"
              value={registrationFrom}
              onChange={e => setRegistrationFrom(e.target.value)}
            />
          </div>
          <div>
            <Label>Até</Label>
            <Input
              type="date"
              value={registrationTo}
              onChange={e => setRegistrationTo(e.target.value)}
            />
          </div>
          <div>
            <Label>Buscar</Label>
            <Input
              type="text"
              placeholder="nome, data, médico, status..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="ml-auto flex gap-2">
            <Button onClick={openCreateDialog}>Cadastrar Consulta</Button>
            <Button variant="outline" onClick={handleExport}>
              Exportar CSV
            </Button>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Consultas</CardTitle>
            <CardDescription>
              {filtered.length} resultado(s) — página {currentPage}/{totalPages}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[450px]">
              <Table className="w-full text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Médico</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Tipo de Consulta</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map(c => (
                    <TableRow key={c.id_consulta}>
                      <TableCell>{formatDateLocal(c.consult_data)}</TableCell>
                      <TableCell>{c.consult_hora}</TableCell>
                      <TableCell>{c.doctorName}</TableCell>
                      <TableCell>
                        {c.patientName}
                        <br />
                        <small className="text-xs text-muted-foreground">
                          CPF: {c.patientCPF}
                        </small>
                      </TableCell>
                      <TableCell>{c.specialty}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            c.statusId === 2
                              ? "bg-gray-200"
                              : c.statusId === 4
                              ? "bg-green-200"
                              : c.statusId === 5
                              ? "bg-yellow-200"
                              : c.statusId === 6
                              ? "bg-red-200"
                              : "bg-blue-200"
                          }`}
                        >
                          {c.status}
                        </span>
                      </TableCell>
                      <TableCell className="flex flex-wrap gap-1">
                        <Button size="sm" onClick={() => openEditDialog(c)}>
                          Editar
                        </Button>
                        <Button size="sm" onClick={() => openRescheduleDialog(c)}>
                          Reagendar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(c.id_consulta, 4)}
                        >
                          Presença
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusChange(c.id_consulta, 6)}
                        >
                          Ausência
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                              Inativar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Inativar Consulta</AlertDialogTitle>
                              <AlertDialogDescription>Confirma exclusão?</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleStatusChange(c.id_consulta, 3)}
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paged.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        Nenhuma consulta encontrada.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableCaption>Itens por página: {ITEMS_PER_PAGE}</TableCaption>
              </Table>
            </ScrollArea>

            <div className="flex justify-center gap-2 mt-2">
              <Button
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    size="sm"
                    variant={page === currentPage ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}
              <Button
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
            </div>
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-[700px] w-full max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {dialogMode === "create"
                  ? "Cadastrar Consulta"
                  : dialogMode === "edit"
                  ? "Editar Consulta"
                  : "Reagendar Consulta"}
              </DialogTitle>
              <DialogDescription>Preencha todos os campos.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col gap-1">
                  <Label>Data *</Label>
                  <Input
                    type="date"
                    value={newDate}
                    min={today}
                    onChange={handleDateChange}
                    required
                  />
                  {errors.date && <p className="text-red-600 text-sm">{errors.date}</p>}
                </div>
                <div className="flex flex-col gap-1">
                  <Label>Hora *</Label>
                  <Input
                    type="time"
                    value={newTime}
                    min={newDate === today ? currentTime : "00:00"}
                    onChange={handleTimeChange}
                    required
                  />
                  {errors.time && <p className="text-red-600 text-sm">{errors.time}</p>}
                </div>
                <div className="flex flex-col gap-1 relative">
                  <Label>Médico *</Label>
                  <Input
                    type="text"
                    value={doctorSearch}
                    onChange={e => {
                      setDoctorSearch(e.target.value);
                      setSelectedDoctorId(null);
                    }}
                    onBlur={() => setTimeout(() => setDoctorResults([]), 200)}
                    placeholder="Digite nome ou CPF..."
                    required
                    readOnly={dialogMode === "create" && !!selectedDoctorId}
                  />
                  {doctorResults.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-white border z-10">
                      {doctorResults.map(doc => (
                        <div
                          key={doc.id_profissional}
                          className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                          onMouseDown={() => selectDoctor(doc)}
                        >
                          {doc.prof_nome} — CPF: {doc.prof_cpf}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1 relative">
                  <Label>Paciente *</Label>
                  <Input
                    type="text"
                    value={patientSearch}
                    onChange={e => {
                      setPatientSearch(e.target.value);
                      setSelectedPatientId(null);
                      setSelectedPatientCPF("");
                    }}
                    onBlur={() => setTimeout(() => setPatientResults([]), 200)}
                    placeholder="Digite nome ou CPF..."
                    required
                    readOnly={dialogMode === "create" && !!selectedPatientId}
                  />
                  {patientResults.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-white border z-10">
                      {patientResults.map(p => (
                        <div
                          key={p.id_paciente}
                          className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                          onMouseDown={() => selectPatient(p)}
                        >
                          {p.pac_nome} — CPF: {p.pac_cpf}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedPatientCPF && (
                  <div className="flex flex-col gap-1">
                    <Label>CPF</Label>
                    <Input value={selectedPatientCPF} readOnly />
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <Label>Tipo de Consulta *</Label>
                  <select
                    className="px-3 py-2 border rounded-md"
                    value={newSpecialtyId}
                    onChange={e => setNewSpecialtyId(Number(e.target.value))}
                    required
                  >
                    <option value="">Selecione...</option>
                    {allSpecialties.map(s => (
                      <option key={s.id_tipo_consulta} value={s.id_tipo_consulta}>
                        {s.tipoconsulta_nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={
                    !selectedDoctorId ||
                    !selectedPatientId ||
                    !!errors.date ||
                    !!errors.time
                  }
                >
                  {dialogMode === "reschedule" ? "Remarcar" : "Salvar"}
                </Button>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
}
