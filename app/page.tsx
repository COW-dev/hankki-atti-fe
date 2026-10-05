"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { ErrorCode } from "@/lib/api/error-codes";
import { homePathOf, useAuth, type Me } from "@/lib/auth/AuthProvider";

// 첫 화면: 로그인 상태에 따라 알맞은 화면으로 보낸다 (소개 화면 M-01은 아직 없다)
export default function Home() {
  const router = useRouter();
  const { status, authRequest } = useAuth();

  useEffect(() => {
    if (status === "anonymous") router.replace("/login");
    if (status !== "authenticated") return;
    authRequest<Me>("/api/me")
      .then((me) => router.replace(homePathOf(me.role)))
      .catch((error) => {
        const mustChange = error instanceof ApiError && error.code === ErrorCode.PASSWORD_CHANGE_REQUIRED;
        router.replace(mustChange ? "/password/change" : "/login");
      });
  }, [status, authRequest, router]);

  return null;
}
