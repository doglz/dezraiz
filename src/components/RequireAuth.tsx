import { Navigate, useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";

export function RequireAuth({
  children,
  requireOnboarding = true,
}: {
  children: ReactNode;
  requireOnboarding?: boolean;
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;
  if (requireOnboarding && !user.onboarding && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" />;
  }
  if (user.onboarding && location.pathname === "/onboarding") {
    return <Navigate to="/" />;
  }
  return <>{children}</>;
}
