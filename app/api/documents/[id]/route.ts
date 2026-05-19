import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import { verifySession } from "@/lib/auth";
import { validateDocumentInput } from "@/lib/validators";
import { deleteFile } from "@/lib/s3";
import type { WebDocument } from "@/lib/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID no valido" }, { status: 400 });
    }

    const db = await getDb();
    const doc = await db
      .collection<WebDocument>("documents")
      .findOne({ _id: new ObjectId(id) });

    if (!doc) {
      return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });
    }

    return NextResponse.json(doc);
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID no valido" }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection<WebDocument>("documents");
    const doc = await collection.findOne({ _id: new ObjectId(id) });

    if (!doc) {
      return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });
    }

    if (doc.uploadedBy.toString() !== session.userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, tags } = body;

    const validation = validateDocumentInput({
      title: title ?? doc.title,
      description: description ?? doc.description,
    });
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (title !== undefined) update.title = title.trim();
    if (description !== undefined) update.description = description.trim();
    if (tags !== undefined) update.tags = tags;

    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );

    const updated = await collection.findOne({ _id: new ObjectId(id) });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID no valido" }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection<WebDocument>("documents");
    const doc = await collection.findOne({ _id: new ObjectId(id) });

    if (!doc) {
      return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });
    }

    if (doc.uploadedBy.toString() !== session.userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Delete file from S3 if exists
    if (doc.s3Key) {
      try {
        await deleteFile(doc.s3Key);
      } catch {
        // S3 deletion failure is non-blocking
      }
    }

    await collection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
