// src/views/academico/AttendancePage.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { SidebarTrigger } from "../../components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import {
  Search,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Filter,
  Save,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { Progress } from "../../components/ui/progress";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Label } from "../../components/ui/label";

// hooks
import {
  useAttendance,
  useAttendanceHistory,
  useSaveAttendance,
} from "./hook/useAttendance";
// types
import type { AttendanceRecord, Student } from "@/api/attendanceApi";

export default function AttendancePage() {
  // ————— filtros y estados —————————————————————————————————————————
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedParallel, setSelectedParallel] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [localData, setLocalData] = useState<AttendanceRecord | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // ————— React Query: carga y mutaciones —————————————————————————————————
  const {
    data: attendanceData,
    isLoading: loadingAttendance,
    refetch: refetchAttendance,
    error: attendanceError,
  } = useAttendance(selectedDate, selectedParallel);

  const {
    data: history = [],
    isLoading: loadingHistory,
    error: historyError,
  } = useAttendanceHistory();
  const parallelOptions: string[] = Array.from(
    new Set(history.map((rec) => rec.parallel))
  );
  // ahora desestructuramos 'mutate' y 'status'
  const { mutate: saveAttendance, status: saveStatus } = useSaveAttendance();

  // ————— cuando llegan datos del servidor ——————————————————————————————
  useEffect(() => {
    if (attendanceData) {
      setLocalData(attendanceData);
      setHasUnsavedChanges(false);
    }
  }, [attendanceData]);

  // ————— handlers de edición ————————————————————————————————————————
  const handleStatusChange = (
    studentId: string,
    newStatus: Student["status"]
  ) => {
    if (!localData) return;
    const updatedStudents = localData.students.map((stu: Student) =>
      stu.id === studentId ? { ...stu, status: newStatus } : stu
    );
    const presentCount = updatedStudents.filter(
      (s: Student) => s.status === "present"
    ).length;
    const absentCount = updatedStudents.filter(
      (s: Student) => s.status === "absent"
    ).length;
    const lateCount = updatedStudents.filter(
      (s: Student) => s.status === "late"
    ).length;
    const excusedCount = updatedStudents.filter(
      (s: Student) => s.status === "excused"
    ).length;

    setLocalData({
      ...localData,
      students: updatedStudents,
      presentCount,
      absentCount,
      lateCount,
      excusedCount,
    });
    setHasUnsavedChanges(true);
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    if (!localData) return;
    const updatedStudents = localData.students.map((stu: Student) =>
      stu.id === studentId ? { ...stu, notes } : stu
    );
    setLocalData({ ...localData, students: updatedStudents });
    setHasUnsavedChanges(true);
  };

  // ————— guardar en backend ——————————————————————————————————————————
  const onSave = () => {
    if (!localData) return;
    saveAttendance(
      {
        date: selectedDate,
        paralelo_id: selectedParallel,
        students: localData.students.map((stu: Student) => ({
          id: stu.id,
          status: stu.status,
          arrivalTime: stu.arrivalTime,
          notes: stu.notes,
        })),
      },
      { onSuccess: () => refetchAttendance() }
    );
  };

  // ————— recargar datos ————————————————————————————————————————————
  const loadAttendanceData = () => {
    if (!selectedParallel) return;
    refetchAttendance();
  };

  // ————— utilidades de iconos y estilos —————————————————————————————————
  const getStatusIcon = (status: Student["status"]) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "absent":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "late":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "excused":
        return <AlertTriangle className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };
  const getStatusColor = (status: Student["status"]) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800 border-green-200";
      case "absent":
        return "bg-red-100 text-red-800 border-red-200";
      case "late":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "excused":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  const getStatusText = (status: Student["status"]) => {
    switch (status) {
      case "present":
        return "Presente";
      case "absent":
        return "Ausente";
      case "late":
        return "Tardanza";
      case "excused":
        return "Justificado";
      default:
        return "Sin marcar";
    }
  };

  // ————— porcentaje y filtrado ———————————————————————————————————————
  const attendancePercentage = localData
    ? Math.round((localData.presentCount / localData.totalStudents) * 100)
    : 0;
  const filteredStudents = localData?.students.filter((stu: Student) =>
    stu.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ————— render —————————————————————————————————————————————————————
  return (
    <TooltipProvider>
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <SidebarTrigger />
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Control de Asistencias
              </h2>
              <p className="text-slate-600">
                Gestiona la asistencia diaria por paralelo
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Exportar asistencia</p>
              </TooltipContent>
            </Tooltip>
            <Button
              onClick={onSave}
              disabled={!hasUnsavedChanges || saveStatus === "pending"}
              className="bg-navy-600 hover:bg-navy-700 text-foreground"
            >
              {saveStatus === "pending" ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Alertas */}
        {hasUnsavedChanges && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription>
              Tienes cambios sin guardar. No olvides guardar antes de salir.
            </AlertDescription>
          </Alert>
        )}
        {attendanceError && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription>Error cargando asistencia.</AlertDescription>
          </Alert>
        )}
        {historyError && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription>Error cargando historial.</AlertDescription>
          </Alert>
        )}

        {/* Filtros */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-navy-600" /> Filtros de Asistencia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-slate-700">
                  Fecha
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parallel" className="text-slate-700">
                  Paralelo
                </Label>
                <Select
                  value={selectedParallel}
                  onValueChange={setSelectedParallel}
                >
                  <SelectTrigger className="border-slate-200">
                    <SelectValue placeholder="Seleccionar paralelo" />
                  </SelectTrigger>
                  <SelectContent>
                    {parallelOptions.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={loadAttendanceData}
                  disabled={loadingAttendance}
                  className="w-full"
                >
                  {loadingAttendance ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Cargar Asistencia
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sesión Actual */}
        {localData && (
          <>
            {/* Estadísticas */}
            <div className="grid gap-4 md:grid-cols-5">
              <Card className="border-slate-200">
                <CardHeader className="flex items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-700">
                    Total
                  </CardTitle>
                  <Users className="h-4 w-4 text-slate-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    {localData.totalStudents}
                  </div>
                  <p className="text-xs text-slate-600">Estudiantes</p>
                </CardContent>
              </Card>
              <Card className="border-slate-200">
                <CardHeader className="flex items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-700">
                    Presentes
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    {localData.presentCount}
                  </div>
                  <p className="text-xs text-slate-600">
                    {attendancePercentage}% del total
                  </p>
                </CardContent>
              </Card>
              <Card className="border-slate-200">
                <CardHeader className="flex items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-700">
                    Ausentes
                  </CardTitle>
                  <XCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    {localData.absentCount}
                  </div>
                  <p className="text-xs text-slate-600">Faltas del día</p>
                </CardContent>
              </Card>
              <Card className="border-slate-200">
                <CardHeader className="flex items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-700">
                    Tardanzas
                  </CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    {localData.lateCount}
                  </div>
                  <p className="text-xs text-slate-600">Llegadas tarde</p>
                </CardContent>
              </Card>
              <Card className="border-slate-200">
                <CardHeader className="flex items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-700">
                    Asistencia
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-slate-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    {attendancePercentage}%
                  </div>
                  <Progress value={attendancePercentage} className="h-2 mt-2" />
                </CardContent>
              </Card>
            </div>

            {/* Tabla de Asistencia */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-slate-600" />
                  Asistencia – {localData.parallel} ({localData.date})
                </CardTitle>
                <CardDescription>
                  Registrada por {localData.takenBy} a las {localData.takenAt}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Buscar estudiante..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 border-slate-200"
                    />
                  </div>
                </div>
                <div className="rounded-md border border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200 bg-slate-50">
                        <TableHead className="text-slate-700 font-semibold">
                          Estudiante
                        </TableHead>
                        <TableHead className="text-slate-700 font-semibold">
                          Estado
                        </TableHead>
                        <TableHead className="text-slate-700 font-semibold">
                          Hora Llegada
                        </TableHead>
                        <TableHead className="text-slate-700 font-semibold">
                          Observaciones
                        </TableHead>
                        <TableHead className="text-slate-700 font-semibold">
                          Acciones
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents?.map((stu: Student) => (
                        <TableRow key={stu.id} className="border-slate-100">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                                <span className="text-slate-600 font-semibold text-sm">
                                  {stu.name
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-slate-900">
                                  {stu.name}
                                </div>
                                <div className="text-sm text-slate-600">
                                  {localData.parallel}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(stu.status)}
                              <Badge className={getStatusColor(stu.status)}>
                                {getStatusText(stu.status)}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-slate-700">
                              {stu.arrivalTime ?? "-"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder="Agregar observación..."
                              value={stu.notes ?? ""}
                              onChange={(e) =>
                                handleNotesChange(stu.id, e.target.value)
                              }
                              className="border-slate-200 text-sm"
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={stu.status}
                              onValueChange={(val: Student["status"]) =>
                                handleStatusChange(stu.id, val)
                              }
                            >
                              <SelectTrigger className="w-[130px] border-slate-200">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="present">
                                  Presente
                                </SelectItem>
                                <SelectItem value="absent">Ausente</SelectItem>
                                <SelectItem value="late">Tardanza</SelectItem>
                                <SelectItem value="excused">
                                  Justificado
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Historial de Asistencias */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-slate-600" />
              Historial de Asistencias
            </CardTitle>
            <CardDescription>
              Registro de asistencias anteriores
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingHistory ? (
              <p>Cargando historial...</p>
            ) : (
              <div className="space-y-3">
                {history.map((rec: AttendanceRecord) => (
                  <div
                    key={`${rec.parallel}-${rec.date}`}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-navy-100 rounded-lg flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-navy-600" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">
                          {rec.parallel} - {rec.date}
                        </div>
                        <div className="text-sm text-slate-600">
                          Registrado por {rec.takenBy} a las {rec.takenAt}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-slate-900">
                          {Math.round(
                            (rec.presentCount / rec.totalStudents) * 100
                          )}
                          % Asistencia
                        </div>
                        <div className="text-xs text-slate-600">
                          {rec.presentCount}/{rec.totalStudents} presentes
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Ver Detalle
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
