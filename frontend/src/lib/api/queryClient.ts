import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./client";
import { attachPersistence } from "./persist";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 30 * 60_000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: (count, error) => count < 1 && !(error instanceof ApiError && error.status >= 400 && error.status < 500),
    },
  },
});

attachPersistence(queryClient);
