// src/contexts/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { socket } from "@/utils/socket";

// API methods
import {
  login as loginApi,
  type LoginPayload,
  type LoginResponse,
} from "@/api/login";
import {
  sendOtp as sendOtpApi,
  type SendOtpPayload,
  type SendOtpResponse,
  verifyOtp as verifyOtpApi,
  type VerifyOtpPayload,
  type VerifyOtpResponse,
} from "@/api/login";

// Tu modelo de usuario
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;

  // login/password
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<void>;

  // OTP
  sendOtp: (payload: SendOtpPayload) => Promise<SendOtpResponse>;
  otpLoading: boolean;
  otpError: string | null;

  verifyOtp: (payload: VerifyOtpPayload) => Promise<void>;
  verifyLoading: boolean;
  verifyError: string | null;

  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // --- usuario persistido ---
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  // --- login/email-password ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- envío de OTP ---
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // --- verificación de OTP ---
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Manejo de socket al autenticar/desconectar
  useEffect(() => {
    if (user) {
      socket.auth = { token: localStorage.getItem("access_token") };
      socket.connect();
    } else {
      socket.disconnect();
    }
  }, [user]);

  // --- Función de login tradicional ---
  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const data: LoginResponse = await loginApi(payload);
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
    } catch (err: any) {
      setError(err.response?.data?.message ?? err.message ?? "Error al loguearse");
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- Función para solicitar envío de OTP ---
  const sendOtp = useCallback(async (payload: SendOtpPayload) => {
    setOtpLoading(true);
    setOtpError(null);
    try {
      const res: SendOtpResponse = await sendOtpApi(payload);
      return res;
    } catch (err: any) {
      setOtpError(err.response?.data?.message ?? err.message ?? "Error al enviar OTP");
      return Promise.reject(err);
    } finally {
      setOtpLoading(false);
    }
  }, []);

  // --- Función para verificar el OTP y loguear ---
  const verifyOtp = useCallback(async (payload: VerifyOtpPayload) => {
    setVerifyLoading(true);
    setVerifyError(null);
    try {
      const data: VerifyOtpResponse = await verifyOtpApi(payload);

      // Al verificar correctamente, guardamos token y usuario igual que en login()
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
    } catch (err: any) {
      setVerifyError(err.response?.data?.message ?? err.message ?? "Error al verificar OTP");
      return Promise.reject(err);
    } finally {
      setVerifyLoading(false);
    }
  }, []);

  // --- Función de logout ---
  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,

        isLoading,
        error,
        login,

        sendOtp,
        otpLoading,
        otpError,

        verifyOtp,
        verifyLoading,
        verifyError,

        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/** Hook para consumir el AuthContext */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
