import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProfesorCurso, type ProfesorCursoDetalle } from "@/api/profesor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, ArrowLeft } from "lucide-react";

export default function CursoDetallePage() {
  const { id } = useParams();
  const [curso, setCurso] = useState<ProfesorCursoDetalle | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const run = async () => {
      setLoading(true);
      try {
        const res = await getProfesorCurso(id);
        setCurso(res);
      } catch (e) {
        console.error("Error al cargar el curso", e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Curso</h2>
          {curso && (
            <p className="text-muted-foreground">
              Paralelo {String(curso.grade)} - {curso.section}
            </p>
          )}
        </div>
        <Button asChild variant="outline">
          <Link to="/profesor/cursos">
            <ArrowLeft className="h-4 w-4 mr-2" /> Volver
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200 md:col-span-2">
          <CardHeader>
            <CardTitle>Estudiantes</CardTitle>
            <CardDescription>Listado de estudiantes asignados</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-muted-foreground">Cargando…</div>
            ) : (
              <div className="divide-y">
                {curso?.students?.length ? (
                  curso.students.map((s) => (
                    <div key={s.id} className="py-3 flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{s.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{s.email} • {s.phone}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Sin estudiantes asignados</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Materias</CardTitle>
            <CardDescription>Asignadas al curso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Users className="h-4 w-4" />
              <span>{curso?.students_count ?? 0} estudiantes</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {curso?.materias?.length ? (
                curso.materias.map((m) => (
                  <Badge key={m.id} variant="secondary">{m.name}</Badge>
                ))
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span>Sin materias asignadas</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

