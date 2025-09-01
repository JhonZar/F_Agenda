import { Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "@/pages/auth/LoginForm";
import Dashboard from "@/pages/admin/Dashboard";
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
        <Route path="/" element={<Dashboard />} />
        <Route path="/academico/paralelos" element={<Paralelos />} />
        <Route path="/usuarios/profesores" element={<TeachersPage />} />
        <Route path="/academico/materias" element={<MateriasPage />} />
        <Route
          path="/academico/paralelo-curso-materia"
          element={<ParaleloMateriasPage />}
        />
        <Route
          path="/academico/paralelo-estudiantes"
          element={<ParaleloEstudiantePage />}
        />
        <Route path="/usuarios/estudiantes" element={<EstudiantesPage />} />
        <Route path="/academico/asistencias" element={<AttendancePage />} />
        <Route path="/agenda" element={<AgendaPage />} />

        <Route
          path="/reportes/categorias"
          element={<CategoriasReportePage />}
        />
        <Route path="/reportes" element={<ReportsPage />} />

        <Route path="/whatsapp/plantillas" element={<WhatsAppTemplatesPage />} />
        <Route path="/usuarios/padres" element={<PadresPage />} />



        {/* ... */}
      </Route>

      <Route
        path="*"
        element={<Navigate to={isAuth ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}
