import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { uploadFile } from "@/lib/s3";
import { validateFile } from "@/lib/validators";
import { EXTENSION_TO_TYPE } from "@/utils/constants";
import type { FileType } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se envio ningun archivo" }, { status: 400 });
    }

    const validation = validateFile({ name: file.name, size: file.size });
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const fileType: FileType = EXTENSION_TO_TYPE[ext] ?? "other";
    const uuid = crypto.randomUUID();
    const s3Key = `documents/${session.userId}/${uuid}/${file.name}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    await uploadFile(s3Key, buffer, file.type || "application/octet-stream");

    return NextResponse.json({
      s3Key,
      fileName: file.name,
      fileSize: file.size,
      fileType,
    });
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
