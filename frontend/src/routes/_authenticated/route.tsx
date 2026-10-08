import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Cursor } from "@/components/site/Cursor";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,

  beforeLoad: () => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw redirect({
        to: "/auth",
      });
    }

    return {};
  },

  component: () => (
    <>
      <Cursor />
      <Outlet />
    </>
  ),
});