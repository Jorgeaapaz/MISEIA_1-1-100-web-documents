import { APP_NAME } from "@/utils/constants";

const wrapper = (content: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f8fafc;padding:32px;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e2e8f0;">
    <h2 style="color:#2563eb;margin-top:0;">${APP_NAME}</h2>
    ${content}
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
    <p style="color:#64748b;font-size:12px;margin:0;">Este es un email automatico de ${APP_NAME}.</p>
  </div>
</body>
</html>
`;

export function welcomeEmail(userName: string): string {
  return wrapper(`
    <h3 style="color:#0f172a;">Bienvenido, ${userName}!</h3>
    <p style="color:#334155;">Tu cuenta ha sido creada correctamente. Ya puedes empezar a subir y gestionar tus documentos.</p>
    <a href="${process.env.NEXT_PUBLIC_API_URL}/documents" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px;">
      Ir a mis documentos
    </a>
  `);
}

export function uploadConfirmationEmail(
  userName: string,
  documentTitle: string
): string {
  return wrapper(`
    <h3 style="color:#0f172a;">Documento subido</h3>
    <p style="color:#334155;">Hola ${userName}, tu documento <strong>${documentTitle}</strong> se ha subido correctamente.</p>
    <a href="${process.env.NEXT_PUBLIC_API_URL}/documents" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px;">
      Ver mis documentos
    </a>
  `);
}

export function shareDocumentEmail(
  senderName: string,
  documentTitle: string,
  downloadLink: string,
  message?: string
): string {
  return wrapper(`
    <h3 style="color:#0f172a;">Documento compartido</h3>
    <p style="color:#334155;"><strong>${senderName}</strong> ha compartido contigo el documento <strong>${documentTitle}</strong>.</p>
    ${message ? `<p style="color:#334155;background:#f1f5f9;padding:12px;border-radius:8px;">"${message}"</p>` : ""}
    <a href="${downloadLink}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px;">
      Descargar documento
    </a>
  `);
}
