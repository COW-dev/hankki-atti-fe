"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ApiError, apiRequest } from "@/lib/api/client";

export type Role = "STUDENT" | "HELPER" | "ADMIN";

type LoginResponse = { accessToken: string; expiresIn: number; role: Role; mustChangePassword: boolean };
type TokenResponse = { accessToken: string; expiresIn: number };
export type Me = { accountId: number; loginId: string; role: Role; accessibilityMode: boolean };

type AuthStatus = "loading" | "authenticated" | "anonymous";

type AuthContextValue = {
  status: AuthStatus;
  login: (loginId: string, password: string) => Promise<LoginResponse>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  authRequest: <T>(
    path: string,
    options?: { method?: "GET" | "POST" | "PATCH" | "DELETE"; body?: unknown },
  ) => Promise<T>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// 재발급은 동시에 여러 번 불려도 한 번만 보낸다.
// 같은 refresh 토큰을 두 번 쓰면 서버가 탈취로 보고 그 계정의 토큰을 모두 폐기하기 때문이다 (개발 모드 React는 effect를 두 번 실행한다)
let refreshInFlight: Promise<TokenResponse> | null = null;

function refreshOnce(): Promise<TokenResponse> {
  if (!refreshInFlight) {
    refreshInFlight = apiRequest<TokenResponse>("/api/auth/refresh", { method: "POST" }).finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

/**
 * 로그인 상태. access 토큰은 메모리에만 두고(새로고침하면 사라짐), refresh 토큰 쿠키로 다시 받는다.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    refreshOnce()
      .then((tokens) => {
        setAccessToken(tokens.accessToken);
        setStatus("authenticated");
      })
      .catch(() => setStatus("anonymous"));
  }, []);

  const login = useCallback(async (loginId: string, password: string) => {
    const result = await apiRequest<LoginResponse>("/api/auth/login", { method: "POST", body: { loginId, password } });
    setAccessToken(result.accessToken);
    setStatus("authenticated");
    return result;
  }, []);

  const authRequest = useCallback(
    async <T,>(path: string, options: { method?: "GET" | "POST" | "PATCH" | "DELETE"; body?: unknown } = {}) => {
      try {
        return await apiRequest<T>(path, { ...options, accessToken });
      } catch (error) {
        // access 토큰이 만료(30분)됐으면 한 번 재발급받아 다시 보낸다
        if (!(error instanceof ApiError) || error.status !== 401) throw error;
        try {
          const tokens = await refreshOnce();
          setAccessToken(tokens.accessToken);
          return await apiRequest<T>(path, { ...options, accessToken: tokens.accessToken });
        } catch (retryError) {
          setAccessToken(null);
          setStatus("anonymous");
          throw retryError;
        }
      }
    },
    [accessToken],
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      // 비밀번호를 바꾸면 다른 기기는 로그아웃되고, 지금 기기는 새 토큰을 받는다
      const tokens = await authRequest<TokenResponse>("/api/auth/password", {
        method: "PATCH",
        body: { currentPassword, newPassword },
      });
      setAccessToken(tokens.accessToken);
    },
    [authRequest],
  );

  const logout = useCallback(async () => {
    await apiRequest("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    setAccessToken(null);
    setStatus("anonymous");
  }, []);

  const value = useMemo(
    () => ({ status, login, changePassword, logout, authRequest }),
    [status, login, changePassword, logout, authRequest],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth는 AuthProvider 안에서만 쓸 수 있어요.");
  return context;
}

export function homePathOf(role: Role) {
  return role === "HELPER" ? "/matches" : "/requests";
}
