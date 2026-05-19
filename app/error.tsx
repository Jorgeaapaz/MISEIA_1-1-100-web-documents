"use client";

import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="mb-4 h-16 w-16 text-danger"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
      <h2 className="mb-2 text-2xl font-bold text-foreground">
        Algo salio mal
      </h2>
      <p className="mb-6 max-w-md text-sm text-muted">
        Ha ocurrido un error inesperado. Puedes intentar de nuevo o volver a la
        pagina principal.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>Intentar de nuevo</Button>
        <Button variant="secondary" onClick={() => (window.location.href = "/")}>
          Ir al inicio
        </Button>
      </div>
    </div>
  );
}
