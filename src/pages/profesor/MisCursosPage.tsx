import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProfesorCursos, type ProfesorCurso } from "@/api/profesor";
import { BookOpen, Users, ArrowRight, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function MisCursosPage() {
  const [cursos, setCursos] = useState<ProfesorCurso[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const res = await getProfesorCursos();
        setCursos(res);
      } catch (e) {
        console.error("Error al cargar cursos del profesor", e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Mis Cursos</h2>
          <p className="text-muted-foreground">Listado de cursos y paralelos asignados.</p>
        </div>
        <BookOpen className="h-6 w-6 text-slate-600" />
      </div>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="border-slate-200 animate-pulse">
              <CardContent className="p-4">
                <div className="h-5 w-24 bg-muted rounded mb-2" />
                <div className="h-4 w-40 bg-muted rounded mb-4" />
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-muted rounded" />
                  <div className="h-6 w-20 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && cursos.length === 0 && (
        <Card className="border-dashed border-slate-300">
          <CardContent className="p-10 text-center text-muted-foreground">
            <AlertCircle className="h-10 w-10 mx-auto mb-3" />
            <p className="mb-1">No tienes cursos asignados actualmente.</p>
            <p className="text-sm">Contacta al administrador si consideras que es un error.</p>
          </CardContent>
        </Card>
      )}

      {!loading && cursos.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cursos.map((curso) => (
            <Card key={curso.id} className="border-slate-200 hover:shadow-sm transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {String(curso.grade)} - {curso.section}
                </CardTitle>
                <CardDescription>Paralelo #{curso.id}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{curso.students_count} estudiantes</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {curso.materias?.length ? (
                    curso.materias.map((m) => (
                      <Badge key={m.id} variant="secondary" className="text-xs">
                        {m.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">Sin materias asignadas</span>
                  )}
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link to={`/profesor/cursos/${curso.id}`} className="flex items-center justify-between w-full">
                    Ver detalle
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
