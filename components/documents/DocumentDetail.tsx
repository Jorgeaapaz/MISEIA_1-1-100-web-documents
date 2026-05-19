"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { WebDocument } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { FileIcon } from "@/components/ui/FileIcon";
import { formatDate, formatFileSize } from "@/utils/format";
import { ShareModal } from "./ShareModal";
import { FilePreview } from "./FilePreview";
import { useGlobal } from "@/context/GlobalContext";

interface DocumentDetailProps {
  document: WebDocument;
}

export function DocumentDetail({ document: doc }: DocumentDetailProps) {
  const router = useRouter();
  const { user } = useGlobal();
  const [editing, setEditing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [title, setTitle] = useState(doc.title);
  const [description, setDescription] = useState(doc.description);
  const [tags, setTags] = useState(doc.tags.join(", "));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/documents/${doc._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Error al guardar");
        return;
      }
      setEditing(false);
      router.refresh();
    } catch {
      setError("Error de conexion");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/documents/${doc._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/documents");
      }
    } catch {
      setError("Error al eliminar");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-danger">
          {error}
        </div>
      )}

      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <FileIcon fileType={doc.fileType} className="h-14 w-14" />
          <div>
            {editing ? (
              <Input
                label="Titulo"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            ) : (
              <h1 className="text-2xl font-bold text-foreground">{doc.title}</h1>
            )}
            <div className="mt-1 flex items-center gap-2">
              <Badge fileType={doc.fileType} />
              <span className="text-sm text-muted">{doc.fileName}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>
                Cancelar
              </Button>
              <Button size="sm" loading={saving} onClick={handleSave}>
                Guardar
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                Editar
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
              >
                Eliminar
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
        <h2 className="mb-2 text-sm font-semibold text-foreground">Descripcion</h2>
        {editing ? (
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        ) : (
          <p className="text-sm text-muted">
            {doc.description || "Sin descripcion"}
          </p>
        )}
      </div>

      {/* Tags */}
      <div className="mb-6">
        <h2 className="mb-2 text-sm font-semibold text-foreground">Etiquetas</h2>
        {editing ? (
          <Input
            label=""
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Separadas por comas"
          />
        ) : doc.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {doc.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-accent-light px-2.5 py-0.5 text-xs font-medium text-accent"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">Sin etiquetas</p>
        )}
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-4 rounded-lg bg-background p-4 text-sm sm:grid-cols-4">
        <div>
          <span className="text-xs text-muted">Tamano</span>
          <p className="font-medium">{formatFileSize(doc.fileSize)}</p>
        </div>
        <div>
          <span className="text-xs text-muted">Tipo</span>
          <p className="font-medium capitalize">{doc.fileType}</p>
        </div>
        <div>
          <span className="text-xs text-muted">Creado</span>
          <p className="font-medium">{formatDate(doc.createdAt)}</p>
        </div>
        <div>
          <span className="text-xs text-muted">Actualizado</span>
          <p className="font-medium">{formatDate(doc.updatedAt)}</p>
        </div>
      </div>

      {/* File preview */}
      {doc.s3Key && (
        <div className="mt-6">
          <h2 className="mb-2 text-sm font-semibold text-foreground">Vista previa</h2>
          <FilePreview
            documentId={doc._id?.toString() ?? ""}
            fileType={doc.fileType}
            fileName={doc.fileName}
          />
        </div>
      )}

      {/* Actions: Download + Share */}
      {doc.s3Key && (
        <div className="mt-6 flex gap-3">
          <a
            href={`/api/documents/${doc._id}/download`}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Descargar
          </a>
          <Button variant="secondary" onClick={() => setShowShareModal(true)}>
            Compartir
          </Button>
        </div>
      )}

      {/* Share modal */}
      <ShareModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        documentId={doc._id?.toString() ?? ""}
        documentTitle={doc.title}
        senderName={user?.name ?? "Usuario"}
      />

      {/* Delete modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Eliminar documento"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button variant="danger" loading={deleting} onClick={handleDelete}>
              Eliminar
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          Estas seguro de que quieres eliminar &quot;{doc.title}&quot;?
          Esta accion no se puede deshacer.
        </p>
      </Modal>
    </div>
  );
}
