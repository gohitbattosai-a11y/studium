import { queryClient } from "./queryClient";
import { apiPost } from "./client";
import { forgetPersisted } from "./persist";

export function beginSession(): void {
  forgetPersisted();
  queryClient.clear();
}

export async function endSession(redirectTo: string = "/login"): Promise<void> {
  try {
    await apiPost("/auth/logout");
  } finally {
    forgetPersisted();
    queryClient.clear();
    window.location.assign(redirectTo);
  }
}
