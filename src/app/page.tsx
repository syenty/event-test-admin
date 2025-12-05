"use client";

import { useEffect, useState } from "react";
import { DashboardView } from "@/components/DashboardView";
import { EventsView } from "@/components/EventsView";
import { LoginForm } from "@/components/LoginForm";
import { PoliciesView } from "@/components/PoliciesView";
import { QuizView } from "@/components/QuizView";
import { Sidebar } from "@/components/Sidebar";

export default function Home() {
  const [selectedMenu, setSelectedMenu] = useState<
    "dashboard" | "quiz" | "events" | "policies"
  >(
    "dashboard",
  );
  const [token, setToken] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const savedToken = typeof window !== "undefined"
      ? window.localStorage.getItem("accessToken")
      : null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToken(savedToken);
    setIsHydrated(true);
  }, []);

  const handleLoginSuccess = (accessToken: string) => {
    window.localStorage.setItem("accessToken", accessToken);
    setToken(accessToken);
    setSelectedMenu("dashboard");
  };

  const handleLogout = () => {
    window.localStorage.removeItem("accessToken");
    setToken(null);
    setSelectedMenu("dashboard");
  };

  return (
    <div className="min-h-screen bg-neutral-100 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-500">Admin Console</p>
            <h1 className="text-2xl font-semibold text-neutral-900">
              이벤트 테스트 관리자
            </h1>
            <p className="text-xs text-neutral-600">
              API: {apiUrl ?? "환경변수 미설정"}
            </p>
          </div>
          {token ? (
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                로그인됨
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-800 shadow-sm transition hover:bg-neutral-50"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <span className="rounded-full bg-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-700">
              로그인 필요
            </span>
          )}
        </header>

        {!isHydrated ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-6 text-sm text-neutral-500 shadow-sm">
            초기화 중...
          </div>
        ) : !token ? (
          <LoginForm apiUrl={apiUrl} onSuccess={handleLoginSuccess} />
        ) : (
          <div className="flex items-start gap-6">
            <div className="flex-[1] min-w-[200px] max-w-[320px]">
              <Sidebar selected={selectedMenu} onSelect={setSelectedMenu} />
            </div>

            <main className="flex-[4] rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
              {selectedMenu === "dashboard" ? <DashboardView /> : null}
              {selectedMenu === "quiz" && token ? (
                <QuizView token={token} apiUrl={apiUrl} />
              ) : null}
              {selectedMenu === "events" && token ? (
                <EventsView token={token} apiUrl={apiUrl} />
              ) : null}
              {selectedMenu === "policies" && token ? (
                <PoliciesView token={token} apiUrl={apiUrl} />
              ) : null}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
