import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { Me } from "@/lib/types";
import AuthScreen from "@/components/auth/AuthScreen";
import AppShell from "@/components/layout/AppShell";
import { Toaster } from "@/components/ui/sonner";
import { BrandMark } from "@/components/common";

export default function Studium() {
  const [, setEpoch] = useState(0);
  const me = useQuery({ queryKey: ["me"], queryFn: () => apiGet<Me>("/auth/me"), retry: false, staleTime: 60_000 });

  let body;
  if (me.isPending) {
    body = (
      <div className="flex min-h-dvh items-center justify-center" data-testid="app-loading">
        <BrandMark className="size-9 animate-pulse" />
      </div>
    );
  } else if (me.isError || !me.data) {
    body = <AuthScreen onJoined={() => setEpoch((n) => n + 1)} />;
  } else {
    body = <AppShell me={me.data} />;
  }

  return (
    <>
      {body}
      <Toaster richColors theme="dark" />
    </>
  );
}
