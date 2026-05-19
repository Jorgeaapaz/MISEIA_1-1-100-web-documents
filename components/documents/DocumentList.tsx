import type { WebDocument } from "@/lib/types";
import { DocumentCard } from "./DocumentCard";

interface DocumentListProps {
  documents: WebDocument[];
}

export function DocumentList({ documents }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="mb-4 h-16 w-16 text-muted"
        >
          <path d="M7 2h7l5 5v14a1 1 0 01-1 1H7a1 1 0 01-1-1V3a1 1 0 011-1z" />
          <path d="M14 2v5h5" />
        </svg>
        <h3 className="mb-1 text-lg font-semibold text-foreground">
          No hay documentos
        </h3>
        <p className="text-sm text-muted">
          Sube tu primer documento para empezar.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {documents.map((doc) => (
        <DocumentCard key={doc._id?.toString()} document={doc} />
      ))}
    </div>
  );
}
