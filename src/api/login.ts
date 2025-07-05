import { api } from "./client";

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

export interface LoginResponse {
  message: string;
  user: User;
  access_token: string;
  token_type: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SendOtpPayload {
  phone: string;
}

export interface SendOtpResponse {
  message: string;
  status: string;
}
export interface VerifyOtpPayload {
  phone: string;
  otp: string;
}

// La respuesta de verify-otp es idéntica a LoginResponse (te devuelve user + token)
export type VerifyOtpResponse = LoginResponse;

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/login", payload);
  return response.data;
}
export async function sendOtp(
  payload: SendOtpPayload
): Promise<SendOtpResponse> {
  const response = await api.post<SendOtpResponse>("/send-otp", payload);
  return response.data;
}
export async function verifyOtp(
  payload: VerifyOtpPayload
): Promise<VerifyOtpResponse> {
  const response = await api.post<VerifyOtpResponse>("auth/verify-otp", payload);
  return response.data;
}
