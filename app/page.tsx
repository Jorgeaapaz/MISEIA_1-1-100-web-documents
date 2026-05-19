import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      {/* Hero */}
      <section className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Gestiona tus documentos web
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted">
          Sube, organiza y consulta tus archivos PDF, videos, audios e
          imagenes desde un solo lugar.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/documents"
            className="inline-flex items-center rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            Ver documentos
          </Link>
          <Link
            href="/documents/upload"
            className="inline-flex items-center rounded-lg border border-border bg-white px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent-light"
          >
            Subir archivo
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid gap-8 sm:grid-cols-3">
        <FeatureCard
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 text-accent">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
              <path d="M14 2v6h6M12 18v-6M9 15h6" />
            </svg>
          }
          title="Sube cualquier archivo"
          description="PDF, videos, audios, imagenes y mas. Almacenamiento seguro en la nube."
        />
        <FeatureCard
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 text-accent">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          }
          title="Busca y filtra"
          description="Encuentra lo que necesitas al instante con busqueda por nombre, tipo o etiquetas."
        />
        <FeatureCard
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 text-accent">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
              <path d="M16 6l-4-4-4 4M12 2v13" />
            </svg>
          }
          title="Comparte facilmente"
          description="Envia documentos por email directamente desde la plataforma."
        />
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-3">{icon}</div>
      <h3 className="mb-1 text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted">{description}</p>
    </div>
  );
}
