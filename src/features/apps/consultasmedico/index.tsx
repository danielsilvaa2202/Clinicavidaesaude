"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { TopNav } from "@/components/layout/top-nav";
import { ProfileDropdown } from "@/components/profile-dropdown";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TopNavLink {
  title: string;
  href: string;
  isActive: boolean;
  disabled: boolean;
}
interface Consultation {
  id_consulta: number;
  id_medico: number;
  id_paciente: number;
  consult_data: string;
  consult_hora: string;
  pac_nome: string;
  tipoconsulta_nome: string;
  id_consult_status: number;
}
interface ProcessedConsultation {
  id_consulta: number;
  id_medico: number;
  id_paciente: number;
  consult_data: string;
  consult_hora: string;
  patientName: string;
  specialty: string;
  id_consult_status: number;
}
interface Historico {
  id_histmed: number;
  hist_descricao: string;
  hist_data_ultima_alteracao: string;
}
interface AlergiaRow {
  id_histmed: number;
  alergia_nome: string;
  alergia_cid: string;
}
interface Prescricao {
  id_histmed: number;
  hist_prescricao: string;
}
interface MedHist {
  id_histmed: number;
  id_medicamento: number;
  medicamento_nome: string;
  medicamento_posologia: string;
  duracao: string;
}
interface MedList {
  id_medicamento: number;
  medicamento_nome: string;
}
interface DurList {
  id_duracao: number;
  descricao_duracao: string;
}
interface PosologiaOpt {
  id_posologia: number;
  descricao_posologia: string;
  posologia_livre: number;
}
interface DoencaRow {
  id_histmed: number;
  doenca_nome: string;
  doenca_cid: string;
}
interface DoencaFamiliar {
  id_histmed: number;
  id_doenca_familiar: number;
  doenca_familiar_nome: string;
  doenca_familiar_cid: string;
}
interface AlergiaOpt {
  id_alergia: number;
  alergia_nome: string;
  alergia_cid: string;
}
interface DoencaOpt {
  id_doenca: number;
  doenca_nome: string;
  doenca_cid: string;
}
interface DoencaFamOpt {
  id_doenca_familiar: number;
  doenca_familiar_nome: string;
  doenca_familiar_cid: string;
}

const STATUS_AGENDADA  = 1;
const STATUS_CONCLUIDA = 2;
const STATUS_PRESENCA  = 4;

const topNavLinks: TopNavLink[] = [
  { title: "Início", href: "/", isActive: true, disabled: false },
  { title: "Consultas", href: "/consultasgestao", isActive: true, disabled: false },
  { title: "Pacientes", href: "/pacientes", isActive: true, disabled: false },
];

function authFetch(input: RequestInfo, init: RequestInit = {}) {
  const token = localStorage.getItem("token");
  return fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...(init.headers || {}),
    },
  });
}

export default function ConsultaGestaoPage() {
  const [selectedMedicoId, setSelectedMedicoId] = useState<number>(1);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const [consultations, setConsultations] = useState<ProcessedConsultation[]>([]);
  const [selected, setSelected] = useState<ProcessedConsultation | null>(null);

  const [obs, setObs] = useState<string>("");

  const [historico, setHistorico] = useState<Historico[]>([]);
  const [alergias, setAlergias] = useState<AlergiaRow[]>([]);
  const [prescricoes, setPrescricoes] = useState<Prescricao[]>([]);
  const [medicamentosHistorico, setMedicamentosHistorico] = useState<MedHist[]>([]);
  const [doencas, setDoencas] = useState<DoencaRow[]>([]);
  const [doencasFamiliares, setDoencasFamiliares] = useState<DoencaFamiliar[]>([]);

  const [medicamentosList, setMedicamentosList] = useState<MedList[]>([]);
  const [duracoesList, setDuracoesList] = useState<DurList[]>([]);
  const [posologiasList, setPosologiasList] = useState<PosologiaOpt[]>([]);

  const [alergiasOpcoes, setAlergiasOpcoes] = useState<AlergiaOpt[]>([]);
  const [alergiaSuggestions, setAlergiaSuggestions] = useState<AlergiaOpt[]>([]);
  const [novaAlergiaName, setNovaAlergiaName] = useState<string>("");
  const [novaAlergiaId, setNovaAlergiaId] = useState<number | "">("");

  const [doencasOpcoes, setDoencasOpcoes] = useState<DoencaOpt[]>([]);
  const [doencaSuggestions, setDoencaSuggestions] = useState<DoencaOpt[]>([]);
  const [novaDoencaName, setNovaDoencaName] = useState<string>("");
  const [novaDoencaId, setNovaDoencaId] = useState<number | "">("");

  const [doencasFamOpcoes, setDoencasFamOpcoes] = useState<DoencaFamOpt[]>([]);
  const [doencaFamSuggestions, setDoencaFamSuggestions] = useState<DoencaFamOpt[]>([]);
  const [novaDoencaFamName, setNovaDoencaFamName] = useState<string>("");
  const [novaDoencaFamId, setNovaDoencaFamId] = useState<number | "">("");

  const [novaPrescricao, setNovaPrescricao] = useState<string>("");

  const [novaMedId, setNovaMedId] = useState<number | "">("");
  const [novaDurId, setNovaDurId] = useState<number | "">("");
  const [novaPosId, setNovaPosId] = useState<number | "livre" | "">("");
  const [textoPosLivre, setTextoPosLivre] = useState<string>("");

  const [medicos, setMedicos] = useState<{ id_medico: number; prof_nome: string }[]>([]);

  useEffect(() => {
    authFetch("/api/medicos")
      .then(r => r.json())
      .then(setMedicos)
      .catch(console.error);

    authFetch("/api/consultas")
      .then(r => r.json())
      .then((data: Consultation[]) =>
        setConsultations(
          data.map(c => ({
            id_consulta: c.id_consulta,
            id_medico: c.id_medico,
            id_paciente: c.id_paciente,
            consult_data: c.consult_data,
            consult_hora: c.consult_hora,
            patientName: c.pac_nome,
            specialty: c.tipoconsulta_nome,
            id_consult_status: c.id_consult_status,
          }))
        )
      )
      .catch(console.error);

    authFetch("/api/medicamentos")
      .then(r => r.json())
      .then(setMedicamentosList)
      .catch(console.error);

    authFetch("/api/duracoes")
      .then(r => r.json())
      .then(setDuracoesList)
      .catch(console.error);

    authFetch("/api/posologias")
      .then(r => r.json())
      .then(setPosologiasList)
      .catch(console.error);

    authFetch("/api/alergias")
      .then(r => r.json())
      .then(setAlergiasOpcoes)
      .catch(console.error);

    authFetch("/api/doencas")
      .then(r => r.json())
      .then(setDoencasOpcoes)
      .catch(console.error);

    authFetch("/api/doencasfamiliares")
      .then(r => r.json())
      .then(setDoencasFamOpcoes)
      .catch(console.error);
  }, []);

  async function carregarHistorico(consulta: ProcessedConsultation) {
    try {
      const res = await authFetch(`/api/historico-medico/paciente/${consulta.id_paciente}`);
      if (res.status === 404) {
        await authFetch("/api/historico-medico", {
          method: "POST",
          body: JSON.stringify({
            id_consulta: consulta.id_consulta,
            id_paciente: consulta.id_paciente,
            id_medico: consulta.id_medico,
            hist_descricao: "",
          }),
        });
        return carregarHistorico(consulta);
      }
      if (!res.ok) {
        console.error("Erro ao buscar histórico:", res.status, await res.text());
        return;
      }
      const data = await res.json();
      setHistorico(data.historicos || []);
      setAlergias(data.alergias || []);
      setPrescricoes(data.prescricoes || []);
      setMedicamentosHistorico(data.medicamentos || []);
      setDoencas(data.doencas || []);
      setDoencasFamiliares(data.doencas_familiares || []);
    } catch (err) {
      console.error("Falha na requisição de histórico:", err);
    }
  }

  async function handleSelect(c: ProcessedConsultation) {
  /* agora permite AGENDADA (1) **ou** PRESENÇA (4) */
  if (
    (c.id_consult_status !== STATUS_AGENDADA &&
     c.id_consult_status !== STATUS_PRESENCA) ||
    selected
  ) {
    return;
  }

  setSelected(c);
  setObs("");
  setHistorico([]);
  setAlergias([]);
  setPrescricoes([]);
  setMedicamentosHistorico([]);
  setDoencas([]);
  setDoencasFamiliares([]);

  await authFetch(`/api/consultas/${c.id_consulta}/inicio`, { method: "PATCH" });
  carregarHistorico(c);
}

  function handleCancel() {
    setSelected(null);
    setObs("");
    setHistorico([]);
    setAlergias([]);
    setPrescricoes([]);
    setMedicamentosHistorico([]);
    setDoencas([]);
    setDoencasFamiliares([]);
  }

  async function saveObs() {
    if (!selected) return;
    const res = await authFetch("/api/historico-medico", {
      method: "POST",
      body: JSON.stringify({
        id_consulta: selected.id_consulta,
        id_paciente: selected.id_paciente,
        id_medico: selected.id_medico,
        hist_descricao: obs,
      }),
    });
    if (res.ok) {
      setObs("");
      carregarHistorico(selected);
    } else {
      console.error("Erro ao salvar observação:", res.status, await res.text());
    }
  }

  function formatPtBr(iso: string) {
    return new Date(`${iso}T00:00:00`).toLocaleDateString("pt-BR");
  }

  function handleAlergiaChange(v: string) {
    setNovaAlergiaName(v);
    const l = v.toLowerCase();
    const list = alergiasOpcoes
      .filter(
        a =>
          a.alergia_nome.toLowerCase().includes(l) ||
          (a.alergia_cid ?? "").toLowerCase().includes(l)
      )
      .slice(0, 8);
    setAlergiaSuggestions(list);
    const exact = alergiasOpcoes.find(
      a =>
        a.alergia_nome.toLowerCase() === l ||
        (a.alergia_cid ?? "").toLowerCase() === l
    );
    setNovaAlergiaId(exact ? exact.id_alergia : "");
  }

  function handleDoencaChange(v: string) {
    setNovaDoencaName(v);
    const l = v.toLowerCase();
    const list = doencasOpcoes
      .filter(
        d =>
          d.doenca_nome.toLowerCase().includes(l) ||
          (d.doenca_cid ?? "").toLowerCase().includes(l)
      )
      .slice(0, 8);
    setDoencaSuggestions(list);
    const exact = doencasOpcoes.find(
      d =>
        d.doenca_nome.toLowerCase() === l ||
        (d.doenca_cid ?? "").toLowerCase() === l
    );
    setNovaDoencaId(exact ? exact.id_doenca : "");
  }

  function handleDoencaFamChange(v: string) {
    setNovaDoencaFamName(v);
    const l = v.toLowerCase();
    const list = doencasFamOpcoes
      .filter(
        d =>
          d.doenca_familiar_nome.toLowerCase().includes(l) ||
          (d.doenca_familiar_cid ?? "").toLowerCase().includes(l)
      )
      .slice(0, 8);
    setDoencaFamSuggestions(list);
    const exact = doencasFamOpcoes.find(
      d =>
        d.doenca_familiar_nome.toLowerCase() === l ||
        (d.doenca_familiar_cid ?? "").toLowerCase() === l
    );
    setNovaDoencaFamId(exact ? exact.id_doenca_familiar : "");
  }

  async function addAlergia() {
    if (!selected || !historico.length || !novaAlergiaId) return;
    const res = await authFetch(
      `/api/historico-medico/${historico[0].id_histmed}/alergias`,
      {
        method: "POST",
        body: JSON.stringify({ id_alergia: novaAlergiaId }),
      }
    );
    if (res.ok) {
      setNovaAlergiaName("");
      setNovaAlergiaId("");
      setAlergiaSuggestions([]);
      carregarHistorico(selected);
    } else {
      console.error("Erro ao adicionar alergia:", res.status, await res.text());
    }
  }

  async function addDoenca() {
    if (!selected || !historico.length || !novaDoencaId) return;
    const res = await authFetch(
      `/api/historico-medico/${historico[0].id_histmed}/doencas`,
      {
        method: "POST",
        body: JSON.stringify({ id_doenca: novaDoencaId }),
      }
    );
    if (res.ok) {
      setNovaDoencaName("");
      setNovaDoencaId("");
      setDoencaSuggestions([]);
      carregarHistorico(selected);
    } else {
      console.error("Erro ao adicionar doença:", res.status, await res.text());
    }
  }

  async function addDoencaFamiliar() {
    if (!selected || !historico.length || !novaDoencaFamId) return;
    const res = await authFetch(
      `/api/historico-medico/${historico[0].id_histmed}/doencasfamiliares`,
      {
        method: "POST",
        body: JSON.stringify({ id_doenca_familiar: novaDoencaFamId }),
      }
    );
    if (res.ok) {
      setNovaDoencaFamName("");
      setNovaDoencaFamId("");
      setDoencaFamSuggestions([]);
      carregarHistorico(selected);
    } else {
      console.error(
        "Erro ao adicionar doença familiar:",
        res.status,
        await res.text()
      );
    }
  }

  async function addPrescricao() {
    if (!selected || !historico.length || !novaPrescricao.trim()) return;
    const res = await authFetch(
      `/api/historico-medico/${historico[0].id_histmed}/prescricoes`,
      {
        method: "POST",
        body: JSON.stringify({ hist_prescricao: novaPrescricao }),
      }
    );
    if (res.ok) {
      setNovaPrescricao("");
      carregarHistorico(selected);
    } else {
      console.error("Erro ao adicionar prescrição:", res.status, await res.text());
    }
  }

  async function addMedicamento() {
    if (!selected || !historico.length || !novaMedId || !novaDurId || !novaPosId)
      return;

    const livre = novaPosId === "livre";
    const id_medicamento = Number(novaMedId);
    const id_duracao_med = Number(novaDurId);

    if (!id_medicamento || !id_duracao_med) {
      alert("Preencha todos os campos obrigatórios de medicamento.");
      return;
    }

    let body: any;
    if (livre) {
      if (!textoPosLivre.trim()) {
        alert("Por favor, informe a posologia livre.");
        return;
      }
      body = {
        id_medicamento,
        id_duracao_med,
        posologia_livre: 1,
        descricao_posologia: textoPosLivre.trim(),
      };
    } else {
      body = {
        id_medicamento,
        id_duracao_med,
        id_posologia: Number(novaPosId),
        posologia_livre: 0,
      };
    }

    const res = await authFetch(
      `/api/historico-medico/${historico[0].id_histmed}/medicamentos`,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );
    if (res.ok) {
      setNovaMedId("");
      setNovaDurId("");
      setNovaPosId("");
      setTextoPosLivre("");
      carregarHistorico(selected);
    } else {
      console.error("Erro ao adicionar medicamento:", res.status, await res.text());
    }
  }

  async function conclude() {
    if (!selected) return;
    const res = await authFetch(
      `/api/consultas/${selected.id_consulta}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ id_consult_status: STATUS_CONCLUIDA }),
      }
    );
    if (!res.ok) {
      console.error("Erro ao concluir consulta:", res.status, await res.text());
      return;
    }

    const emailRes = await authFetch(
      `/api/consultas/${selected.id_consulta}/enviar-feedback-email`,
      { method: "POST" }
    );
    window.alert(
      emailRes.ok
        ? "✅ Consulta concluída e e-mail de feedback enviado!"
        : "⚠️ Consulta concluída, mas falha no envio do e-mail."
    );
    handleCancel();
    authFetch("/api/consultas")
      .then(r => r.json())
      .then((data: Consultation[]) =>
        setConsultations(
          data.map(c => ({
            ...c,
            patientName: c.pac_nome,
            specialty: c.tipoconsulta_nome,
          }))
        )
      )
      .catch(console.error);
  }

  const filtered = consultations.filter(c => {
    if (c.id_medico !== selectedMedicoId) return false;
    const d = new Date(`${c.consult_data}T00:00:00`);
    if (dateFrom && d < new Date(`${dateFrom}T00:00:00`)) return false;
    if (dateTo && d > new Date(`${dateTo}T23:59:59`)) return false;
    return true;
  });

  const precisaTextoLivre = novaPosId === "livre";

  return (
    <>
      <Header>
        <TopNav links={topNavLinks} />
        <div className="ml-auto flex space-x-4">
          <ProfileDropdown />
        </div>
      </Header>

      <main className="p-4 space-y-6">
        <h1 className="text-3xl font-bold">Gestão de Consultas</h1>

        <Tabs defaultValue="agenda" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="agenda">Agenda</TabsTrigger>
              <TabsTrigger value="dados" disabled={!selected}>
                Dados
              </TabsTrigger>
              <TabsTrigger value="alergias" disabled={!selected}>
                Alergias
              </TabsTrigger>
              <TabsTrigger value="doencas" disabled={!selected}>
                Doenças
              </TabsTrigger>
              <TabsTrigger value="doencasfamiliares" disabled={!selected}>
                Doenças Familiares
              </TabsTrigger>
              <TabsTrigger value="prescricoes" disabled={!selected}>
                Prescrições
              </TabsTrigger>
              <TabsTrigger value="medicamentos" disabled={!selected}>
                Medicamentos
              </TabsTrigger>
            </TabsList>

            {selected && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button onClick={conclude}>Concluir</Button>
              </div>
            )}
          </div>

          {/* AGENDA */}
          <TabsContent value="agenda">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Agenda do Médico</CardTitle>
                <CardDescription>Selecione médico e intervalo.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <Label>Médico</Label>
                  <select
                    value={selectedMedicoId}
                    onChange={e => setSelectedMedicoId(Number(e.target.value))}
                    className="border px-2 py-1 rounded"
                  >
                    {medicos.length > 0 ? (
                      medicos.map(m => (
                        <option key={m.id_medico} value={m.id_medico}>
                          {m.prof_nome}
                        </option>
                      ))
                    ) : (
                      <option value="">Nenhum médico encontrado</option>
                    )}
                  </select>
                  <Label>De</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                  />
                  <Label>Até</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                  />
                </div>

                <ScrollArea className="h-[300px]">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Hora</TableHead>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Especialidade</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map(c => (
                        <TableRow key={c.id_consulta}>
                          <TableCell>{formatPtBr(c.consult_data)}</TableCell>
                          <TableCell>{c.consult_hora}</TableCell>
                          <TableCell>{c.patientName}</TableCell>
                          <TableCell>{c.specialty}</TableCell>
                          <TableCell>
  {c.id_consult_status === STATUS_CONCLUIDA
    ? "Concluída"
    : "Agendada"}   {/* 1 ou 4 aparecem como Agendada */}
</TableCell>
                          <TableCell>
                            <Button
  size="sm"
  variant="outline"
  /* agora permite seleção também quando status = PRESENÇA (4) */
  disabled={
    (c.id_consult_status !== STATUS_AGENDADA &&
     c.id_consult_status !== STATUS_PRESENCA) ||
    !!selected
  }
  onClick={() => handleSelect(c)}
>
  Selecionar
</Button>

                          </TableCell>
                        </TableRow>
                      ))}
                      {filtered.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center text-muted-foreground"
                          >
                            Nenhuma consulta
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DADOS */}
          <TabsContent value="dados">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Dados da Consulta</CardTitle>
                <CardDescription>
                  {selected
                    ? `#${selected.id_consulta} – ${selected.patientName}`
                    : "Selecione na agenda"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[150px] mb-4">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Descrição</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historico.map(h => (
                        <TableRow key={h.id_histmed}>
                          <TableCell>
                            {new Date(
                              h.hist_data_ultima_alteracao
                            ).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell>{h.hist_descricao}</TableCell>
                        </TableRow>
                      ))}
                      {historico.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center">
                            Sem histórico
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>

                <div className="space-y-2">
                  <Label>Nova Observação</Label>
                  <Textarea
                    value={obs}
                    onChange={e => setObs(e.target.value)}
                    placeholder="Descrever..."
                  />
                  <Button onClick={saveObs}>Salvar Observação</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ALERGIAS */}
          <TabsContent value="alergias">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Alergias</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[150px] mb-4">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Alergia</TableHead>
                        <TableHead>CID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alergias.map((a, i) => (
                        <TableRow key={i}>
                          <TableCell>{a.alergia_nome}</TableCell>
                          <TableCell>{a.alergia_cid}</TableCell>
                        </TableRow>
                      ))}
                      {alergias.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center">
                            Sem alergias
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>

                <div className="relative w-full max-w-sm">
                  <Input
                    placeholder="Digite alergia ou CID..."
                    value={novaAlergiaName}
                    onChange={e => handleAlergiaChange(e.target.value)}
                  />
                  {alergiaSuggestions.length > 0 && novaAlergiaName && (
                    <ul className="absolute bg-white border rounded mt-1 z-10 w-full max-h-40 overflow-y-auto">
                      {alergiaSuggestions.map(a => (
                        <li
                          key={a.id_alergia}
                          className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setNovaAlergiaName(a.alergia_nome);
                            setNovaAlergiaId(a.id_alergia);
                            setAlergiaSuggestions([]);
                          }}
                        >
                          {a.alergia_nome} ({a.alergia_cid})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <Button
                  className="mt-2"
                  onClick={addAlergia}
                  disabled={!novaAlergiaId}
                >
                  Adicionar
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DOENÇAS */}
          <TabsContent value="doencas">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Doenças</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[150px] mb-4">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Doença</TableHead>
                        <TableHead>CID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {doencas.map((d, i) => (
                        <TableRow key={i}>
                          <TableCell>{d.doenca_nome}</TableCell>
                          <TableCell>{d.doenca_cid}</TableCell>
                        </TableRow>
                      ))}
                      {doencas.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center">
                            Sem doenças registradas
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>

                <div className="relative w-full max-w-sm">
                  <Input
                    placeholder="Digite doença ou CID..."
                    value={novaDoencaName}
                    onChange={e => handleDoencaChange(e.target.value)}
                  />
                  {doencaSuggestions.length > 0 && novaDoencaName && (
                    <ul className="absolute bg-white border rounded mt-1 z-10 w-full max-h-40 overflow-y-auto">
                      {doencaSuggestions.map(d => (
                        <li
                          key={d.id_doenca}
                          className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setNovaDoencaName(d.doenca_nome);
                            setNovaDoencaId(d.id_doenca);
                            setDoencaSuggestions([]);
                          }}
                        >
                          {d.doenca_nome} ({d.doenca_cid})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <Button
                  className="mt-2"
                  onClick={addDoenca}
                  disabled={!novaDoencaId}
                >
                  Adicionar
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DOENÇAS FAMILIARES */}
          <TabsContent value="doencasfamiliares">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Doenças Familiares</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[150px] mb-4">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Doença Familiar</TableHead>
                        <TableHead>CID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {doencasFamiliares.map((d, i) => (
                        <TableRow key={i}>
                          <TableCell>{d.doenca_familiar_nome}</TableCell>
                          <TableCell>{d.doenca_familiar_cid}</TableCell>
                        </TableRow>
                      ))}
                      {doencasFamiliares.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center">
                            Sem registros
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>

                <div className="relative w-full max-w-sm">
                  <Input
                    placeholder="Digite doença familiar ou CID..."
                    value={novaDoencaFamName}
                    onChange={e => handleDoencaFamChange(e.target.value)}
                  />
                  {doencaFamSuggestions.length > 0 && novaDoencaFamName && (
                    <ul className="absolute bg-white border rounded mt-1 z-10 w-full max-h-40 overflow-y-auto">
                      {doencaFamSuggestions.map(d => (
                        <li
                          key={d.id_doenca_familiar}
                          className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setNovaDoencaFamName(d.doenca_familiar_nome);
                            setNovaDoencaFamId(d.id_doenca_familiar);
                            setDoencaFamSuggestions([]);
                          }}
                        >
                          {d.doenca_familiar_nome} ({d.doenca_familiar_cid})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <Button
                  className="mt-2"
                  onClick={addDoencaFamiliar}
                  disabled={!novaDoencaFamId}
                >
                  Adicionar
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PRESCRIÇÕES */}
          <TabsContent value="prescricoes">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Prescrições</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[150px] mb-4">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Prescrição</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prescricoes.map((p, i) => (
                        <TableRow key={i}>
                          <TableCell>{p.hist_prescricao}</TableCell>
                        </TableRow>
                      ))}
                      {prescricoes.length === 0 && (
                        <TableRow>
                          <TableCell className="text-center">
                            Sem prescrições
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>

                <div className="flex gap-2">
                  <Input
                    placeholder="Nova prescrição"
                    value={novaPrescricao}
                    onChange={e => setNovaPrescricao(e.target.value)}
                  />
                  <Button onClick={addPrescricao}>Adicionar</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MEDICAMENTOS */}
          <TabsContent value="medicamentos">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Medicamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[150px] mb-4">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medicamento</TableHead>
                        <TableHead>Posologia</TableHead>
                        <TableHead>Duração</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {medicamentosHistorico.map((m, i) => (
                        <TableRow key={i}>
                          <TableCell>{m.medicamento_nome}</TableCell>
                          <TableCell>{m.medicamento_posologia}</TableCell>
                          <TableCell>{m.duracao}</TableCell>
                        </TableRow>
                      ))}
                      {medicamentosHistorico.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center">
                            Sem medicamentos
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>

                <div className="flex flex-wrap gap-2">
                  <select
                    value={novaMedId}
                    onChange={e => setNovaMedId(e.target.value ? Number(e.target.value) : "")}
                    className="border px-2 py-1 rounded"
                  >
                    <option value="">Medicamento…</option>
                    {medicamentosList.map(m => (
                      <option key={m.id_medicamento} value={m.id_medicamento}>
                        {m.medicamento_nome}
                      </option>
                    ))}
                  </select>

                  <select
                    value={novaPosId}
                    onChange={e => {
                      const v = e.target.value;
                      setNovaPosId(v === "" ? "" : v === "livre" ? "livre" : Number(v));
                      setTextoPosLivre("");
                    }}
                    className="border px-2 py-1 rounded"
                    disabled={!novaMedId}
                  >
                    <option value="">Posologia…</option>
                    {posologiasList.map(p => (
                      <option key={p.id_posologia} value={p.id_posologia}>
                        {p.descricao_posologia}
                      </option>
                    ))}
                    <option value="livre">Outra (livre)</option>
                  </select>

                  {precisaTextoLivre && (
                    <Input
                      placeholder="Digite a posologia"
                      value={textoPosLivre}
                      onChange={e => setTextoPosLivre(e.target.value)}
                      className="w-48"
                    />
                  )}

                  <select
                    value={novaDurId}
                    onChange={e => setNovaDurId(e.target.value ? Number(e.target.value) : "")}
                    className="border px-2 py-1 rounded"
                    disabled={!novaMedId}
                  >
                    <option value="">Duração…</option>
                    {duracoesList.map(d => (
                      <option key={d.id_duracao} value={d.id_duracao}>
                        {d.descricao_duracao}
                      </option>
                    ))}
                  </select>

                  <Button
                    onClick={addMedicamento}
                    disabled={
                      !novaMedId ||
                      !novaDurId ||
                      !novaPosId ||
                      (precisaTextoLivre && !textoPosLivre)
                    }
                  >
                    Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
