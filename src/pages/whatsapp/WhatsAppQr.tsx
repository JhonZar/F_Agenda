// src/components/WhatsAppQr.tsx
import { useEffect, useState, useCallback } from "react"
import { socket } from "@/utils/socket"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  WifiOff,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  QrCode,
  LogOut,
  Loader2,
  Copy,
  Download,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type WhatsAppStatus =
  | "initializing"
  | "connected"
  | "not_connected"
  | "connecting"
  | "error"

interface ConnectionStats {
  lastConnected?: string
  sessionDuration?: string
  messagesCount?: number
}

export default function WhatsAppQr() {
  const [qr, setQr] = useState<string | null>(null)
  const [status, setStatus] = useState<WhatsAppStatus>("initializing")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionProgress, setConnectionProgress] = useState(0)
  const [stats, setStats] = useState<ConnectionStats>({})

  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL!

  const attachListeners = useCallback(() => {
    socket.on("connect", () => {
      setIsLoading(false)
      setError(null)
    })

    socket.on("connect_error", () => {
      setIsLoading(false)
      setError("No se puede conectar al servidor. ¿Está levantado?")
      setStatus("error")
    })

    socket.on(
      "status",
      (data: { connected: boolean; qr?: string; stats?: ConnectionStats }) => {
        setStatus(data.connected ? "connected" : "not_connected")
        setConnectionProgress(data.connected ? 100 : 0)
        setQr(data.qr ?? null)
        setStats(data.stats ?? {})
        setIsLoading(false)
        setError(null)
      }
    )

    socket.on("qr", (url: string) => {
      setQr(url)
      setStatus("not_connected")
      setIsLoading(false)
    })

    socket.on("connecting", () => {
      setStatus("connecting")
      setConnectionProgress(10)
    })

    socket.on("whatsapp_error", (msg: string) => {
      setError(msg)
      setStatus("error")
      setIsLoading(false)
    })
  }, [])

  const initConnection = useCallback(() => {
    // limpia estado y arranca
    setIsLoading(true)
    setError(null)
    socket.removeAllListeners()
    attachListeners()
    socket.connect()
  }, [attachListeners])

  useEffect(() => {
    initConnection()
    return () => {
      if (socket.connected) socket.disconnect()
      socket.removeAllListeners()
    }
  }, [initConnection])

  const handleLogout = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `${SOCKET_URL.replace(/\/$/, "")}/api/whatsapp/logout`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      )
      if (!res.ok) throw new Error()
      // reiniciar estado visual
      setQr(null)
      setStatus("not_connected")
      setStats({})
      setConnectionProgress(0)
      initConnection()
    } catch {
      setError("Error al cerrar sesión. Inténtalo otra vez.")
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    initConnection()
  }

  const copyQr = async () => {
    if (qr) {
      await navigator.clipboard.writeText(qr)
    }
  }

  const downloadQr = () => {
    if (!qr) return
    const a = document.createElement("a")
    a.href = qr
    a.download = "whatsapp-qr.png"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  useEffect(() => {
    if (status === "connecting") {
      const iv = setInterval(() => {
        setConnectionProgress((p) => (p >= 90 ? p : p + Math.random() * 10))
      }, 500)
      return () => clearInterval(iv)
    } else {
      setConnectionProgress(0)
    }
  }, [status])

  const cfg = (() => {
    switch (status) {
      case "connected":
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          title: "WhatsApp Conectado",
          desc: "Listo para enviar mensajes",
          badge: "bg-green-100 text-green-800 border-green-200",
          btnLabel: "Desvincular",
          isDestructive: true,
        }
      case "not_connected":
        return {
          icon: <WifiOff className="h-5 w-5 text-red-600" />,
          title: "No Conectado",
          desc: "Escanea el QR para vincular",
          badge: "bg-red-100 text-red-800 border-red-200",
          btnLabel: "Actualizar",
          isDestructive: false,
        }
      case "connecting":
        return {
          icon: <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />,
          title: "Conectando...",
          desc: "Espere un momento",
          badge: "bg-blue-100 text-blue-800 border-blue-200",
          btnLabel: "Actualizar",
          isDestructive: false,
        }
      case "error":
        return {
          icon: <AlertCircle className="h-5 w-5 text-red-600" />,
          title: "Error de Conexión",
          desc: "Hubo un problema",
          badge: "bg-red-100 text-red-800 border-red-200",
          btnLabel: "Actualizar",
          isDestructive: false,
        }
      default:
        return {
          icon: <Loader2 className="h-5 w-5 text-gray-600 animate-spin" />,
          title: "Inicializando...",
          desc: "Cargando estado...",
          badge: "bg-gray-100 text-gray-800 border-gray-200",
          btnLabel: "Actualizar",
          isDestructive: false,
        }
    }
  })()

  return (
    <TooltipProvider>
      <div className="space-y-6 p-4 md:p-8 pt-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">{cfg.title}</h2>
            <p className="text-slate-600">{cfg.desc}</p>
          </div>
          <Badge className={cfg.badge}>
            {cfg.icon}
            <span className="ml-2">{cfg.title}</span>
          </Badge>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {cfg.icon}
                {cfg.title}
              </CardTitle>
              <CardDescription>{cfg.desc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(status === "connecting" || status === "initializing") && (
                <Progress value={connectionProgress} className="h-2" />
              )}
              {status === "connected" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-green-50 border border-green-200 rounded text-center">
                    <div className="text-2xl font-bold text-green-700">
                      {stats.messagesCount || 0}
                    </div>
                    <div className="text-xs text-green-600">
                      Mensajes enviados
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded text-center">
                    <div className="text-sm font-semibold text-blue-700">
                      {stats.sessionDuration || "N/A"}
                    </div>
                    <div className="text-xs text-blue-600">Tiempo activo</div>
                  </div>
                </div>
              )}
              <Button
                onClick={status === "connected" ? handleLogout : handleRefresh}
                disabled={isLoading}
                variant={cfg.isDestructive ? "destructive" : "outline"}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : status === "connected" ? (
                  <LogOut className="mr-2 h-4 w-4" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                {cfg.btnLabel}
              </Button>
            </CardContent>
          </Card>

          {/* QR Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-slate-600" />
                Código QR
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              {status === "not_connected" && qr ? (
                <>
                  <img
                    src={qr}
                    alt="QR WhatsApp"
                    className="mx-auto w-64 h-64"
                  />
                  <div className="flex justify-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button onClick={copyQr} size="sm" variant="outline">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copiar QR</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={downloadQr}
                          size="sm"
                          variant="outline"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Descargar QR</TooltipContent>
                    </Tooltip>
                  </div>
                </>
              ) : status === "not_connected" && !qr ? (
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              ) : status === "connected" ? (
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}
