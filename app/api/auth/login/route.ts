import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { comparePassword, createSession } from "@/lib/auth";
import { validateEmail } from "@/lib/validators";
import type { User, SafeUser } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const emailCheck = validateEmail(email ?? "");
    if (!emailCheck.valid) {
      return NextResponse.json({ error: emailCheck.error }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json(
        { error: "La contrasena es obligatoria" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const user = await db
      .collection<User>("users")
      .findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 }
      );
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 }
      );
    }

    await createSession(user._id!.toString());

    const safeUser: SafeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json({ user: safeUser });
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
