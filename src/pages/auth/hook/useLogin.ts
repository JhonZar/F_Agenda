// src/hooks/useLogin.ts
import { useState, useCallback } from "react"
import { login as loginApi } from "@/api/login"    // o ruta donde tengas tu función login()
import type { LoginPayload, LoginResponse, User } from "@/api/login"

export interface UseLoginResult {
  user: User | null
  isLoading: boolean
  error: string | null
  login: (payload: LoginPayload) => Promise<void>
  logout: () => void
}

export function useLogin(): UseLoginResult {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user")
    return stored ? JSON.parse(stored) : null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true)
    setError(null)
    try {
      const data: LoginResponse = await loginApi(payload)
      localStorage.setItem("token", data.access_token)
      localStorage.setItem("user", JSON.stringify(data.user))
     
      setUser(data.user)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Error al loguearse")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    
  }, [])

  return { user, isLoading, error, login, logout }
}
