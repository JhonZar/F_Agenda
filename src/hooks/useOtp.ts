import { useState } from "react";
import { sendOtp, type SendOtpPayload, type SendOtpResponse } from "@/api/login";

export function useSendOtp() {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<SendOtpResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestOtp = async (payload: SendOtpPayload) => {
    setIsLoading(true);
    setError(null);
    setResponse(null);
    try {
      const res = await sendOtp(payload);
      setResponse(res);
      return res;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error enviando OTP");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { requestOtp, isLoading, response, error };
}