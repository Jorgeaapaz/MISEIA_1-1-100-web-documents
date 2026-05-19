"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { UploadZone } from "@/components/documents/UploadZone";
import type { FileType } from "@/lib/types";

export default function UploadPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [uploadData, setUploadData] = useState<{
    s3Key: string;
    fileName: string;
    fileSize: number;
    fileType: FileType;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadData) {
      setError("Primero sube un archivo");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || uploadData.fileName,
          description,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          ...uploadData,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al crear el documento");
        return;
      }

      router.push(`/documents/${data._id}`);
    } catch {
      setError("Error de conexion");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">
        Subir documento
      </h1>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-danger">
          {error}
        </div>
      )}

      <div className="mb-6">
        <UploadZone
          onUploaded={(data) => {
            setUploadData(data);
            if (!title) setTitle(data.fileName.replace(/\.[^/.]+$/, ""));
          }}
        />
      </div>

      {uploadData && (
        <form onSubmit={handleCreateDocument} className="flex flex-col gap-4">
          <div className="rounded-lg border border-success/30 bg-green-50 p-3 text-sm text-success">
            Archivo subido correctamente
          </div>

          <Input
            label="Titulo"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nombre del documento"
            required
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground">
              Descripcion
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripcion opcional"
              rows={3}
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <Input
            label="Etiquetas"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Separadas por comas (ej: informe, 2024, finanzas)"
          />

          <Button type="submit" loading={saving} className="mt-2">
            Crear documento
          </Button>
        </form>
      )}
    </div>
  );
}
