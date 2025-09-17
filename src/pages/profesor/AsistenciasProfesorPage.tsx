import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getProfesorCursos, getProfesorCurso, type ProfesorCurso } from "@/api/profesor";
import { saveAttendance, type AttendanceStatus } from "@/api/attendance";
import { UserCheck, Save, Loader2, Clock } from "lucide-react";

type Row = { id: number; name: string; status: AttendanceStatus; arrivalTime?: string | null; notes?: string | null };

export default function AsistenciasProfesorPage() {
  const [cursos, setCursos] = useState<ProfesorCurso[]>([]);
  const [paraleloId, setParaleloId] = useState<string>("");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<Row[]>([]);
  const [nowTime, setNowTime] = useState<string>(() => new Date().toTimeString().slice(0, 5)); // HH:mm
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const list = await getProfesorCursos();
        setCursos(list);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  useEffect(() => {
    if (!paraleloId) return;
    const loadStudents = async () => {
      setLoading(true);
      try {
        const detail = await getProfesorCurso(paraleloId);
        const current = new Date();
        const hhmm = current.toTimeString().slice(0, 5);
        setNowTime(hhmm);
        setRows(
          (detail.students || []).map((s) => ({ id: s.id, name: s.name, status: "present" as AttendanceStatus, arrivalTime: hhmm }))
        );
      } finally {
        setLoading(false);
      }
    };
    loadStudents();
  }, [paraleloId]);

  // const selectedCurso = useMemo(() => cursos.find((c) => String(c.id) === String(paraleloId)), [cursos, paraleloId]);

  const setStatus = (id: number, status: AttendanceStatus) =>
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              arrivalTime: status === "present" ? nowTime : null,
              notes: status === "present" ? r.notes ?? null : r.notes ?? "",
            }
          : r
      )
    );

  const setNotes = (id: number, notes: string) => setRows((prev) => prev.map((r) => (r.id === id ? { ...r, notes } : r)));

  const refreshNowTime = () => {
    const hhmm = new Date().toTimeString().slice(0, 5);
    setNowTime(hhmm);
    // Actualiza hora de llegada solo para los que están en presente
    setRows((prev) => prev.map((r) => (r.status === "present" ? { ...r, arrivalTime: hhmm } : r)));
  };

  const handleSave = async () => {
    if (!paraleloId || !date || rows.length === 0) return;
    setSaving(true);
    try {
      await saveAttendance({
        date,
        paralelo_id: Number(paraleloId),
        students: rows.map(({ id, status, arrivalTime, notes }) => ({ id, status, arrivalTime, notes })),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Asistencias</h2>
          <p className="text-muted-foreground">Registra la asistencia de tus estudiantes.</p>
        </div>
        <UserCheck className="h-6 w-6 text-slate-600" />
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Registro diario</CardTitle>
          <CardDescription>Selecciona el curso y marca el estado por estudiante.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Curso</label>
              <Select value={paraleloId} onValueChange={setParaleloId}>
                <SelectTrigger>
                  <SelectValue placeholder={loading ? "Cargando cursos…" : "Seleccionar"} />
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
              <label className="text-sm font-medium">Resumen</label>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{rows.filter((r) => r.status === "present").length} Presentes</Badge>
                <Badge variant="secondary">{rows.filter((r) => r.status === "absent").length} Ausentes</Badge>
                <Badge variant="secondary">{rows.filter((r) => r.status === "late").length} Atrasos</Badge>
                <Badge variant="secondary">{rows.filter((r) => r.status === "excused").length} Justificados</Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Hora actual para presentes: {nowTime}</span>
            <Button type="button" variant="outline" size="sm" onClick={refreshNowTime}>Actualizar hora</Button>
          </div>

          <div className="rounded-md border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Estudiante</TableHead>
                  <TableHead className="w-[340px]">Estado</TableHead>
                  <TableHead>Llegada</TableHead>
                  <TableHead>Notas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {["present", "absent", "late", "excused"].map((s) => (
                          <Button
                            key={s}
                            type="button"
                            size="sm"
                            variant={r.status === s ? "default" : "outline"}
                            onClick={() => setStatus(r.id, s as AttendanceStatus)}
                          >
                            {s === "present" && "Presente"}
                            {s === "absent" && "Ausente"}
                            {s === "late" && "Atraso"}
                            {s === "excused" && "Justificado"}
                          </Button>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {r.status === "present" ? r.arrivalTime ?? nowTime : "—"}
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Opcional"
                        value={r.notes ?? ""}
                        onChange={(e) => setNotes(r.id, e.target.value)}
                        disabled={r.status === "present"}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      {paraleloId ? "Sin estudiantes" : "Selecciona un curso para comenzar"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={!paraleloId || rows.length === 0 || saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" /> Guardar asistencia
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
