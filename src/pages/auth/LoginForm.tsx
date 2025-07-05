import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom"; // Importa Link
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription, // Agrega CardDescription
  CardHeader,
  CardTitle,
  CardFooter, // Agrega CardFooter
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react"; // Iconos para mostrar/ocultar contraseña

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login, user, isLoading, error } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar contraseña

  // Si el contexto detecta un user, redirige y muestra toast
  useEffect(() => {
    if (user) {
      toast("¡Bienvenido!", {
        description: "Has iniciado sesión correctamente.",
      });
      navigate("/", { replace: true });
    }
  }, [user, navigate]); // toast no es necesario en las dependencias

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(""); // Limpia errores locales anteriores

    if (!email.trim()) {
      setLocalError("El correo electrónico es obligatorio.");
      return;
    }
    if (!password) {
      setLocalError("La contraseña es obligatoria.");
      return;
    }

    // login del contexto: si falla, 'error' se poblará ahí
    await login({ email, password });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900"> {/* Contenedor para centrar */}
      <Card className="w-full max-w-md mx-auto p-4 md:p-6 shadow-lg rounded-lg"> {/* Aumenta padding y sombra */}
        <CardHeader className="space-y-2 text-center"> {/* Espaciado y centrado */}
          <CardTitle className="text-3xl font-bold">Iniciar Sesión</CardTitle> {/* Tamaño de fuente y negrita */}
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Accede a tu cuenta para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5"> {/* Mayor espaciado entre elementos */}
            <div className="space-y-2"> {/* Espaciado para cada campo */}
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="w-full"
              />
            </div>
            <div className="space-y-2 relative"> {/* Contenedor para el icono de mostrar/ocultar */}
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                className="pr-10" // Espacio para el icono
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center pt-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* errores de validación local o del contexto */}
            {(localError || error) && (
              <span className="text-red-600 dark:text-red-400 text-sm font-medium text-center"> {/* Mejor color y centrado */}
                {localError || error}
              </span>
            )}

            <Button type="submit" className="w-full py-2" disabled={isLoading}> {/* Mayor altura en el botón */}
              {isLoading ? "Ingresando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pt-6"> {/* Footer para enlaces adicionales */}
          <Link
            to="/forgot-password"
            className="text-sm text-blue-600 hover:underline dark:text-blue-400 text-center"
          >
            ¿Olvidaste tu contraseña?
          </Link>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            ¿No tienes una cuenta?{" "}
            <Link to="/register" className="text-blue-600 hover:underline dark:text-blue-400">
              Regístrate
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginForm;