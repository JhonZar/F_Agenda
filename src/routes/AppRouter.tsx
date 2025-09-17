import { Routes, Route, Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import LoginForm from "@/pages/auth/LoginForm";
import Dashboard from "@/pages/admin/Dashboard";
import DashboardProfesor from "@/pages/profesor/DashboardProfesor";
import MisCursosPage from "@/pages/profesor/MisCursosPage";
import AsistenciasProfesorPage from "@/pages/profesor/AsistenciasProfesorPage";
import CursoDetallePage from "@/pages/profesor/CursoDetallePage";
import ReportesProfesorPage from "@/pages/profesor/ReportesProfesorPage";
import ProtectedLayout from "@/layouts/ProtectedLayout";
import { useAuth } from "@/context/AuthContext";
import PhoneLogin from "@/pages/auth/PhoneLogin";
import Paralelos from "@/pages/paralelos/Paralelos";
import TeachersPage from "@/pages/profesores/TeachersPage";
import MateriasPage from "@/pages/materias/MateriasPage";
import ParaleloMateriasPage from "@/pages/paralelo-materia/ParaleloMateriasPage";
import ParaleloEstudiantePage from "@/pages/paralelo-estudiante/ParaleloEstudiantePage";
import EstudiantesPage from "@/pages/estudiantes/EstudiantesPage";
import AttendancePage from "@/pages/asistencias/AsistenciasPage";
import AgendaPage from "@/pages/agenda/Agendapage";
import ReportsPage from "@/pages/reportes/ReportePage";
import CategoriasReportePage from "@/pages/reportes/CategoriasReportePage";
import WhatsAppTemplatesPage from "@/pages/whatsapp/plantillas/PlantillasPage";
import PadresPage from "@/pages/padres/PadresPage";
export default function AppRouter() {
  const { user } = useAuth();
  const isAuth = Boolean(user);
  const RequireRole = ({ roles, children }: { roles: string[]; children: ReactElement }) => {
    if (!user) return <Navigate to="/login" replace />;
    return roles.includes(user.role) ? children : <Navigate to="/" replace />;
  };
  return (
    <Routes>
      <Route
        path="/login"
        element={isAuth ? <Navigate to="/" replace /> : <LoginForm />}
      />
      <Route
        path="/padre"
        element={isAuth ? <Navigate to="/" replace /> : <PhoneLogin />}
      />
      {/* Todas las rutas que deben mostrar sidebar */}
      <Route
        element={
          isAuth ? <ProtectedLayout /> : <Navigate to="/login" replace />
        }
      >
        <Route path="/" element={user?.role === "profesor" ? <DashboardProfesor /> : <Dashboard />} />
        <Route path="/profesor" element={<RequireRole roles={["profesor","admin"]}><DashboardProfesor /></RequireRole>} />
        <Route path="/profesor/cursos" element={<RequireRole roles={["profesor","admin"]}><MisCursosPage /></RequireRole>} />
        <Route path="/profesor/cursos/:id" element={<RequireRole roles={["profesor","admin"]}><CursoDetallePage /></RequireRole>} />
        <Route path="/profesor/asistencias" element={<RequireRole roles={["profesor","admin"]}><AsistenciasProfesorPage /></RequireRole>} />
        <Route path="/profesor/reportes" element={<RequireRole roles={["profesor","admin"]}><ReportesProfesorPage /></RequireRole>} />
        <Route path="/academico/paralelos" element={<RequireRole roles={["admin"]}><Paralelos /></RequireRole>} />
        <Route path="/usuarios/profesores" element={<RequireRole roles={["admin"]}><TeachersPage /></RequireRole>} />
        <Route path="/academico/materias" element={<RequireRole roles={["admin"]}><MateriasPage /></RequireRole>} />
        <Route path="/academico/paralelo-curso-materia" element={<RequireRole roles={["admin"]}><ParaleloMateriasPage /></RequireRole>} />
        <Route path="/academico/paralelo-estudiantes" element={<RequireRole roles={["admin"]}><ParaleloEstudiantePage /></RequireRole>} />
        <Route path="/usuarios/estudiantes" element={<RequireRole roles={["admin"]}><EstudiantesPage /></RequireRole>} />
        <Route path="/academico/asistencias" element={<RequireRole roles={["admin"]}><AttendancePage /></RequireRole>} />
        <Route path="/agenda" element={<AgendaPage />} />

        <Route path="/reportes/categorias" element={<RequireRole roles={["admin"]}><CategoriasReportePage /></RequireRole>} />
        <Route path="/reportes" element={<RequireRole roles={["admin"]}><ReportsPage /></RequireRole>} />

        <Route path="/whatsapp/plantillas" element={<RequireRole roles={["admin"]}><WhatsAppTemplatesPage /></RequireRole>} />
        <Route path="/usuarios/padres" element={<RequireRole roles={["admin"]}><PadresPage /></RequireRole>} />



        {/* ... */}
      </Route>

      <Route
        path="*"
        element={<Navigate to={isAuth ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}
