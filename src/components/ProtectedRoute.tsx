import { Navigate, Outlet, useLocation } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/authStore";

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/sign-in-2"
        search={{ redirect: location.pathname + location.search }}
        replace
      />
    );
  }

  return <Outlet />;
}
