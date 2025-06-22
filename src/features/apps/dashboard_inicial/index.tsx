"use client";
import React, { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { Header } from "@/components/layout/header";
import { TopNav } from "@/components/layout/top-nav";
import { ProfileDropdown } from "@/components/profile-dropdown";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DateRangePicker, DateRange } from "@/components/ui/date-range-picker";
import { ChartContainer } from "@/components/ui/chart";
import {
  PieChart,
  Pie,
  Cell,
  Label,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  LabelList,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import {
  Users,
  CalendarDays,
  Stethoscope,
  ArrowUpRight,
  Download,
} from "lucide-react";
import * as XLSX from "xlsx";

type Row = Record<string, any>;
type Rows = Row[];

interface DonutRow {
  label: string;
  total: number;
  fill: string;
}

interface Especialidade {
  especialidade: string;
  total: number;
  fill?: string;
}

const palette = {
  chart1: "hsl(var(--chart-1))",
  chart2: "hsl(var(--chart-2))",
  chart3: "hsl(var(--chart-3))",
  chart4: "hsl(var(--chart-4))",
  chart5: "hsl(var(--chart-5))",
  chart6: "hsl(var(--chart-6))",
  chart7: "hsl(var(--chart-7))",
  chart8: "hsl(var(--chart-8))",
  chart9: "hsl(var(--chart-9))",
  chart10: "hsl(var(--chart-10))",
};

const chartColors = Object.values(palette);
const generoColors: Record<string, string> = {
  F: "#f472b6",
  M: "#60a5fa",
  O: "#facc15",
  ND: "#64748b",
};
const generoLabels: Record<string, string> = {
  F: "Feminino",
  M: "Masculino",
  O: "Outro",
  ND: "ND",
};
const ativoColors: Record<string, string> = {
  Ativos: palette.chart3,
  Inativos: palette.chart4,
};
const statusColors: Record<string, string> = {
  "Agendada": "#e47458",            
  "Concluída": "#2c9c95",           
  "Presença Confirmada": "#22c55e", 
  "Remarcada": "#ffce56",           
  "Cancelada": "#ff9f40",          
  "Ausência": "#e8c468",            
  "ND": "#c9cbcf",                  
};

const feedbackColors: Record<string, string> = {
  "1": "#ef4444",
  "2": "#ef4444",
  "3": "#facc15",
  "4": "#22c55e",
  "5": "#22c55e",
};

const dowMap: Record<string, string> = {
  Sunday: "Dom",
  Monday: "Seg",
  Tuesday: "Ter",
  Wednesday: "Qua",
  Thursday: "Qui",
  Friday: "Sex",
  Saturday: "Sáb",
};

const mockEspecialidades: Especialidade[] = [
  { especialidade: "Cardiologia", total: 1, fill: chartColors[0] },
  { especialidade: "Clínica Geral", total: 1, fill: chartColors[1] },
  { especialidade: "Dermatologia", total: 1, fill: chartColors[2] },
  { especialidade: "Ginecologia", total: 1, fill: chartColors[3] },
  { especialidade: "Pediatria", total: 1, fill: chartColors[4] },
];

const iso = (d: Date) => format(d, "yyyy-MM-dd");

const api = async <T,>(path: string): Promise<T> => {
  const tryFetch = async (p: string) => {
    const r = await fetch(p);
    if (!r.ok) throw new Error();
    return r.json();
  };
  try {
    return await tryFetch(`/api${path}`);
  } catch {
    return tryFetch(path);
  }
};

const download = (url: string) => window.open(url, "_blank");

const exportExcel = (
  name: string,
  data: Rows,
  map: Record<string, string> = {},
) => {
  const rows = data.map((r) => {
    const o: Row = {};
    for (const [k, v] of Object.entries(r)) o[map[k] || k] = v;
    return o;
  });
  const ws = XLSX.utils.json_to_sheet(rows);
  const rng = XLSX.utils.decode_range(ws["!ref"] || "");
  for (let c = 0; c <= rng.e.c; c++) {
    const cell = ws[XLSX.utils.encode_cell({ r: 0, c })];
    if (cell)
      cell.s = {
        font: { bold: true, color: { rgb: "FFFFFFFF" } },
        fill: { fgColor: { rgb: "FF2594AD" } },
      };
  }
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, name);
  XLSX.writeFile(wb, `${name}.xlsx`);
};

export default function DashboardPage() {
  const today = new Date();
  const firstPrev = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const [range, setRange] = useState<DateRange>({
    from: firstPrev,
    to: today,
  });
  const [loading, setLoading] = useState(true);
  const [pacAtivo, setPacAtivo] = useState<DonutRow[]>([]);
  const [pacNovo, setPacNovo] = useState<Rows>([]);
  const [pacGenero, setPacGenero] = useState<DonutRow[]>([]);
  const [pacFaixa, setPacFaixa] = useState<Rows>([]);
  const [pacTotais, setPacTotais] = useState({ total: 0, ativos: 0 });
  const [profBasic, setProfBasic] = useState<{
    total: number;
    ativos: number;
    inativos: number;
    media_idade: number;
  } | null>(null);
  const [profCargo, setProfCargo] = useState<Rows>([]);
  const [profGenero, setProfGenero] = useState<DonutRow[]>([]);
  const [profFaixa, setProfFaixa] = useState<Rows>([]);
  const [profAtivoDonut, setProfAtivoDonut] = useState<DonutRow[]>([]);
  const [profEspecialidades, setProfEspecialidades] = useState<Especialidade[]>(mockEspecialidades);
  const [consultas, setConsultas] = useState<any | null>(null);
  const [tipoGenero, setTipoGenero] = useState<Rows>([]);
  const [feedbackDonut, setFeedbackDonut] = useState<DonutRow[]>([]);
  const [medicamentos, setMedicamentos] = useState<Rows>([]);
  const [doencas, setDoencas] = useState<Rows>([]);
  const [alergias, setAlergias] = useState<Rows>([]);
  const [doencasFamiliares, setDoencasFamiliares] = useState<Rows>([]);
  const [posologias, setPosologias] = useState<Rows>([]);

  const feedbackColorsCat: Record<string,string> = {
  Ruins:     "#ef4444",
  Regulares: "#facc15",
  Boas:      "#22c55e",
};

  const fetchAll = useCallback(() => {
  setLoading(true);
  const qs = `?ini=${iso(range.from)}&fim=${iso(range.to)}`;

  Promise.allSettled([
    api<Rows>(`/pacientes-novos${qs}`),
    api<Rows>("/pacientes-genero"),
    api<Record<string, number>>("/pacientes-faixa"),
    api<{ Ativos: number; Inativos: number }>("/pacientes-ativos"),
    api("/profissionais-basicos"),
    api("/profissionais-cargo"),
    api<Rows>("/profissionais-genero"),
    api<Record<string, number>>("/profissionais-faixa"),
    api<Especialidade[]>("/profissionais-especialidades"),
    api<any>(`/consultas-basicos${qs}`),
    api<Record<string, number>>(`/feedback-agg${qs}`),
    api<Rows>(`/consultas-tipo-genero${qs}`),
    api("/medicamentos"),
    api("/doencas"),
    api("/alergias"),
    api("/doencasfamiliares"),
    api("/posologias"),
  ]).then((res) => {
    const get = <T,>(i: number, fb: T): T =>
      res[i].status === "fulfilled"
        ? (res[i] as PromiseFulfilledResult<T>).value
        : fb;

    setPacNovo(get<Rows>(0, [] as Rows));
    setPacGenero(
      get<Rows>(1, [] as Rows).map((g: Row) => ({
        label: generoLabels[g.genero as string] ?? g.genero,
        total: Number(g.total),
        fill: generoColors[g.genero as string] ?? palette.chart5,
      })),
    );
    setPacFaixa(
      Object.entries(get<Record<string, number>>(2, {})).map(
        ([faixa, total]) => ({ faixa, total: Number(total) }),
      ),
    );
    const act = get<{ Ativos: number; Inativos: number }>(3, {
      Ativos: 0,
      Inativos: 0,
    });
    setPacTotais({ total: act.Ativos + act.Inativos, ativos: act.Ativos });
    setPacAtivo(
      Object.entries(act).map(([k, v]) => ({
        label: k,
        total: Number(v),
        fill: ativoColors[k],
      })),
    );

    const pb = get<any>(4, {
      total: 0,
      ativos: 0,
      inativos: 0,
      media_idade: 0,
    });
    setProfBasic(pb);
    setProfCargo(get<Rows>(5, [] as Rows));
    setProfGenero(
      get<Rows>(6, [] as Rows).map((g: Row) => ({
        label: generoLabels[g.genero as string] ?? g.genero,
        total: Number(g.total),
        fill: generoColors[g.genero as string] ?? palette.chart5,
      })),
    );
    setProfFaixa(
      Object.entries(get<Record<string, number>>(7, {})).map(
        ([faixa, total]) => ({ faixa, total: Number(total) }),
      ),
    );
    setProfAtivoDonut([
      { label: "Ativos", total: pb.ativos, fill: ativoColors.Ativos },
      { label: "Inativos", total: pb.inativos, fill: ativoColors.Inativos },
    ]);

    const especialidades = get<Especialidade[]>(8, []);
    setProfEspecialidades(
      (especialidades.length ? especialidades : mockEspecialidades).map(
        (e, i) => ({
          ...e,
          total: Number(e.total),
          fill: chartColors[i % chartColors.length],
        }),
      ),
    );

    const cons = get<any>(9, null);
    if (cons) {
      cons.dow = cons.dow.map((d: any) => ({
        ...d,
        dow: dowMap[d.dow] ?? d.dow,
        total: Number(d.total),
      }));
    }
    setConsultas(cons);

    const fbAgg = get<Record<string, number>>(10, {});
    setFeedbackDonut(
      Object.entries(fbAgg)
        .filter(([, v]) => Number(v) > 0)
        .map(([label, total]) => ({
          label,
          total: Number(total),
          fill: feedbackColorsCat[label] ?? palette.chart5,
        })),
    );

    setTipoGenero(
      get<Rows>(11, [] as Rows).map((r: Row) => ({
        ...r,
        F: Number(r.F ?? 0),
        M: Number(r.M ?? 0),
        O: Number(r.O ?? 0),
        ND: Number(r.ND ?? 0),
      })),
    );

    setMedicamentos(get<Rows>(12, [] as Rows));
    setDoencas(get<Rows>(13, [] as Rows));
    setAlergias(get<Rows>(14, [] as Rows));
    setDoencasFamiliares(get<Rows>(15, [] as Rows));
    setPosologias(get<Rows>(16, [] as Rows));
    setLoading(false);
  });
}, [range]);

  useEffect(fetchAll, [fetchAll]);

  if (loading || !profBasic || !consultas)
    return (
      <div className="h-screen flex items-center justify-center">
        Carregando…
      </div>
    );

  const qs = `?ini=${iso(range.from)}&fim=${iso(range.to)}`;
  const exportPacientes = () => download(`/api/export/pacientes${qs}`);
  const exportProfissionais = () => download(`/api/export/profissionais`);

  return (
    <>
      <Header>
        <TopNav links={[{ title: "Dashboard", href: "/", isActive: true }]} />
        <ProfileDropdown />
      </Header>
      <main className="p-4 space-y-8">
        <h1 className="text-3xl font-bold">Dashboard Clínico</h1>
        <Tabs defaultValue="consultas">
          <TabsList className="flex-wrap mb-4">
            <TabsTrigger value="consultas">Consultas</TabsTrigger>
            <TabsTrigger value="pacientes">Pacientes</TabsTrigger>
            <TabsTrigger value="profissionais">Profissionais</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>
          <TabsContent value="consultas">
            <DateRangePicker
              value={range}
              onChange={setRange}
              className="mb-6"
            />
            <div className="flex items-center gap-2 mb-4">
              <StatCard
                icon={<CalendarDays />}
                label="Consultas"
                value={consultas.total}
              />
              <StatCard
                icon={<ArrowUpRight />}
                label="Duração média (min)"
                value={consultas.duracao}
              />
              <Button
                size="sm"
                variant="secondary"
                className="ml-auto"
                onClick={() => download(`/api/export/consultas${qs}`)}
              >
                <Download className="h-4 w-4 mr-1" /> Exportar lista completa
              </Button>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <DonutCard
                title="Status"
                data={consultas.status.map((s: any) => ({
                  label: s.status,
                  total: s.total,
                  fill: statusColors[s.status] ?? palette.chart5,
                }))}
              />
              <BarCard
                title="Tipo de consulta"
                data={consultas.tipo}
                dataKey="total"
                labelKey="tipo"
              />
            </div>
            <div className="grid gap-6 mt-6 lg:grid-cols-2">
              <LineCard
                title="Consultas por dia"
                data={consultas.dia}
                dataKey="total"
                labelKey="rotulo"
              />
              <BarCard
                title="Por dia da semana"
                data={consultas.dow}
                dataKey="total"
                labelKey="dow"
              />
            </div>
            <div className="grid gap-6 mt-6 lg:grid-cols-2">
              <BarCard
                title="Faixa etária dos pacientes"
                data={Object.entries(consultas.idade_paciente).map(
                  ([faixa, total]) => ({
                    faixa,
                    total,
                  }),
                )}
                dataKey="total"
                labelKey="faixa"
              />
              <BarCard
                title="Faixa etária dos médicos"
                data={Object.entries(consultas.idade_medico).map(
                  ([faixa, total]) => ({
                    faixa,
                    total,
                  }),
                )}
                dataKey="total"
                labelKey="faixa"
              />
            </div>
            <div className="grid gap-6 mt-6 lg:grid-cols-2">
              <DonutCard
                title="Gênero do paciente"
                data={consultas.genero_paciente.map((g: any) => ({
                  label: generoLabels[g.genero] ?? g.genero,
                  total: g.total,
                  fill: generoColors[g.genero] ?? palette.chart5,
                }))}
              />
              <MultiBarCard
                title="Tipo de consulta por gênero"
                data={tipoGenero}
                keys={["F", "M", "O", "ND"]}
                labelKey="tipo"
              />
            </div>
            <div className="grid gap-6 mt-6 lg:grid-cols-2">
              <DonutCard title="Feedbacks" data={feedbackDonut} />
            </div>
          </TabsContent>
          <TabsContent value="pacientes">
            <div className="flex items-center gap-2 mb-4">
              <StatCard
                icon={<Users />}
                label="Pacientes"
                value={pacTotais.total}
              />
              <StatCard
                icon={<Users />}
                label="Ativos"
                value={pacTotais.ativos}
              />
              <Button
                size="sm"
                variant="secondary"
                className="ml-auto"
                onClick={exportPacientes}
              >
                <Download className="h-4 w-4 mr-1" /> Exportar lista completa
              </Button>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <DonutCard title="Ativos vs Inativos" data={pacAtivo} />
              <DonutCard title="Por gênero" data={pacGenero} />
            </div>
            <div className="grid gap-6 mt-6 lg:grid-cols-2">
              <AreaCard
                title="Novos pacientes"
                data={pacNovo}
                dataKey="total"
                labelKey="rotulo"
              />
              <BarCard
                title="Faixa etária"
                data={pacFaixa}
                dataKey="total"
                labelKey="faixa"
              />
            </div>
          </TabsContent>
          <TabsContent value="profissionais">
            <div className="flex items-center gap-2 mb-4">
              <StatCard
                icon={<Stethoscope />}
                label="Profissionais"
                value={profBasic.total}
              />
              <StatCard
                icon={<Stethoscope />}
                label="Ativos"
                value={profBasic.ativos}
              />
              <StatCard
                icon={<Stethoscope />}
                label="Inativos"
                value={profBasic.inativos}
              />
              <StatCard
                icon={<Stethoscope />}
                label="Média idade"
                value={profBasic.media_idade}
              />
              <Button
                size="sm"
                variant="secondary"
                className="ml-auto"
                onClick={exportProfissionais}
              >
                <Download className="h-4 w-4 mr-1" /> Exportar lista completa
              </Button>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              <DonutCard title="Ativos vs Inativos" data={profAtivoDonut} />
              <DonutCard title="Por gênero" data={pacGenero} />
              <DonutCard
                title="Médicos, Enfermeiros e Outros"
                data={[
                  {
                    label: "Médicos",
                    total:
                      profCargo.find((c) => c.cargo === "Médico")?.total ?? 0,
                    fill: palette.chart1,
                  },
                  {
                    label: "Enfermeiros",
                    total:
                      profCargo.find((c) => c.cargo === "Enfermeiro")?.total ??
                      0,
                    fill: palette.chart2,
                  },
                  {
                    label: "Outros",
                    total:
                      profBasic.total -
                      (profCargo.find((c) => c.cargo === "Médico")?.total ?? 0) -
                      (profCargo.find((c) => c.cargo === "Enfermeiro")?.total ??
                        0),
                    fill: palette.chart3,
                  },
                ]}
              />
            </div>
            <div className="grid gap-6 mt-6 lg:grid-cols-1">
              <BarCard
                title="Faixa etária"
                data={profFaixa}
                dataKey="total"
                labelKey="faixa"
              />
              <BarCard
                title="Especialidades dos Médicos"
                data={profEspecialidades}
                dataKey="total"
                labelKey="especialidade"
                className="w-full"
              />
            </div>
          </TabsContent>
          <TabsContent value="relatorios">
            <div className="grid gap-6 lg:grid-cols-2">
              <SimpleListStat
                icon={<Download />}
                label="Medicamentos"
                rows={medicamentos}
                file="Medicamentos"
                map={{
                  id_medicamento: "ID",
                  medicamento_nome: "Medicamento",
                  posologias: "Posologias",
                }}
              />
              <SimpleListStat
                icon={<Download />}
                label="Doenças"
                rows={doencas}
                file="Doenças"
                map={{
                  id_doenca: "ID",
                  doenca_nome: "Doença",
                  doenca_cid: "CID",
                }}
              />
              <SimpleListStat
                icon={<Download />}
                label="Doenças Familiares"
                rows={doencasFamiliares}
                file="DoençasFamiliares"
                map={{
                  id_doenca_familiar: "ID",
                  doenca_familiar_nome: "Doença Familiar",
                  doenca_familiar_cid: "CID",
                }}
              />
              <SimpleListStat
                icon={<Download />}
                label="Alergias"
                rows={alergias}
                file="Alergias"
                map={{
                  id_alergia: "ID",
                  alergia_nome: "Alergia",
                  alergia_cid: "CID",
                }}
              />
              <SimpleListStat
                icon={<Download />}
                label="Posologias"
                rows={posologias.map((p) => ({
                  ...p,
                  posologia_livre: p.posologia_livre ? "Sim" : "Não",
                }))}
                file="Posologias"
                map={{
                  id_posologia: "ID",
                  descricao_posologia: "Descrição",
                  posologia_livre: "Livre",
                }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}

function SimpleListStat({
  icon,
  label,
  rows,
  file,
  map,
}: {
  icon: React.ReactNode;
  label: string;
  rows: Rows;
  file: string;
  map: Record<string, string>;
}) {
  return rows.length ? (
    <div className="flex items-center gap-2">
      <StatCard icon={icon} label={label} value={rows.length} />
      <Button
        size="sm"
        variant="secondary"
        className="ml-auto"
        onClick={() => exportExcel(file, rows, map)}
      >
        <Download className="h-4 w-4 mr-1" /> Exportar Excel
      </Button>
    </div>
  ) : (
    <p className="text-center py-10 w-full">
      Sem dados de {label.toLowerCase()}.
    </p>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <Card className="flex-1">
      <CardHeader className="flex-row items-center gap-2">
        {icon}
        <div>
          <CardTitle>{value}</CardTitle>
          <CardDescription>{label}</CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}

interface ChartCardCommon {
  title: string;
  className?: string;
}

function DonutCard({
  title,
  data,
  className,
}: {
  title: string;
  data: DonutRow[];
  className?: string;
}) {
  if (!data.some((d) => d.total > 0))
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-10">Sem dados</p>
        </CardContent>
      </Card>
    );

  const total = data.reduce((s, r) => s + r.total, 0);

  const pieLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    value,
  }: {
    cx: number;
    cy: number;
    midAngle: number;
    outerRadius: number;
    value: number;
  }) => {
    const a = (-midAngle * Math.PI) / 180;
    const r = outerRadius + 12;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    return (
      <text
        x={x}
        y={y}
        fontSize="12"
        fill="#333"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {value}
      </text>
    );
  };

  /* rótulo central – tipado como função comum */
  const renderCenter = ({ viewBox }: any): React.JSX.Element => (
    <text
      x={viewBox.cx}
      y={viewBox.cy}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize="20"
      fontWeight={600}
      fill="#333"
    >
      {total}
    </text>
  );

  return (
    <Card className={className}>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          className="w-full aspect-square overflow-visible"
          config={{}}
        >
          <ResponsiveContainer>
            <PieChart>
              <Legend
                verticalAlign="bottom"
                height={48}
                wrapperStyle={{ fontSize: 12 }}
                payload={data.map((d) => ({
                  value: d.label,
                  id: d.label,
                  type: "square",
                  color: d.fill,
                }))}
              />
              <Pie
                data={data}
                dataKey="total"
                nameKey="label"
                innerRadius={60}
                outerRadius={100}
                label={pieLabel}
                labelLine={false}
              >
                <Label content={renderCenter} position="center" />
                {data.map((d, i) => (
                  <Cell key={i} fill={d.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function LineCard({
  title,
  data,
  dataKey,
  labelKey,
}: ChartCardCommon & { data: Rows; dataKey: string; labelKey: string }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer className="w-full overflow-visible" config={{}}>
          <ResponsiveContainer height={250}>
            <LineChart data={data} margin={{ top: 20, bottom: 40 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey={labelKey} tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[0, (d: number) => Math.ceil(d * 1.15)]} />
              <Line type="monotone" dataKey={dataKey} stroke={palette.chart2} strokeWidth={3} dot={{ r: 3 }}>
                <LabelList dataKey={dataKey} position="top" formatter={(v: number) => v} />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function AreaCard({
  title,
  data,
  dataKey,
  labelKey,
}: ChartCardCommon & { data: Rows; dataKey: string; labelKey: string }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer className="w-full overflow-visible" config={{}}>
          <ResponsiveContainer height={250}>
            <AreaChart data={data} margin={{ top: 20, bottom: 40 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey={labelKey} tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[0, (d: number) => Math.ceil(d * 1.15)]} />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={palette.chart1}
                fill={palette.chart1}
                fillOpacity={0.25}
              >
                <LabelList dataKey={dataKey} position="top" formatter={(v: number) => v} />
              </Area>
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
function BarCard({
  title,
  data,
  dataKey,
  labelKey,
  horizontal,
  className,
}: ChartCardCommon & {
  data: Rows;
  dataKey: string;
  labelKey: string;
  horizontal?: boolean;
}) {
  // Mantém o console.debug se quiser
  console.log(`Renderizando BarCard ${title}:`, JSON.stringify(data, null, 2));

  const clean = data.filter((d) => d[dataKey] > 0);
  const chartData = clean.length ? clean : data;

  if (!chartData.length) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-10">Sem dados para {title.toLowerCase()}</p>
        </CardContent>
      </Card>
    );
  }

  // aqui você ajusta o espaço no topo: aumentei para 100
  const margins = horizontal
    ? { top: 100, left: 12, right: 24, bottom: 30 }
    : { top: 130, right: 24, bottom: 60 };

  const height = horizontal
    ? Math.max(200, chartData.length * 30)
    : 300;

  return (
    <Card className={className}>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 pb-8">
        <ChartContainer className="w-full overflow-visible" config={{}}>
          <ResponsiveContainer height={height}>
            <BarChart
              data={chartData}
              layout={horizontal ? "vertical" : "horizontal"}
              margin={margins}
            >
              {horizontal ? (
                <>
                  <XAxis type="number" domain={[0, (d: number) => Math.ceil(d * 1.3) + 1]} hide />
                  <YAxis
                    type="category"
                    dataKey={labelKey}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    width={120}
                  />
                </>
              ) : (
                <>
                  <XAxis
                    dataKey={labelKey}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    domain={[0, (d: number) => Math.ceil(d * 1.15)]}
                  />
                </>
              )}
              <CartesianGrid vertical={false} />
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{ fontSize: 12 }}
                payload={chartData.map((d, i) => ({
                  value: d[labelKey],
                  id: d[labelKey],
                  type: "square",
                  color: d.fill || chartColors[i % chartColors.length],
                }))}
              />
              <Bar dataKey={dataKey} radius={4}>
                <LabelList
                  dataKey={dataKey}
                  position={horizontal ? "right" : "top"}
                  dy={-15}
                  formatter={(v: number) => (v ? v : "")}
                />
                {chartData.map((d, i) => (
                  <Cell key={i} fill={d.fill || chartColors[i % chartColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}


function MultiBarCard({
  title,
  data,
  keys,
  labelKey,
  className,
}: {
  title: string;
  data: Rows;
  keys: string[];
  labelKey: string;
  className?: string;
}) {
  if (!data.length)
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-10">Sem dados</p>
        </CardContent>
      </Card>
    );

  const totals = data.map((d: any) =>
    keys.reduce((s, k) => s + Number(d[k] ?? 0), 0),
  );

  return (
    <Card className={className}>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer className="w-full overflow-visible" config={{}}>
          <ResponsiveContainer height={300}>
            <BarChart data={data} margin={{ top: 40, right: 24, bottom: 60 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey={labelKey}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                domain={[0, (d: number) => Math.ceil(d * 1.15)]}
              />
              <Legend
                verticalAlign="bottom"
                height={48}
                wrapperStyle={{ fontSize: 12 }}
              />
              {keys.map((k, idx) => (
                <Bar
                  key={k}
                  dataKey={k}
                  stackId="a"
                  radius={2}
                  fill={
                    generoColors[k] ?? chartColors[idx % chartColors.length]
                  }
                  name={generoLabels[k] ?? k}
                >
                  <LabelList
                    dataKey={k}
                    position="center"
                    formatter={(value: number) => (value > 0 ? value : '')}
                  />
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}