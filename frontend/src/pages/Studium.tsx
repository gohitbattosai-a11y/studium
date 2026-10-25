import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { Me } from "@/lib/types";
import AuthScreen from "@/components/auth/AuthScreen";
import AppShell from "@/components/layout/AppShell";
import UpdatingScreen from "@/components/release/UpdatingScreen";
import { useStatus } from "@/lib/queries";
import { Toaster } from "@/components/ui/sonner";
import { BrandMark } from "@/components/common";

export default function Studium() {
  const [, setEpoch] = useState(0);
  const status = useStatus();
  const me = useQuery({ queryKey: ["me"], queryFn: () => apiGet<Me>("/auth/me"), retry: false, staleTime: 60_000 });

  let body;
  if (me.isPending) {
    body = (
      <div className="flex min-h-dvh items-center justify-center" data-testid="app-loading">
        <BrandMark className="size-9 animate-pulse" />
      </div>
    );
  } else if (me.isError || !me.data) {
    body = (
      <>
        {status.data?.updating && (
          <div className="bg-[#342207] px-4 py-2 text-center text-sm text-[#E3B341]" data-testid="auth-updating-note">
            Aggiornamento in corso: in questo momento possono entrare solo gli admin.
          </div>
        )}
        <AuthScreen onJoined={() => setEpoch((n) => n + 1)} />
      </>
    );
  } else if (status.data?.updating && me.data.role !== "admin") {
    body = <UpdatingScreen status={status.data} />;
  } else {
    body = <AppShell me={me.data} status={status.data} />;
  }

  return (
    <>
      {body}
      <Toaster richColors theme="dark" />
    </>
  );
}
