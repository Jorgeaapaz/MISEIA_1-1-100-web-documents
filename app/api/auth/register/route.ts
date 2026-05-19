import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { validateEmail, validatePassword, validateName } from "@/lib/validators";
import { sendMail } from "@/lib/mail";
import { welcomeEmail } from "@/lib/mail-templates";
import type { User, SafeUser } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validate
    const nameCheck = validateName(name ?? "");
    if (!nameCheck.valid) {
      return NextResponse.json({ error: nameCheck.error }, { status: 400 });
    }

    const emailCheck = validateEmail(email ?? "");
    if (!emailCheck.valid) {
      return NextResponse.json({ error: emailCheck.error }, { status: 400 });
    }

    const passCheck = validatePassword(password ?? "");
    if (!passCheck.valid) {
      return NextResponse.json({ error: passCheck.error }, { status: 400 });
    }

    const db = await getDb();
    const users = db.collection<User>("users");

    // Check duplicate
    const existing = await users.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese email" },
        { status: 409 }
      );
    }

    const now = new Date();
    const passwordHash = await hashPassword(password);

    const result = await users.insertOne({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      createdAt: now,
      updatedAt: now,
    });

    await createSession(result.insertedId.toString());

    // Send welcome email (fire and forget)
    sendMail(
      email.toLowerCase().trim(),
      "Bienvenido a Web Documents",
      welcomeEmail(name.trim())
    ).catch(() => {});

    const safeUser: SafeUser = {
      _id: result.insertedId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      createdAt: now,
      updatedAt: now,
    };

    return NextResponse.json({ user: safeUser }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
