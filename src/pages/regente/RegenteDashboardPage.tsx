"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, Users, GraduationCap, FileText, CalendarDays, ClipboardList } from "lucide-react";
import { toast } from "sonner";

import {
  getRegenteOverview,
  type RegenteOverviewResponse,
  type RegenteParallelSummary,
} from "@/api/regente";

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function RegenteDashboardPage() {
  const [data, setData] = useState<RegenteOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    try {
      const response = await getRegenteOverview();
      setData(response);
      setError(null);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err?.message ?? "No se pudo cargar el resumen del regente.";
      setError(message);
      toast.error(message);
    } finally {
      if (showLoader) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    void loadData(true);
  }, []);

  const parallels = useMemo<RegenteParallelSummary[]>(() => data?.parallels ?? [], [data]);

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Panel de Regente
            </h2>
            <p className="text-sm text-slate-600">
              Supervisión general de estudiantes, reportes y paralelos.
            </p>
          </div>
        </div>
        <Button
          onClick={() => void loadData(false)}
          disabled={refreshing || loading}
          variant="outline"
          className="border-slate-200 text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 text-red-700">
          <CardContent className="py-4 text-sm">
            {error}
          </CardContent>
        </Card>
      )}

      {loading || !data ? (
        <Card className="border-slate-200">
          <CardContent className="py-16 text-center text-slate-500">
            Cargando datos del regente...
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Estudiantes</CardTitle>
                <Users className="h-4 w-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{data.counts.students}</div>
                <p className="text-xs text-slate-600">Estudiantes activos</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Profesores</CardTitle>
                <GraduationCap className="h-4 w-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{data.counts.teachers}</div>
                <p className="text-xs text-slate-600">Docentes registrados</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Reportes (30 días)</CardTitle>
                <FileText className="h-4 w-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {data.counts.reports.last30Days}
                </div>
                <p className="text-xs text-slate-600">
                  Total histórico: {data.counts.reports.total}
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Asistencias (30 días)</CardTitle>
                <CalendarDays className="h-4 w-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-700 space-y-1">
                  <div>Presentes: <span className="font-semibold text-green-600">{data.attendance.totals.present}</span></div>
                  <div>Ausentes: <span className="font-semibold text-red-600">{data.attendance.totals.absent}</span></div>
                  <div>Tardanzas: <span className="font-semibold text-amber-600">{data.attendance.totals.late}</span></div>
                  <div>Justificados: <span className="font-semibold text-blue-600">{data.attendance.totals.excused}</span></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900 flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-slate-600" />
                  Paralelos
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Distribución de cursos y estudiantes asignados.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {parallels.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No existen paralelos registrados.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200">
                        <TableHead className="text-slate-700">Curso</TableHead>
                        <TableHead className="text-slate-700">Docente</TableHead>
                        <TableHead className="text-slate-700 text-right">Estudiantes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parallels.map((parallel) => (
                        <TableRow key={parallel.id} className="border-slate-100">
                          <TableCell className="text-slate-700 font-medium">
                            {parallel.grade}-{parallel.section}
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {parallel.teacher ?? "Sin docente"}
                          </TableCell>
                          <TableCell className="text-right text-slate-700">
                            <Badge variant="outline" className="border-slate-300 text-slate-700">
                              {parallel.studentsCount}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-slate-600" />
                  Reportes recientes
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Últimos 10 reportes registrados en la institución.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.latest_reports.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No se han registrado reportes recientemente.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {data.latest_reports.map((report) => (
                      <div
                        key={report.id}
                        className="rounded-md border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold text-slate-900">
                            {report.student ?? "Estudiante no disponible"}
                          </div>
                          <span className="text-xs text-slate-500">
                            {formatDateTime(report.created_at)}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                          <Badge variant="outline" className="border-slate-300 text-slate-700">
                            {report.category ?? "General"}
                          </Badge>
                          <span>| Docente: {report.teacher ?? "Sin docente"}</span>
                        </div>
                        <p className="mt-2 text-sm text-slate-700">
                          {report.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
