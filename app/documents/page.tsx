import { Suspense } from "react";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { DEFAULT_PAGE_SIZE } from "@/utils/constants";
import type { WebDocument, FileType } from "@/lib/types";
import { DocumentList } from "@/components/documents/DocumentList";
import { SearchBar } from "@/components/documents/SearchBar";
import { Pagination } from "@/components/documents/Pagination";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    type?: string;
  }>;
}

export default async function DocumentsPage({ searchParams }: PageProps) {
  const { page: pageStr, search, type } = await searchParams;

  const page = Math.max(1, Number(pageStr ?? 1));
  const limit = DEFAULT_PAGE_SIZE;

  const db = await getDb();
  const collection = db.collection<WebDocument>("documents");

  const filter: Record<string, unknown> = {};
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
    ];
  }
  if (type && type !== "all") {
    filter.fileType = type as FileType;
  }

  const [documents, total] = await Promise.all([
    collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
    collection.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Documentos</h1>
        <Link
          href="/documents/upload"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
        >
          Subir documento
        </Link>
      </div>

      <div className="mb-6">
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>

      <DocumentList documents={documents} />

      <Suspense>
        <Pagination page={page} totalPages={totalPages} />
      </Suspense>
    </div>
  );
}
