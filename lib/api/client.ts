// 백엔드 응답 형식 (ApiResult). 실패 응답에는 오류를 구분하는 code가 있다 — 분기는 message가 아니라 code로 한다 (error-codes.ts)
type ApiResult<T> = {
  resultType: "SUCCESS" | "FAIL";
  httpStatusCode: number;
  code?: string;
  message: string;
  data?: T;
};

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string | undefined,
    message: string,
  ) {
    super(message);
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  accessToken?: string | null;
};

/**
 * 백엔드 API를 부르고 data만 돌려준다. 실패하면 ApiError를 던진다.
 * refresh 토큰이 HttpOnly 쿠키라 모든 요청에 credentials: "include"를 붙인다.
 */
export async function apiRequest<T>(
  path: string,
  { method = "GET", body, accessToken }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "include",
    });
  } catch {
    throw new ApiError(0, undefined, "서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  const result = (await response.json().catch(() => null)) as ApiResult<T> | null;
  if (!response.ok || result?.resultType !== "SUCCESS") {
    throw new ApiError(response.status, result?.code, result?.message ?? "요청을 처리하지 못했어요.");
  }
  return result.data as T;
}
