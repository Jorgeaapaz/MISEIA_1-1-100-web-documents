"use client";

import { useState, useRef, type DragEvent } from "react";
import { FileIcon } from "@/components/ui/FileIcon";
import { EXTENSION_TO_TYPE } from "@/utils/constants";
import { formatFileSize } from "@/utils/format";
import type { FileType } from "@/lib/types";

interface UploadZoneProps {
  onUploaded: (data: {
    s3Key: string;
    fileName: string;
    fileSize: number;
    fileType: FileType;
  }) => void;
}

export function UploadZone({ onUploaded }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setSelectedFile(file);
    setError("");
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError("");
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload");

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      const result = await new Promise<string>((resolve, reject) => {
        xhr.onload = () => resolve(xhr.responseText);
        xhr.onerror = () => reject(new Error("Error de red"));
        xhr.send(formData);
      });

      const data = JSON.parse(result);
      if (data.error) {
        setError(data.error);
        return;
      }

      onUploaded(data);
    } catch {
      setError("Error al subir el archivo");
    } finally {
      setUploading(false);
    }
  };

  const ext = selectedFile?.name.split(".").pop()?.toLowerCase() ?? "";
  const fileType: FileType = EXTENSION_TO_TYPE[ext] ?? "other";

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
          dragging
            ? "border-accent bg-accent-light"
            : "border-border bg-white hover:border-accent/50"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="mb-3 h-12 w-12 text-muted"
        >
          <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
          <path d="M16 6l-4-4-4 4M12 2v13" />
        </svg>
        <p className="text-sm font-medium text-foreground">
          Arrastra un archivo aqui o haz clic para seleccionar
        </p>
        <p className="mt-1 text-xs text-muted">
          PDF, videos, audios, imagenes (max 100MB)
        </p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      {selectedFile && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-white p-3">
          <FileIcon fileType={fileType} className="h-8 w-8" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {selectedFile.name}
            </p>
            <p className="text-xs text-muted">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          <button
            onClick={() => setSelectedFile(null)}
            className="text-muted hover:text-foreground"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>
      )}

      {uploading && (
        <div className="h-2 overflow-hidden rounded-full bg-accent-light">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {error && (
        <p className="text-sm text-danger">{error}</p>
      )}

      {selectedFile && !uploading && (
        <button
          onClick={handleUpload}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
        >
          Subir archivo
        </button>
      )}
    </div>
  );
}
