import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import type { WebDocument } from "@/lib/types";
import { DocumentDetail } from "@/components/documents/DocumentDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentPage({ params }: PageProps) {
  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    notFound();
  }

  const db = await getDb();
  const doc = await db
    .collection<WebDocument>("documents")
    .findOne({ _id: new ObjectId(id) });

  if (!doc) {
    notFound();
  }

  // Serialize ObjectId fields for client component
  const serialized = {
    ...doc,
    _id: doc._id?.toString(),
    uploadedBy: doc.uploadedBy.toString(),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* @ts-expect-error serialized dates/ids for client */}
      <DocumentDetail document={serialized} />
    </div>
  );
}
