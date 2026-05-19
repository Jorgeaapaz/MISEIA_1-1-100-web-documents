import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-2 text-6xl font-bold text-accent">404</h1>
      <h2 className="mb-2 text-xl font-semibold text-foreground">
        Pagina no encontrada
      </h2>
      <p className="mb-6 text-sm text-muted">
        La pagina que buscas no existe o ha sido movida.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
