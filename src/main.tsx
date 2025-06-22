// src/main.tsx

import { StrictMode, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { AxiosError } from "axios";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/authStore";
import { handleServerError } from "@/utils/handle-server-error";
import { toast } from "@/hooks/use-toast";
import { ThemeProvider } from "@/context/theme-context";
import "./index.css";

import { routeTree } from "./routeTree.gen";
import GeneralError from "@/features/errors/general-error";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (import.meta.env.DEV) {
          console.log("[React Query Retry]", { failureCount, error });
        }
        if (failureCount > 3) return false;
        return true;
      },
      refetchOnWindowFocus: import.meta.env.PROD,
      staleTime: 10 * 1000,
    },
    mutations: {
      onError: (error) => {
        handleServerError(error);
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          fetch("http://localhost:5000/api/logout", {
            method: "POST",
            credentials: "include",
          }).finally(() => {
            toast({
              variant: "destructive",
              title: "Sessão expirada!",
            });
            useAuthStore.getState().reset();
            const redirect = window.location.href;
            router.navigate({ to: "/sign-in-2", search: { redirect } });
          });
        } else if (error.response?.status === 500) {
          toast({
            variant: "destructive",
            title: "Erro interno do servidor!",
          });
          throw new Response(null, { status: 500 });
        }
      }
    },
  }),
});

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  defaultErrorComponent: ({ error }: { error: any }) => {
    const status = (error as any)?.status ?? 500;
    return <GeneralError code={status} />;
  },
});

function App() {
  const verifyLogin = useAuthStore((state) => state.verifyLogin);

  useEffect(() => {
    verifyLogin().catch(() => {});
  }, [verifyLogin]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const rootElement = document.getElementById("root");
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
