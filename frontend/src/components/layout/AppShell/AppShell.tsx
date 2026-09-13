import type { ReactNode } from "react";
import { AppFooter } from "../AppFooter/AppFooter";
import { AppHeader } from "../AppHeader/AppHeader";
import "./AppShell.css";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell">
      <AppHeader />
      <main className="container app-shell__main">{children}</main>
      <AppFooter />
    </div>
  );
}
