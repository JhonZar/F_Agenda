import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, Users, CalendarDays } from "lucide-react";

export default function DashboardProfesor() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight">Panel del Docente</h2>
        <p className="text-muted-foreground">Accesos rápidos a tus actividades diarias.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Mis Cursos</CardTitle>
            <BookOpen className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Revisa y gestiona tus cursos asignados.</p>
            <Button asChild className="mt-3" variant="outline">
              <Link to="/profesor/cursos">Ver cursos</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Asistencias</CardTitle>
            <Users className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Registra asistencia de tus estudiantes.</p>
            <Button asChild className="mt-3" variant="outline">
              <Link to="/profesor/asistencias">Tomar asistencia</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Agenda</CardTitle>
            <CalendarDays className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Planifica evaluaciones y actividades.</p>
            <Button asChild className="mt-3" variant="outline">
              <Link to="/agenda">Abrir agenda</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Últimas novedades</CardTitle>
          <CardDescription>Sección en construcción</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Próximamente verás aquí resúmenes de tus cursos, mensajes y tareas pendientes.</p>
        </CardContent>
      </Card>
    </div>
  );
}
