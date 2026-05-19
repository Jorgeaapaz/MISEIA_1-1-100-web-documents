import Link from "next/link";
import type { WebDocument } from "@/lib/types";
import { FileIcon } from "@/components/ui/FileIcon";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatFileSize } from "@/utils/format";

interface DocumentCardProps {
  document: WebDocument;
}

export function DocumentCard({ document: doc }: DocumentCardProps) {
  return (
    <Link
      href={`/documents/${doc._id}`}
      className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between">
        <FileIcon fileType={doc.fileType} className="h-10 w-10" />
        <Badge fileType={doc.fileType} />
      </div>

      <h3 className="mb-1 text-sm font-semibold text-foreground line-clamp-2 group-hover:text-accent">
        {doc.title}
      </h3>

      {doc.description && (
        <p className="mb-3 text-xs text-muted line-clamp-2">
          {doc.description}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between text-xs text-muted">
        <span>{formatFileSize(doc.fileSize)}</span>
        <span>{formatDate(doc.createdAt)}</span>
      </div>

      {doc.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {doc.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded bg-accent-light px-1.5 py-0.5 text-[10px] font-medium text-accent"
            >
              {tag}
            </span>
          ))}
          {doc.tags.length > 3 && (
            <span className="text-[10px] text-muted">
              +{doc.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
