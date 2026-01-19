"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, FileText, Users, GraduationCap, Clock, RefreshCw } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import {
  getReports,
  createReport,
  updateReport,
  deleteReport,
  type Report as ApiReport,
  type ReportPayload,
} from "@/api/reports";
import { getReportCategories, type ReportCategory } from "@/api/reportCategories";
import { getProfesorCursos, getProfesorCurso, type ProfesorCurso } from "@/api/profesor";
import { getEstudiantes, type Estudiante } from "@/api/estudiantes";
import { getProfesores, type Profesor } from "@/api/profesores";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Option = { id: number; name: string };

const formatDate = (value?: string | null) => {
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

export default function ReportePage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [reports, setReports] = useState<ApiReport[]>([]);
  const [categories, setCategories] = useState<ReportCategory[]>([]);

  const [cursos, setCursos] = useState<ProfesorCurso[]>([]);
  const [selectedCursoId, setSelectedCursoId] = useState<string>("");
  const [cursoStudents, setCursoStudents] = useState<Record<string, Option[]>>({});
  const [allProfesorStudents, setAllProfesorStudents] = useState<Option[]>([]);

  const [studentDirectory, setStudentDirectory] = useState<Option[]>([]);
  const [teacherDirectory, setTeacherDirectory] = useState<Option[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterTeacher, setFilterTeacher] = useState("all");
  const [filterStudent, setFilterStudent] = useState("all");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentReport, setCurrentReport] = useState<ApiReport | null>(null);
  const [formValues, setFormValues] = useState({
    description: "",
    categoryId: "",
    studentId: "",
    teacherId: "",
  });

  useEffect(() => {
    if (!user) return;

    let active = true;
    const init = async () => {
      setLoading(true);
      setError(null);
      try {
        const [reportData, categoryData] = await Promise.all([getReports(), getReportCategories()]);

        if (!active) return;
        setReports(reportData);
        setCategories(categoryData);

        if (user.role === "profesor") {
          const cursosData = await getProfesorCursos();
          if (!active) return;
          setCursos(cursosData);

          if (cursosData.length) {
            const detailResults = await Promise.allSettled(
              cursosData.map((curso) => getProfesorCurso(curso.id)),
            );
            if (!active) return;

            const map: Record<string, Option[]> = {};
            const uniqueStudents = new Map<number, Option>();

            detailResults.forEach((result, index) => {
              if (result.status === "fulfilled") {
                const detail = result.value;
                const students = (detail.students ?? []).map((s) => ({
                  id: s.id,
                  name: s.name,
                }));
                const key = String(detail.id);
                map[key] = students;
                students.forEach((s) => uniqueStudents.set(s.id, s));
              } else {
                console.error(
                  "No se pudieron obtener los estudiantes del curso",
                  cursosData[index]?.id,
                  result.reason,
                );
              }
            });

            setCursoStudents(map);
            const firstCourseWithStudents =
              cursosData.find((curso) => (map[String(curso.id)] ?? []).length > 0)?.id ??
              cursosData[0]?.id;
            setSelectedCursoId(firstCourseWithStudents ? String(firstCourseWithStudents) : "");
            setAllProfesorStudents(
              Array.from(uniqueStudents.values()).sort((a, b) => a.name.localeCompare(b.name)),
            );
          } else {
            setCursoStudents({});
            setSelectedCursoId("");
            setAllProfesorStudents([]);
          }
        } else if (user.role === "admin" || user.role === "regente") {
          const [students, teachers] = await Promise.all([getEstudiantes(), getProfesores()]);
          if (!active) return;
          setStudentDirectory(
            students.map((s: Estudiante) => ({
              id: s.id,
              name: s.name,
            })),
          );
          setTeacherDirectory(
            teachers.map((t: Profesor) => ({
              id: t.id,
              name: t.name,
            })),
          );
        }
      } catch (err) {
        console.error("Error cargando reportes", err);
        if (active) {
          setError("No se pudieron cargar los reportes. Intenta nuevamente.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void init();
    return () => {
      active = false;
    };
  }, [user]);

  const refreshReports = async () => {
    const data = await getReports();
    setReports(data);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshReports();
      toast.success("Reportes actualizados");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo recargar la lista de reportes");
    } finally {
      setRefreshing(false);
    }
  };

  const studentOptionsForForm = useMemo(() => {
    if (user?.role === "profesor") {
      if (selectedCursoId && cursoStudents[selectedCursoId]) {
        return cursoStudents[selectedCursoId];
      }
      return allProfesorStudents;
    }
    return studentDirectory;
  }, [user?.role, selectedCursoId, cursoStudents, allProfesorStudents, studentDirectory]);

  const studentOptionsForFilters = useMemo(() => {
    if (user?.role === "profesor") {
      return allProfesorStudents;
    }
    return studentDirectory;
  }, [user?.role, allProfesorStudents, studentDirectory]);

  const stats = useMemo(() => {
    const uniqueStudents = new Set(reports.map((r) => r.student_id));
    const uniqueCategories = new Set(reports.map((r) => r.category_id));
    const now = Date.now();
    const last30 = reports.filter((r) => {
      if (!r.created_at) return false;
      const created = new Date(r.created_at).getTime();
      if (Number.isNaN(created)) return false;
      const diffDays = (now - created) / (1000 * 60 * 60 * 24);
      return diffDays <= 30;
    }).length;
    return {
      total: reports.length,
      students: uniqueStudents.size,
      categories: uniqueCategories.size,
      last30,
    };
  }, [reports]);

  const filteredReports = useMemo(() => {
    const normalize = (value?: string | null) => value?.toLowerCase() ?? "";
    const term = searchTerm.toLowerCase();

    return reports.filter((report) => {
      const matchesTerm =
        normalize(report.description).includes(term) ||
        normalize(report.student?.name).includes(term) ||
        normalize(report.teacher?.name).includes(term) ||
        normalize(report.category?.name).includes(term);

      const matchesCategory =
        filterCategory === "all" || String(report.category_id) === filterCategory;

      const matchesTeacher =
        filterTeacher === "all" || String(report.teacher_id ?? "") === filterTeacher;

      const matchesStudent =
        filterStudent === "all" || String(report.student_id) === filterStudent;

      return matchesTerm && matchesCategory && matchesTeacher && matchesStudent;
    });
  }, [reports, searchTerm, filterCategory, filterTeacher, filterStudent]);

  const resetForm = () => {
    setFormValues({
      description: "",
      categoryId: categories.length ? String(categories[0].id) : "",
      studentId: studentOptionsForForm.length ? String(studentOptionsForForm[0].id) : "",
      teacherId: teacherDirectory.length ? String(teacherDirectory[0].id) : "",
    });
    setFormError(null);
  };

  useEffect(() => {
    if (!isDialogOpen) return;

    setFormValues((prev) => ({
      description: prev.description,
      categoryId: prev.categoryId || (categories.length ? String(categories[0].id) : ""),
      studentId:
        prev.studentId ||
        (studentOptionsForForm.length ? String(studentOptionsForForm[0].id) : ""),
      teacherId:
        prev.teacherId ||
        (teacherDirectory.length && (user?.role === "admin" || user?.role === "regente")
          ? String(teacherDirectory[0].id)
          : ""),
    }));
  }, [isDialogOpen, categories, studentOptionsForForm, teacherDirectory, user?.role]);

  const handleAddReport = () => {
    setCurrentReport(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const findCursoForStudent = (studentId: number): string => {
    for (const [cursoId, students] of Object.entries(cursoStudents)) {
      if (students.some((s) => s.id === studentId)) {
        return cursoId;
      }
    }
    return "";
  };

  const handleEditReport = (report: ApiReport) => {
    setCurrentReport(report);
    setFormError(null);
    setFormValues({
      description: report.description ?? "",
      categoryId: report.category_id ? String(report.category_id) : "",
      studentId: report.student_id ? String(report.student_id) : "",
      teacherId: report.teacher_id ? String(report.teacher_id) : "",
    });

    if (user?.role === "profesor") {
      const cursoId = findCursoForStudent(report.student_id);
      if (cursoId) {
        setSelectedCursoId(cursoId);
      }
    }

    setIsDialogOpen(true);
  };

  const handleDeleteReport = async (report: ApiReport) => {
    const confirmed = window.confirm("¿Eliminar este reporte? Esta acción no se puede deshacer.");
    if (!confirmed) return;
    try {
      await deleteReport(report.id);
      await refreshReports();
      toast.success("Reporte eliminado");
    } catch (err: any) {
      console.error("Error eliminando reporte", err);
      const message =
        err?.response?.data?.message ??
        err?.message ??
        "No se pudo eliminar el reporte. Intenta nuevamente.";
      toast.error(message);
    }
  };

  const handleSaveReport = async () => {
    if (!formValues.description.trim()) {
      setFormError("La descripción es obligatoria.");
      return;
    }
    if (!formValues.categoryId) {
      setFormError("Selecciona una categoría.");
      return;
    }
    if (!formValues.studentId) {
      setFormError("Selecciona un estudiante.");
      return;
    }
    if ((user?.role === "admin" || user?.role === "regente") && !formValues.teacherId) {
      setFormError("Selecciona un docente.");
      return;
    }

    const payload: ReportPayload = {
      student_id: Number(formValues.studentId),
      category_id: Number(formValues.categoryId),
      description: formValues.description.trim(),
    };

    if ((user?.role === "admin" || user?.role === "regente") && formValues.teacherId) {
      payload.teacher_id = Number(formValues.teacherId);
    }

    setSaving(true);
    setFormError(null);
    try {
      if (currentReport) {
        await updateReport(currentReport.id, payload);
        toast.success("Reporte actualizado");
      } else {
        await createReport(payload);
        toast.success("Reporte creado");
      }
      await refreshReports();
      setIsDialogOpen(false);
    } catch (err: any) {
      console.error("Error guardando reporte", err);
      const message =
        err?.response?.data?.message ??
        err?.message ??
        "No se pudo guardar el reporte. Revisa los datos e intenta nuevamente.";
      setFormError(message);
    } finally {
      setSaving(false);
    }
  };

  const renderEmptyState = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="py-10 text-center text-slate-500">
            Cargando reportes...
          </TableCell>
        </TableRow>
      );
    }
    return (
      <TableRow>
        <TableCell colSpan={6} className="py-10 text-center text-slate-500">
          No hay reportes que coincidan con tu búsqueda.
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Reportes</h2>
            <p className="text-sm text-slate-600">Gestión de reportes estudiantiles</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button onClick={handleAddReport} className="bg-black hover:bg-navy-700">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Reporte
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 text-red-600">
          <CardContent className="py-4">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Total reportes</CardTitle>
            <FileText className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <p className="text-xs text-slate-600">Reportes registrados</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">
              Estudiantes involucrados
            </CardTitle>
            <Users className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.students}</div>
            <p className="text-xs text-slate-600">Estudiantes con al menos un reporte</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Categorías activas</CardTitle>
            <GraduationCap className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.categories}</div>
            <p className="text-xs text-slate-600">Categorías utilizadas en los reportes</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Últimos 30 días</CardTitle>
            <Clock className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.last30}</div>
            <p className="text-xs text-slate-600">Reportes registrados recientemente</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <FileText className="h-5 w-5 text-slate-600" />
            Lista de reportes
          </CardTitle>
          <CardDescription className="text-slate-600">
            Administra los reportes estudiantiles y su seguimiento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 pb-4">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por descripción, estudiante o docente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 border-slate-200 focus:border-slate-400"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[200px] border-slate-200">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStudent} onValueChange={setFilterStudent}>
              <SelectTrigger className="w-[200px] border-slate-200">
                <SelectValue placeholder="Estudiante" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estudiantes</SelectItem>
                {studentOptionsForFilters.map((option) => (
                  <SelectItem key={option.id} value={String(option.id)}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(user?.role === "admin" || user?.role === "regente") && (
              <Select value={filterTeacher} onValueChange={setFilterTeacher}>
                <SelectTrigger className="w-[200px] border-slate-200">
                  <SelectValue placeholder="Docente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los docentes</SelectItem>
                  {teacherDirectory.map((teacher) => (
                    <SelectItem key={teacher.id} value={String(teacher.id)}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead className="text-slate-700">Descripción</TableHead>
                <TableHead className="text-slate-700">Estudiante</TableHead>
                <TableHead className="text-slate-700">Categoría</TableHead>
                <TableHead className="text-slate-700">Docente</TableHead>
                <TableHead className="text-slate-700">Fecha</TableHead>
                <TableHead className="text-slate-700 text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.length ? (
                filteredReports.map((report) => (
                  <TableRow key={report.id} className="border-slate-100">
                    <TableCell className="max-w-[260px]">
                      <p className="font-medium text-slate-900 line-clamp-2">
                        {report.description || "Sin descripción"}
                      </p>
                      <p className="text-xs text-slate-500">
                        Creado: {formatDate(report.created_at)}
                      </p>
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {report.student?.name ?? "Sin asignar"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-slate-300 text-slate-700">
                        {report.category?.name ?? "Sin categoría"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-700">
                      {report.teacher?.name ?? "Sin docente"}
                    </TableCell>
                    <TableCell className="text-slate-700">
                      {formatDate(report.updated_at ?? report.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditReport(report)}
                          className="border-slate-200 text-slate-700 hover:bg-slate-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteReport(report)}
                          className="border-red-200 text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                renderEmptyState()
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setCurrentReport(null);
            setFormError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[640px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-900">
              {currentReport ? "Editar reporte" : "Nuevo reporte"}
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Completa los datos requeridos para registrar el reporte.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-700">
                Descripción
              </Label>
              <Textarea
                id="description"
                value={formValues.description}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, description: e.target.value }))
                }
                className="border-slate-200"
                rows={4}
                placeholder="Describe el motivo del reporte..."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {user?.role === "profesor" && cursos.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="curso" className="text-slate-700">
                    Curso
                  </Label>
                  <Select
                    value={selectedCursoId}
                    onValueChange={(value) => {
                      setSelectedCursoId(value);
                      const students = cursoStudents[value] ?? [];
                      if (!students.find((s) => String(s.id) === formValues.studentId)) {
                        setFormValues((prev) => ({
                          ...prev,
                          studentId: students.length ? String(students[0].id) : "",
                        }));
                      }
                    }}
                  >
                    <SelectTrigger className="border-slate-200">
                      <SelectValue placeholder="Seleccionar curso" />
                    </SelectTrigger>
                    <SelectContent>
                      {cursos.map((curso) => (
                        <SelectItem key={curso.id} value={String(curso.id)}>
                          {curso.grade} - {curso.section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="student" className="text-slate-700">
                  Estudiante
                </Label>
                <Select
                  value={formValues.studentId}
                  onValueChange={(value) =>
                    setFormValues((prev) => ({ ...prev, studentId: value }))
                  }
                >
                  <SelectTrigger className="border-slate-200">
                    <SelectValue placeholder="Seleccionar estudiante" />
                  </SelectTrigger>
                  <SelectContent>
                    {studentOptionsForForm.length ? (
                      studentOptionsForForm.map((student) => (
                        <SelectItem key={student.id} value={String(student.id)}>
                          {student.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="__no_students__" disabled>
                        No hay estudiantes disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-slate-700">
                  Categoría
                </Label>
                <Select
                  value={formValues.categoryId}
                  onValueChange={(value) =>
                    setFormValues((prev) => ({ ...prev, categoryId: value }))
                  }
                >
                  <SelectTrigger className="border-slate-200">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length ? (
                      categories.map((category) => (
                        <SelectItem key={category.id} value={String(category.id)}>
                          {category.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="__no_categories__" disabled>
                        No hay categorías disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {(user?.role === "admin" || user?.role === "regente") && (
                <div className="space-y-2">
                  <Label htmlFor="teacher" className="text-slate-700">
                    Docente responsable
                  </Label>
                  <Select
                    value={formValues.teacherId}
                    onValueChange={(value) =>
                      setFormValues((prev) => ({ ...prev, teacherId: value }))
                    }
                  >
                    <SelectTrigger className="border-slate-200">
                      <SelectValue placeholder="Seleccionar docente" />
                    </SelectTrigger>
                    <SelectContent>
                      {teacherDirectory.length ? (
                        teacherDirectory.map((teacher) => (
                          <SelectItem key={teacher.id} value={String(teacher.id)}>
                            {teacher.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="__no_teachers__" disabled>
                          No hay docentes disponibles
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {formError && (
              <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={handleSaveReport}
              disabled={saving}
              className="bg-navy-600 hover:bg-navy-700 text-black disabled:opacity-70 "
            >
              {saving ? "Guardando..." : currentReport ? "Actualizar reporte" : "Crear reporte"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
