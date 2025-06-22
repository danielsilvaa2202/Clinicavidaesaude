import Cookies from "js-cookie";
import { createFileRoute, Outlet, useRouter } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { SearchProvider } from "@/context/search-context";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import SkipToMain from "@/components/skip-to-main";
import { useAuthStore } from "@/stores/authStore";
import { useEffect } from "react";

export const Route = createFileRoute("/_authenticated")({
  component: RouteComponent,
});

function RouteComponent() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();
  const defaultOpen = Cookies.get("sidebar:state") !== "false";

  useEffect(() => {
    console.log("Is Authenticated:", isAuthenticated);
    if (!isAuthenticated) {
      const currentUrl = window.location.pathname + window.location.search;
      router.navigate({
        to: "/sign-in-2",
        search: { redirect: encodeURIComponent(currentUrl) },
      });
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <div>Redirecionando...</div>;
  }

  return (
    <SearchProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <SkipToMain />
        <AppSidebar />
        <div
          id="content"
          className={cn(
            "max-w-full w-full ml-auto",
            "peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]",
            "peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]",
            "transition-[width] ease-linear duration-200",
            "h-svh flex flex-col"
          )}
        >
          <Outlet />
        </div>
      </SidebarProvider>
    </SearchProvider>
  );
}
