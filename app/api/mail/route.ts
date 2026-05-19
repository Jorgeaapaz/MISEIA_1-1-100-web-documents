import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { sendMail } from "@/lib/mail";
import { validateEmail } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { to, subject, html } = body;

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios: to, subject, html" },
        { status: 400 }
      );
    }

    const emailCheck = validateEmail(to);
    if (!emailCheck.valid) {
      return NextResponse.json({ error: emailCheck.error }, { status: 400 });
    }

    await sendMail(to, subject, html);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Error al enviar el email" },
      { status: 500 }
    );
  }
}
