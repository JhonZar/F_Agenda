import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Trash2, Send } from "lucide-react";
import { getReportCategories, type ReportCategory } from "@/api/reportCategories";
import { getProfesorCursos, getProfesorCurso, type ProfesorCurso } from "@/api/profesor";
import { createReport, deleteReport, getReports, type Report } from "@/api/reports";
import { useAuth } from "@/context/AuthContext";

export default function ReportesProfesorPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<ReportCategory[]>([]);
  const [cursos, setCursos] = useState<ProfesorCurso[]>([]);
  const [paraleloId, setParaleloId] = useState<string>("");
  const [students, setStudents] = useState<{ id: number; name: string }[]>([]);
  const [studentId, setStudentId] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [cats, cs] = await Promise.all([getReportCategories(), getProfesorCursos()]);
        setCategories(cats);
        setCursos(cs);
        if (cs.length) setParaleloId(String(cs[0].id));
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await getReports();
        setReports(list);
      } catch {}
    };
    load();
  }, []);

  useEffect(() => {
    if (!paraleloId) return;
    const load = async () => {
      setLoading(true);
      try {
        const detail = await getProfesorCurso(paraleloId);
        setStudents((detail.students || []).map((s) => ({ id: s.id, name: s.name })));
        if (detail.students?.length) setStudentId(String(detail.students[0].id));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [paraleloId]);

  const selectedCurso = useMemo(() => cursos.find((c) => String(c.id) === paraleloId), [cursos, paraleloId]);
  const selectedStudent = useMemo(() => students.find((s) => String(s.id) === studentId), [students, studentId]);
  const selectedCategory = useMemo(() => categories.find((c) => String(c.id) === categoryId), [categories, categoryId]);

  const handleSubmit = async () => {
    if (!user || !studentId || !categoryId || !description.trim()) return;
    setSaving(true);
    try {
      const created = await createReport({
        student_id: Number(studentId),
        teacher_id: user.id,
        category_id: Number(categoryId),
        description: description.trim(),
      });
      setReports((prev) => [created, ...prev]);
      setDescription("");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este reporte?")) return;
    await deleteReport(id);
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Reportes</h2>
          <p className="text-muted-foreground">Crea y gestiona reportes de tus estudiantes.</p>
        </div>
        <FileText className="h-6 w-6 text-slate-600" />
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Nuevo Reporte</CardTitle>
          <CardDescription>Selecciona el curso, estudiante y categoría</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Curso</label>
              <Select value={paraleloId} onValueChange={setParaleloId}>
                <SelectTrigger>
                  <SelectValue placeholder={loading ? "Cargando..." : "Seleccionar"} />
                </SelectTrigger>
                <SelectContent>
                  {cursos.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {String(c.grade)} - {c.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Estudiante</label>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder={loading ? "Cargando..." : "Seleccionar"} />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoría</label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder={loading ? "Cargando..." : "Seleccionar"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descripción</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe la situación, acciones y observaciones..."
              rows={4}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={saving || !studentId || !categoryId || !description.trim()}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Send className="mr-2 h-4 w-4" /> Registrar reporte
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Mis Reportes</CardTitle>
          <CardDescription>Solo se listan tus reportes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estudiante</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="w-[80px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-sm text-slate-600">{new Date(r.created_at).toLocaleString()}</TableCell>
                    <TableCell className="font-medium">{r.student?.name ?? r.student_id}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{r.category?.name ?? r.category_id}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-700 truncate max-w-[400px]">{r.description}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDelete(r.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {reports.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Sin reportes todavía
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

