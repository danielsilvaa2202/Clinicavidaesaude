import { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Toaster } from "@/components/ui/toaster";

import GeneralError from "@/features/errors/general-error";
import NotFoundError from "@/features/errors/not-found-error";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: () => {
    return (
      <>
        <Outlet />
        <Toaster />

        {import.meta.env.MODE === "development" && (
          <>
            <ReactQueryDevtools
              position={"bottom-left" as any}
              initialIsOpen={false}
            />
            <TanStackRouterDevtools position="bottom-right" />
          </>
        )}
      </>
    );
  },
  notFoundComponent: NotFoundError,
  errorComponent: ({ error }: { error: any }) => {
  const code = (error as any)?.status ?? 500;
  return <GeneralError code={code} />;
},
});
