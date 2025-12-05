type BaseOptions = {
  baseUrl?: string | null;
};

export type LoginResponse = {
  accessToken?: string;
};

export type Quiz = {
  id: number | string;
  eventId?: number;
  type?: string;
  questionText?: string;
  correctText?: string | null;
  quizDate?: string;
  questionOrder?: number;
  active?: boolean;
  createdDt?: string;
  options?: QuizOption[];
};

export type QuizOption = {
  id: number | string;
  quizId?: number;
  optionKey?: string;
  optionText?: string;
  correct?: boolean;
  optionOrder?: number;
};

export type QuizListResponse = {
  content: Quiz[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
};

export type EventItem = {
  id: number | string;
  name?: string;
  description?: string;
  startDt?: string;
  endDt?: string;
  participationStartTime?: string;
  participationEndTime?: string;
  attendanceStartTime?: string;
  attendanceEndTime?: string;
  intersectionParticipationStartTime?: string;
  intersectionParticipationEndTime?: string;
  intersectionAttendanceStartTime?: string;
  intersectionAttendanceEndTime?: string;
  maxDailyTry?: number;
  rewardLimitPerUser?: number;
  status?: string;
  createdDt?: string;
  updatedDt?: string;
};

export type RewardPolicy = {
  id: number | string;
  eventId?: number;
  name?: string;
  policyType?: string;
  startDt?: string;
  endDt?: string;
  winnerLimitTotal?: number | null;
  winnerLimitPerDay?: number | null;
  targetOrder?: number | null;
  nthScope?: string;
  userLimitTotal?: number | null;
  userLimitPerDay?: number | null;
  rewardType?: string;
  rewardValue?: string;
  createdDt?: string;
  updatedDt?: string;
};

const resolveBaseUrl = (baseUrl?: string | null) => {
  if (!baseUrl) return null;
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
};

export async function loginAdmin(
  email: string,
  password: string,
  options: BaseOptions = {},
): Promise<LoginResponse> {
  const normalized = resolveBaseUrl(options.baseUrl ?? process.env.NEXT_PUBLIC_API_URL);
  if (!normalized) {
    throw new Error("API URL이 설정되지 않았습니다. .env.local을 확인하세요.");
  }

  const endpoint = `${normalized}/api/auth/admin-login`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `로그인 요청 실패 (status ${response.status})`);
  }

  const data = (await response.json()) as LoginResponse;
  if (!data.accessToken) {
    throw new Error("응답에 accessToken이 없습니다.");
  }
  return data;
}

export async function fetchQuizzes(
  token: string,
  options: BaseOptions & { page?: number; size?: number } = {},
): Promise<QuizListResponse> {
  const normalized = resolveBaseUrl(options.baseUrl ?? process.env.NEXT_PUBLIC_API_URL);
  if (!normalized) {
    throw new Error("API URL이 설정되지 않았습니다. .env.local을 확인하세요.");
  }

  const searchParams = new URLSearchParams();
  if (typeof options.page === "number") {
    searchParams.set("page", String(options.page));
  }
  if (typeof options.size === "number") {
    searchParams.set("size", String(options.size));
  }

  const endpoint = `${normalized}/api/quizzes${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `퀴즈 목록 요청 실패 (status ${response.status})`);
  }

  const data = (await response.json()) as unknown;
  if (
    !data ||
    typeof data !== "object" ||
    !Array.isArray((data as QuizListResponse).content)
  ) {
    throw new Error("퀴즈 목록 응답 형식이 올바르지 않습니다.");
  }
  return data as QuizListResponse;
}

export async function fetchEvents(
  token: string,
  options: BaseOptions = {},
): Promise<EventItem[]> {
  const normalized = resolveBaseUrl(options.baseUrl ?? process.env.NEXT_PUBLIC_API_URL);
  if (!normalized) {
    throw new Error("API URL이 설정되지 않았습니다. .env.local을 확인하세요.");
  }

  const endpoint = `${normalized}/api/events`;
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `이벤트 목록 요청 실패 (status ${response.status})`);
  }

  const data = (await response.json()) as unknown;
  if (!Array.isArray(data)) {
    throw new Error("이벤트 목록 응답 형식이 올바르지 않습니다.");
  }
  return data as EventItem[];
}

export async function fetchRewardPolicies(
  token: string,
  options: BaseOptions = {},
): Promise<RewardPolicy[]> {
  const normalized = resolveBaseUrl(options.baseUrl ?? process.env.NEXT_PUBLIC_API_URL);
  if (!normalized) {
    throw new Error("API URL이 설정되지 않았습니다. .env.local을 확인하세요.");
  }

  const endpoint = `${normalized}/api/reward-policies`;
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      message || `정책 목록 요청 실패 (status ${response.status})`,
    );
  }

  const data = (await response.json()) as unknown;
  if (!Array.isArray(data)) {
    throw new Error("정책 목록 응답 형식이 올바르지 않습니다.");
  }
  return data as RewardPolicy[];
}
