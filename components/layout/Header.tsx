"use client";

import Link from "next/link";
import { useGlobal } from "@/context/GlobalContext";
import { Button } from "@/components/ui/Button";
import { APP_NAME } from "@/utils/constants";
import { Navbar } from "./Navbar";

export function Header() {
  const { user, setUser, loading } = useGlobal();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold text-accent">
            {APP_NAME}
          </Link>
          <Navbar />
        </div>

        <div className="flex items-center gap-3">
          {loading ? null : user ? (
            <>
              <span className="hidden text-sm text-muted sm:block">
                {user.name}
              </span>
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                Cerrar sesion
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="secondary" size="sm">
                  Iniciar sesion
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Registrarse</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
