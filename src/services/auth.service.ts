import { api } from "@/lib/axios";

export interface LoginPayload {
  loginId: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    account: {
      id: string;
      loginId: string;
      roles: string;
      status: string;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}

export const authService = {
  login: (payload: LoginPayload) =>
    api.post<LoginResponse>("/auth/login-with-password", payload).then((r) => r.data),

  refreshToken: (refreshToken: string) =>
    api.post<{ accessToken: string }>("/auth/refresh", { refreshToken }).then((r) => r.data),
};
