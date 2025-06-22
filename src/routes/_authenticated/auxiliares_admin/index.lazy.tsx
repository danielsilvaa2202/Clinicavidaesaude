import AuxiliaresPage from "@/features/apps/auxiliares_admin";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute(
  '/_authenticated/auxiliares_admin/',
)({
  component: AuxiliaresPage,
})
