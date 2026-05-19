import Link from "next/link";

export default function DocumentNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="mb-4 h-16 w-16 text-muted"
      >
        <path d="M7 2h7l5 5v14a1 1 0 01-1 1H7a1 1 0 01-1-1V3a1 1 0 011-1z" />
        <path d="M14 2v5h5" />
        <path d="M9 14l6 0M9 11l3 0" />
      </svg>
      <h2 className="mb-2 text-xl font-semibold text-foreground">
        Documento no encontrado
      </h2>
      <p className="mb-6 text-sm text-muted">
        El documento que buscas no existe o ha sido eliminado.
      </p>
      <Link
        href="/documents"
        className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
      >
        Ver todos los documentos
      </Link>
    </div>
  );
}
