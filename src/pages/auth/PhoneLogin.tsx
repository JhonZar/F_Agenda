// src/pages/auth/PhoneLogin.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useSendOtp } from "@/hooks/useOtp";

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChange,
  disabled = false,
}) => {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number
  ) => {
    const digit = e.target.value.replace(/\D/g, "").slice(-1);
    const newValArr = value.split("").slice(0, length);
    newValArr[idx] = digit;
    const newVal = newValArr.join("").padEnd(length, " ");
    onChange(newVal.trim());
    if (digit && idx < length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) => {
    if (e.key === "Backspace" && !value[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!paste) return;
    // Tomamos solo los primeros `length` dígitos
    const digits = paste.slice(0, length).split("");
    // Rellenamos array hasta length
    const newValArr = Array(length).fill("");
    digits.forEach((d, i) => (newValArr[i] = d));
    const newVal = newValArr.join("");
    onChange(newVal);
    // Ponemos focus al final del bloque pegado
    const lastIndex = Math.min(digits.length, length) - 1;
    inputsRef.current[lastIndex]?.focus();
  };

  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={el => { inputsRef.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          disabled={disabled}
          value={value[idx] || ""}
          onChange={e => handleChange(e, idx)}
          onKeyDown={e => handleKeyDown(e, idx)}
          onPaste={idx === 0 ? handlePaste : undefined}
          className={`
            w-12 h-12 text-center text-xl font-medium
            border rounded-lg
            bg-gray-50 dark:bg-gray-800
            border-gray-300 dark:border-gray-600
            focus:outline-none focus:ring-2 focus:ring-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        />
      ))}
    </div>
  );
};

const PhoneLogin: React.FC = () => {
  const navigate = useNavigate();
  const { user, verifyOtp, error: authError } = useAuth();
  const {
    requestOtp,
    isLoading: isSendingOtp,
    response,
    error: otpError,
  } = useSendOtp();

  const [localNumber, setLocalNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [localError, setLocalError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  useEffect(() => {
    if (user) {
      toast("¡Bienvenido!", { description: "Has iniciado sesión correctamente." });
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (!/^\d{8}$/.test(localNumber)) {
      setLocalError("Ingresa un número válido de 8 dígitos.");
      return;
    }

    const fullPhone = `+591${localNumber}`;
    try {
      const res = await requestOtp({ phone: fullPhone });
      if ((res && res.status === "otp_sent") || response) {
        setOtpSent(true);
        toast("Código OTP enviado", {
          description: "Revisa tu WhatsApp para el código de verificación.",
        });
      } else {
        setLocalError(res?.message || "Error al enviar el OTP. Intenta de nuevo.");
      }
    } catch (err: any) {
      setLocalError(err.message || "Error al enviar el OTP.");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (otpCode.trim().length !== 6) {
      setLocalError("El código OTP debe tener 6 dígitos.");
      return;
    }

    setIsVerifyingOtp(true);
    try {
      await verifyOtp({ phone: `+591${localNumber}`, otp: otpCode });
      toast("Inicio de sesión exitoso", {
        description: "Has accedido a tu cuenta.",
      });
    } catch (err: any) {
      setLocalError(
        err.response?.data?.message || authError || "Código OTP inválido o expirado."
      );
      toast("Error de verificación", {
        description: "No se pudo verificar el código. Intenta nuevamente.",
      });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-white dark:bg-gray-800 p-6 text-center space-y-2">
          <CardTitle className="text-2xl font-bold">
            {otpSent ? "Verificar Código OTP" : "Ingresar con Teléfono"}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {otpSent
              ? "Hemos enviado un código a tu WhatsApp. Ingrésalo abajo."
              : "Ingresa tu número de teléfono (8 dígitos)."}
          </CardDescription>
        </CardHeader>

        <CardContent className="bg-white dark:bg-gray-800 p-6">
          <form
            onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
            className="flex flex-col gap-6"
          >
            {!otpSent ? (
              <div className="space-y-2">
                <Label htmlFor="phone">Número de Teléfono</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    +591
                  </span>
                  <Input
                    id="phone"
                    type="tel"
                    value={localNumber}
                    onChange={e =>
                      setLocalNumber(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="71234567"
                    maxLength={8}
                    disabled={isSendingOtp}
                    className="rounded-none rounded-r-lg w-full"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="otp">Código OTP</Label>
                <OTPInput
                  length={6}
                  value={otpCode}
                  onChange={setOtpCode}
                  disabled={isVerifyingOtp}
                />
              </div>
            )}

            {(localError || authError || otpError) && (
              <p className="text-red-600 dark:text-red-400 text-sm text-center">
                {localError || authError || otpError}
              </p>
            )}

            <Button
              type="submit"
              className="w-full py-2"
              disabled={isSendingOtp || isVerifyingOtp}
            >
              {otpSent
                ? isVerifyingOtp
                  ? "Verificando..."
                  : "Verificar OTP"
                : isSendingOtp
                ? "Enviando..."
                : "Enviar Código OTP"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="bg-white dark:bg-gray-800 p-6 flex flex-col items-center gap-4">
          {otpSent && (
            <button
              onClick={() => {
                setOtpSent(false);
                setOtpCode("");
                setLocalError("");
                toast("Puedes solicitar un nuevo código.", {
                  description: "Reenvío disponible ahora.",
                });
              }}
              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              Cambiar número / Reenviar código
            </button>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ¿Prefieres iniciar con correo?{" "}
            <Link
              to="/login"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              Ir a Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PhoneLogin;
