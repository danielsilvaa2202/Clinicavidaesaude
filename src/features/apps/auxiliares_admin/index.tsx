"use client";

import React, { useEffect, useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { FileSpreadsheet } from "lucide-react";
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
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Header } from "@/components/layout/header";
import { TopNav } from "@/components/layout/top-nav";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Separator } from "@/components/ui/separator";

interface Especialidade {
  id_especialidade: number;
  espec_nome: string;
}
interface TipoConsulta {
  id_tipo_consulta: number;
  tipoconsulta_nome: string;
}
interface StatusConsulta {
  id_consult_status: number;
  status_consulta: string;
}
interface Alergia {
  id_alergia: number;
  alergia_nome: string;
  alergia_cid: string;
}
interface Doenca {
  id_doenca: number;
  doenca_nome: string;
  doenca_cid: string;
}
interface DoencaFamiliar {
  id_doenca_familiar: number;
  doenca_familiar_nome: string;
  doenca_familiar_cid: string;
}
interface Medicamento {
  id_medicamento: number;
  medicamento_nome: string;
  posologia_livre: string;
}
interface Posologia {
  id_posologia: number;
  descricao_posologia: string;
}
interface Duracao {
  id_duracao: number;
  descricao_duracao: string;
}

const topNavLinks = [
  { title: "Início", href: "/", isActive: false, disabled: false },
  { title: "Profissionais", href: "/profissionais", isActive: false, disabled: false },
  { title: "Auxiliares", href: "/auxiliares", isActive: true, disabled: false }
];

const tabLabels: Record<string, string> = {
  Especialidades: "Especialidades",
  TiposConsulta: "Tipos de Consulta",
  StatusConsulta: "Status de Consulta",
  Alergias: "Alergias",
  Doencas: "Doenças",
  DoencasFamiliares: "Doenças Familiares",
  Medicamentos: "Medicamentos",
  Posologias: "Posologias",
  Duracoes: "Durações"
};

export default function AuxiliaresPage() {
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [tiposConsulta, setTiposConsulta] = useState<TipoConsulta[]>([]);
  const [statusConsulta, setStatusConsulta] = useState<StatusConsulta[]>([]);
  const [alergias, setAlergias] = useState<Alergia[]>([]);
  const [doencas, setDoencas] = useState<Doenca[]>([]);
  const [doencasFamiliares, setDoencasFamiliares] = useState<DoencaFamiliar[]>([]);
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [posologias, setPosologias] = useState<Posologia[]>([]);
  const [duracoes, setDuracoes] = useState<Duracao[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [nome, setNome] = useState("");
  const [campo2, setCampo2] = useState("");
  const [nomeError, setNomeError] = useState("");
  const [campo2Error, setCampo2Error] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("Especialidades");

  const [search, setSearch] = useState("");
  const [pageMap, setPageMap] = useState<Record<string, number>>({});
  const pageSize = 8;

  useEffect(fetchAll, []);

  function fetchAll() {
    fetch("/api/especialidades").then(r => r.json()).then(setEspecialidades);
    fetch("/api/tiposconsulta").then(r => r.json()).then(setTiposConsulta);
    fetch("/api/statusconsulta").then(r => r.json()).then(setStatusConsulta);
    fetch("/api/alergias").then(r => r.json()).then(setAlergias);
    fetch("/api/doencas").then(r => r.json()).then(setDoencas);
    fetch("/api/doencasfamiliares").then(r => r.json()).then(setDoencasFamiliares);
    fetch("/api/medicamentos").then(r => r.json()).then(setMedicamentos);
    fetch("/api/posologias").then(r => r.json()).then(setPosologias);
    fetch("/api/duracoes").then(r => r.json()).then(setDuracoes);
  }

  const apiMap: Record<string, string> = {
    Especialidades: "especialidades",
    TiposConsulta: "tiposconsulta",
    StatusConsulta: "statusconsulta",
    Alergias: "alergias",
    Doencas: "doencas",
    DoencasFamiliares: "doencasfamiliares",
    Medicamentos: "medicamentos",
    Posologias: "posologias",
    Duracoes: "duracoes"
  };

  const labelsMap: Record<string, { head: string[]; fields: string[] }> = {
    Especialidades: { head: ["ID", "Nome"], fields: ["id_especialidade", "espec_nome"] },
    TiposConsulta: { head: ["ID", "Tipo"], fields: ["id_tipo_consulta", "tipoconsulta_nome"] },
    StatusConsulta: { head: ["ID", "Status"], fields: ["id_consult_status", "status_consulta"] },
    Alergias: { head: ["ID", "Alergia", "CID"], fields: ["id_alergia", "alergia_nome", "alergia_cid"] },
    Doencas: { head: ["ID", "Doença", "CID"], fields: ["id_doenca", "doenca_nome", "doenca_cid"] },
    DoencasFamiliares: {
      head: ["ID", "Doença Familiar", "CID"],
      fields: ["id_doenca_familiar", "doenca_familiar_nome", "doenca_familiar_cid"]
    },
    Medicamentos: { head: ["ID", "Medicamento"], fields: ["id_medicamento", "medicamento_nome"] },
    Posologias: { head: ["ID", "Descrição"], fields: ["id_posologia", "descricao_posologia"] },
    Duracoes: { head: ["ID", "Duração"], fields: ["id_duracao", "descricao_duracao"] }
  };

  const datasets: Record<string, any[]> = {
    Especialidades: especialidades,
    TiposConsulta: tiposConsulta,
    StatusConsulta: statusConsulta,
    Alergias: alergias,
    Doencas: doencas,
    DoencasFamiliares: doencasFamiliares,
    Medicamentos: medicamentos,
    Posologias: posologias,
    Duracoes: duracoes
  };

  const filtered = useMemo(() => {
    const t = search.toLowerCase();
    return datasets[currentTab].filter(o =>
      Object.values(o).some(v => String(v).toLowerCase().includes(t))
    );
  }, [datasets, currentTab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = pageMap[currentTab] ?? 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const setPage = (n: number) => setPageMap(p => ({ ...p, [currentTab]: n }));

  const exportXlsx = () => {
    const ws = XLSX.utils.json_to_sheet(filtered);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, currentTab);
    XLSX.writeFile(wb, `${currentTab.toLowerCase()}_${Date.now()}.xlsx`);
  };

  const openCreate = (tab: string) => {
    setDialogMode("create");
    setSelectedId(null);
    setNome("");
    setCampo2("");
    setNomeError("");
    setCampo2Error("");
    setCurrentTab(tab);
    setDialogOpen(true);
  };

  const openEdit = (tab: string, id: number, data: any) => {
    setDialogMode("edit");
    setSelectedId(id);
    setNome(data.nome);
    setCampo2(data.campo2 || "");
    setNomeError(validateNome(data.nome, tab));
    setCampo2Error(validateCampo2(data.campo2 || "", tab));
    setCurrentTab(tab);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (selectedId == null) return;
    await fetch(`/api/${apiMap[currentTab]}/${selectedId}`, { method: "DELETE" });
    setAlertOpen(false);
    fetchAll();
  };

  const buildPayload = () => {
    switch (currentTab) {
      case "Alergias":
        return { alergia_nome: nome.trim(), alergia_cid: campo2.toUpperCase().trim() };
      case "Doencas":
        return { doenca_nome: nome.trim(), doenca_cid: campo2.toUpperCase().trim() };
      case "DoencasFamiliares":
        return {
          doenca_familiar_nome: nome.trim(),
          doenca_familiar_cid: campo2.toUpperCase().trim()
        };
      case "Posologias":
        return { descricao_posologia: nome.trim() };
      case "Duracoes":
        return { descricao_duracao: nome.trim() };
      default:
        return { [labelsMap[currentTab].fields[1]]: nome.trim() };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = apiMap[currentTab];
    const method = dialogMode === "create" ? "POST" : "PUT";
    const url =
      dialogMode === "create" ? `/api/${endpoint}` : `/api/${endpoint}/${selectedId}`;
    setDialogOpen(false);
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload())
    });
    fetchAll();
  };

  const namePatterns = {
    textOnly: {
      rx: /^(?=.{3,100}$)(?!.*\s{2})[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[ '-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/,
      msg: "3–100 letras; espaços simples/hífen/apóstrofo; sem números nem espaços duplos"
    },
    alphaNum: {
      rx: /^(?=.{3,100}$)[A-Za-zÀ-ÖØ-öø-ÿ0-9]+(?:[ '-][A-Za-zÀ-ÖØ-öø-ÿ0-9]+)*$/,
      msg: "3–100 alfanum.; espaços simples/hífen/apóstrofo"
    },
    posologia: {
      rx: /^(?=.{3,200}$)[A-Za-zÀ-ÖØ-öø-ÿ0-9 ()\/\-,\.]+$/,
      msg: "3–200 caracteres permitidos: letras, números, espaços, ()/-,."
    },
    duracao: {
      rx: /^(?=.*\d)(?=(.*[A-Za-zÀ-ÖØ-öø-ÿ]){3,})[A-Za-zÀ-ÖØ-öø-ÿ0-9 ]{4,50}$/,
      msg: "4–50 caracteres; ao menos 1 dígito e 3 letras; apenas alfanum. e espaços"
    },
    cid10: {
      rx: /^[A-TV-Z]\d{2}(?:\.\d{1,2})?$/,
      msg: "CID-10 inválido (ex: J30 ou E11.9)"
    }
  };

  const validateNome = (v: string, tab: string) => {
    const val = v.trim();
    if (!val) return "Campo obrigatório";
    let p = namePatterns.textOnly;
    if (tab === "Posologias") p = namePatterns.posologia;
    else if (tab === "Duracoes") p = namePatterns.duracao;
    else if (tab === "Medicamentos") p = namePatterns.alphaNum;
    return p.rx.test(val) ? "" : p.msg;
  };

  const validateCampo2 = (v: string, tab: string) => {
    if (!["Alergias", "Doencas", "DoencasFamiliares"].includes(tab)) return "";
    const val = v.trim();
    if (!val) return "CID obrigatório";
    return namePatterns.cid10.rx.test(val) ? "" : namePatterns.cid10.msg;
  };

  const onNomeChange = (v: string) => {
    setNome(v);
    setNomeError(validateNome(v, currentTab));
  };
  const onCampo2Change = (v: string) => {
    setCampo2(v);
    setCampo2Error(validateCampo2(v, currentTab));
  };

  const requiresCampo2 = ["Alergias", "Doencas", "DoencasFamiliares"].includes(currentTab);
  const isSubmitDisabled =
    !nome.trim() ||
    !!nomeError ||
    (requiresCampo2 && (!campo2.trim() || !!campo2Error));

  return (
    <>
      <Header>
        <TopNav links={topNavLinks} />
        <div className="ml-auto pr-4">
          <ProfileDropdown />
        </div>
      </Header>

      <main className="p-6">
        <h1 className="text-3xl font-bold mb-6">Cadastro Auxiliares - Administrador</h1>

        <Tabs
          value={currentTab}
          onValueChange={t => {
            setCurrentTab(t);
            setSearch("");
            setPage(1);
          }}
        >
          <TabsList className="flex gap-2 mb-4 overflow-x-auto max-w-full">
            {Object.keys(apiMap).map(tab => (
              <TabsTrigger key={tab} value={tab}>
                {tabLabels[tab]}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.keys(apiMap).map(tab => (
            <TabsContent key={tab} value={tab}>
              <Card className="shadow-md">
                <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex gap-2 items-center w-full">
                    <Input
                      placeholder="Pesquisar..."
                      value={search}
                      onChange={e => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      className="flex-1 md:w-72"
                    />
                    <Button variant="secondary" onClick={exportXlsx} className="flex gap-1">
                      <FileSpreadsheet size={16} /> XLSX
                    </Button>
                    <Button onClick={() => openCreate(tab)}>Adicionar</Button>
                  </div>
                </CardHeader>

                <Separator />

                <CardContent>
                  <ScrollArea className="max-h-[480px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {labelsMap[tab].head.map(h => (
                            <TableHead key={h}>{h}</TableHead>
                          ))}
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginated.map(item => (
                          <TableRow key={item[labelsMap[tab].fields[0]]}>
                            {labelsMap[tab].fields.map(f => (
                              <TableCell key={f}>{item[f]}</TableCell>
                            ))}
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    openEdit(tab, item[labelsMap[tab].fields[0]], {
                                      nome: item[labelsMap[tab].fields[1]],
                                      campo2: labelsMap[tab].fields[2]
                                        ? item[labelsMap[tab].fields[2]]
                                        : ""
                                    })
                                  }
                                >
                                  Editar
                                </Button>
                                <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Confirmar exclusão?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Esta ação não poderá ser desfeita.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={handleDelete}>
                                        Excluir
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableCaption>
                        Página {page} de {totalPages} — {filtered.length} registro(s)
                      </TableCaption>
                    </Table>
                  </ScrollArea>

                  <div className="flex gap-2 items-center mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Anterior
                    </Button>
                    <span className="text-sm">
                      Página {page} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      Avançar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Adicionar " : "Editar "}
              {tabLabels[currentTab]}
            </DialogTitle>
            <DialogDescription>Preencha os campos abaixo</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label>
                  {currentTab === "Duracoes"
                    ? "Duração *"
                    : currentTab === "Posologias"
                    ? "Descrição *"
                    : "Nome *"}
                </Label>
                <Input
                  value={nome}
                  onChange={e => onNomeChange(e.target.value)}
                  className={nomeError ? "border-red-500" : ""}
                />
                {nomeError && <span className="text-red-600 text-sm">{nomeError}</span>}
              </div>

              {requiresCampo2 && (
                <div className="flex flex-col gap-1">
                  <Label>CID *</Label>
                  <Input
                    value={campo2}
                    onChange={e => onCampo2Change(e.target.value)}
                    className={campo2Error ? "border-red-500" : ""}
                  />
                  {campo2Error && <span className="text-red-600 text-sm">{campo2Error}</span>}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isSubmitDisabled}>
                {dialogMode === "create" ? "Adicionar" : "Salvar"}
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
}
