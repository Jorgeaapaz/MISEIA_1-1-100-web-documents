import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifySession } from "@/lib/auth";
import { validateDocumentInput } from "@/lib/validators";
import { DEFAULT_PAGE_SIZE } from "@/utils/constants";
import type { WebDocument, PaginatedResponse, FileType } from "@/lib/types";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? DEFAULT_PAGE_SIZE)));
    const search = searchParams.get("search") ?? "";
    const type = searchParams.get("type") ?? "";
    const sort = searchParams.get("sort") ?? "createdAt";
    const order = searchParams.get("order") === "asc" ? 1 : -1;

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

    const [data, total] = await Promise.all([
      collection
        .find(filter)
        .sort({ [sort]: order })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      collection.countDocuments(filter),
    ]);

    const response: PaginatedResponse<WebDocument> = {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, fileName, fileType, fileSize, s3Key, tags } = body;

    const validation = validateDocumentInput({ title, description });
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const now = new Date();
    const doc: WebDocument = {
      title: title.trim(),
      description: (description ?? "").trim(),
      fileName: fileName ?? "",
      fileType: fileType ?? "other",
      fileSize: fileSize ?? 0,
      s3Key: s3Key ?? "",
      uploadedBy: new ObjectId(session.userId),
      tags: tags ?? [],
      createdAt: now,
      updatedAt: now,
    };

    const db = await getDb();
    const result = await db.collection<WebDocument>("documents").insertOne(doc);

    return NextResponse.json(
      { ...doc, _id: result.insertedId },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
