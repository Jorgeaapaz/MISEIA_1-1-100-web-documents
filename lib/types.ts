import { ObjectId } from "mongodb";

// ── User ──────────────────────────────────────────────
export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SafeUser = Omit<User, "passwordHash">;

// ── Document ──────────────────────────────────────────
export type FileType = "pdf" | "video" | "audio" | "image" | "other";

export interface WebDocument {
  _id?: ObjectId;
  title: string;
  description: string;
  fileName: string;
  fileType: FileType;
  fileSize: number; // bytes
  s3Key: string;
  uploadedBy: ObjectId;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ── Session ───────────────────────────────────────────
export interface SessionPayload {
  userId: string;
  exp: number;
}

// ── API Responses ─────────────────────────────────────
export interface ApiErrorResponse {
  error: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
