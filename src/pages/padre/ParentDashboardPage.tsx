"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Users, CalendarDays, FileText } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  getParentDashboard,
  type ParentChildAttendanceEntry,
  type ParentChildSummary,
  type ParentDashboardResponse,
} from "@/api/padre";
import { useAuth } from "@/context/AuthContext";

const attendanceStatusMap: Record<
  string,
  { label: string; color: string }
> = {
  present: { label: "Presente", color: "bg-green-100 text-green-800" },
  absent: { label: "Ausente", color: "bg-red-100 text-red-800" },
  late: { label: "Tardanza", color: "bg-amber-100 text-amber-800" },
  excused: { label: "Justificado", color: "bg-blue-100 text-blue-800" },
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

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

const getStatusVisual = (entry: ParentChildAttendanceEntry) => {
  const config = attendanceStatusMap[entry.status] ?? {
    label: entry.status,
    color: "bg-slate-100 text-slate-700",
  };
  return config;
};

export default function ParentDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<ParentDashboardResponse | null>(null);
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
      const response = await getParentDashboard();
      setData(response);
      setError(null);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err?.message ?? "No se pudo cargar la información.";
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

  const children = useMemo(() => data?.children ?? [], [data]);

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Familia
            </h2>
            <p className="text-sm text-slate-600">
              {user?.name ? `Hola ${user.name}, aquí está el resumen de tus hijos.` : "Resumen familiar."}
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

      {loading ? (
        <Card className="border-slate-200">
          <CardContent className="py-16 text-center text-slate-500">
            Cargando información familiar...
          </CardContent>
        </Card>
      ) : (
        <>
          {children.length === 0 ? (
            <Card className="border-slate-200">
              <CardContent className="py-16 text-center text-slate-500">
                No tenemos estudiantes vinculados a tu cuenta todavía.
              </CardContent>
            </Card>
          ) : (
            children.map((child: ParentChildSummary) => (
              <Card key={child.id} className="border-slate-200">
                <CardHeader className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-2xl text-slate-900 flex items-center gap-2">
                        <Users className="h-5 w-5 text-slate-600" />
                        {child.name}
                      </CardTitle>
                      <CardDescription className="text-slate-600">
                        {child.email ?? "Sin correo registrado"} · {child.phone ?? "Sin teléfono"}{child.ci ? ` · CI ${child.ci}` : ""}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {child.parallels.length > 0 ? (
                        child.parallels.map((parallel) => (
                          <Badge
                            key={parallel.id}
                            variant="outline"
                            className="border-slate-300 text-slate-700"
                          >
                            {parallel.label}
                            {parallel.teacher?.name ? ` · ${parallel.teacher.name}` : ""}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="outline" className="border-slate-300 text-slate-500">
                          Sin curso asignado
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-500" />
                      <span>
                        Total asistencias: {child.attendance.summary.total}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-green-500" />
                      <span className="text-green-600">
                        Presentes: {child.attendance.summary.present}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-red-500" />
                      <span className="text-red-600">
                        Ausencias: {child.attendance.summary.absent}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-amber-500" />
                      <span className="text-amber-600">
                        Tardanzas: {child.attendance.summary.late}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <Separator />

                <CardContent className="grid gap-6 py-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-5 w-5 text-slate-600" />
                      <h3 className="text-lg font-semibold text-slate-900">
                        Asistencias recientes
                      </h3>
                    </div>
                    {child.attendance.recent.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        No hay registros de asistencia disponibles.
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="border-slate-200">
                            <TableHead className="text-slate-700">Fecha</TableHead>
                            <TableHead className="text-slate-700">Estado</TableHead>
                            <TableHead className="text-slate-700">Curso</TableHead>
                            <TableHead className="text-slate-700">Comentarios</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {child.attendance.recent.map((entry) => {
                            const visual = getStatusVisual(entry);
                            return (
                              <TableRow key={entry.id} className="border-slate-100">
                                <TableCell className="text-slate-700">
                                  {formatDate(entry.date)}
                                </TableCell>
                                <TableCell>
                                  <Badge className={visual.color}>
                                    {visual.label}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-slate-700">
                                  {entry.parallel?.label ?? "—"}
                                </TableCell>
                                <TableCell className="text-slate-600">
                                  {entry.notes ?? "—"}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-slate-600" />
                      <h3 className="text-lg font-semibold text-slate-900">
                        Reportes recientes
                      </h3>
                    </div>
                    {child.reports.recent.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        No hay reportes registrados para este estudiante.
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="border-slate-200">
                            <TableHead className="text-slate-700">Fecha</TableHead>
                            <TableHead className="text-slate-700">Categoría</TableHead>
                            <TableHead className="text-slate-700">Docente</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {child.reports.recent.map((report) => (
                            <TableRow key={report.id} className="border-slate-100">
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="text-slate-900 font-medium">
                                    {formatDate(report.created_at)}
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    {formatDateTime(report.created_at)}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-slate-700">
                                {report.category ?? "General"}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="text-slate-900 font-medium">
                                    {report.teacher ?? "Sin docente"}
                                  </span>
                                  <span className="text-xs text-slate-500 line-clamp-2 max-w-[220px]">
                                    {report.description}
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </>
      )}
    </div>
  );
}
