import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import { getFileStream } from "@/lib/s3";
import type { WebDocument } from "@/lib/types";
import { Readable } from "stream";

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

    if (!doc.s3Key) {
      return NextResponse.json({ error: "El documento no tiene archivo asociado" }, { status: 404 });
    }

    const stream = await getFileStream(doc.s3Key);

    // Convert Node Readable to Web ReadableStream
    const webStream = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk: Buffer) => controller.enqueue(chunk));
        stream.on("end", () => controller.close());
        stream.on("error", (err: Error) => controller.error(err));
      },
    });

    const contentTypeMap: Record<string, string> = {
      pdf: "application/pdf",
      video: "video/mp4",
      audio: "audio/mpeg",
      image: "image/jpeg",
      other: "application/octet-stream",
    };

    return new Response(webStream, {
      headers: {
        "Content-Type": contentTypeMap[doc.fileType] ?? "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(doc.fileName)}"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
