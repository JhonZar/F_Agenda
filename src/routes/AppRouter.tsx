import { Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "@/pages/auth/LoginForm";
import Dashboard from "@/pages/admin/Dashboard";
import ProtectedLayout from "@/layouts/ProtectedLayout";
import { useAuth } from "@/context/AuthContext";
import PhoneLogin from "@/pages/auth/PhoneLogin";
import Paralelos from "@/pages/paralelos/Paralelos";
import TeachersPage from "@/pages/profesores/TeachersPage";
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

        {/* ... */}
      </Route>

      <Route
        path="*"
        element={<Navigate to={isAuth ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}
