import type { FileType } from "@/lib/types";

export const APP_NAME = "Web Documents";

// Upload constraints
export const MAX_UPLOAD_SIZE = 100 * 1024 * 1024; // 100 MB

export const ALLOWED_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "txt",
  "csv",
  "mp4",
  "webm",
  "mov",
  "avi",
  "mp3",
  "wav",
  "ogg",
  "flac",
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "svg",
];

// Map extension → FileType
export const EXTENSION_TO_TYPE: Record<string, FileType> = {
  pdf: "pdf",
  doc: "pdf",
  docx: "pdf",
  xls: "pdf",
  xlsx: "pdf",
  ppt: "pdf",
  pptx: "pdf",
  txt: "pdf",
  csv: "pdf",
  mp4: "video",
  webm: "video",
  mov: "video",
  avi: "video",
  mp3: "audio",
  wav: "audio",
  ogg: "audio",
  flac: "audio",
  jpg: "image",
  jpeg: "image",
  png: "image",
  gif: "image",
  webp: "image",
  svg: "image",
};

// Colors per file type (for badges / icons)
export const FILE_TYPE_COLORS: Record<FileType, string> = {
  pdf: "#ef4444",
  video: "#8b5cf6",
  audio: "#22c55e",
  image: "#3b82f6",
  other: "#6b7280",
};

// Document categories
export const DOCUMENT_CATEGORIES = [
  "all",
  "pdf",
  "video",
  "audio",
  "image",
  "other",
] as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
