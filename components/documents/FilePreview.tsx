"use client";

import type { FileType } from "@/lib/types";

interface FilePreviewProps {
  documentId: string;
  fileType: FileType;
  fileName: string;
}

export function FilePreview({ documentId, fileType, fileName }: FilePreviewProps) {
  const url = `/api/documents/${documentId}/download`;

  switch (fileType) {
    case "pdf":
      return (
        <iframe
          src={url}
          title={fileName}
          className="h-[600px] w-full rounded-lg border border-border"
        />
      );
    case "video":
      return (
        <video controls className="w-full rounded-lg">
          <source src={url} />
          Tu navegador no soporta la reproduccion de video.
        </video>
      );
    case "audio":
      return (
        <audio controls className="w-full">
          <source src={url} />
          Tu navegador no soporta la reproduccion de audio.
        </audio>
      );
    case "image":
      return (
        <img
          src={url}
          alt={fileName}
          className="max-h-[600px] w-full rounded-lg object-contain"
        />
      );
    default:
      return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-white p-8">
          <p className="mb-3 text-sm text-muted">
            Vista previa no disponible para este tipo de archivo.
          </p>
          <a
            href={url}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
          >
            Descargar {fileName}
          </a>
        </div>
      );
  }
}
