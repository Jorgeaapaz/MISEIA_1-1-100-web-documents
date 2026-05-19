"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  documentId: string;
  documentTitle: string;
  senderName: string;
}

export function ShareModal({
  open,
  onClose,
  documentId,
  documentTitle,
  senderName,
}: ShareModalProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    setLoading(true);
    setError("");

    try {
      const downloadLink = `${window.location.origin}/api/documents/${documentId}/download`;

      const res = await fetch("/api/mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          subject: `${senderName} ha compartido "${documentTitle}" contigo`,
          html: buildShareHtml(senderName, documentTitle, downloadLink, message),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Error al enviar");
        return;
      }

      setSent(true);
    } catch {
      setError("Error de conexion");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setMessage("");
    setSent(false);
    setError("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Compartir documento"
      footer={
        sent ? (
          <Button onClick={handleClose}>Cerrar</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            <Button loading={loading} onClick={handleSend} disabled={!email}>
              Enviar
            </Button>
          </>
        )
      }
    >
      {sent ? (
        <div className="text-center">
          <div className="mb-2 text-3xl">&#10003;</div>
          <p className="text-sm text-foreground">
            Email enviado a <strong>{email}</strong>
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <Input
            label="Email del destinatario"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="destinatario@email.com"
            required
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground">
              Mensaje (opcional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Escribe un mensaje..."
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
        </div>
      )}
    </Modal>
  );
}

function buildShareHtml(
  senderName: string,
  documentTitle: string,
  downloadLink: string,
  message?: string
): string {
  return `
    <h3>Documento compartido</h3>
    <p><strong>${senderName}</strong> ha compartido contigo el documento <strong>${documentTitle}</strong>.</p>
    ${message ? `<p style="background:#f1f5f9;padding:12px;border-radius:8px;">"${message}"</p>` : ""}
    <a href="${downloadLink}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;">Descargar documento</a>
  `;
}
