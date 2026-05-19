import type { ReactNode } from "react";
import type { FileType } from "@/lib/types";

interface FileIconProps {
  fileType: FileType;
  className?: string;
}

export function FileIcon({ fileType, className = "h-10 w-10" }: FileIconProps) {
  const colorClass = `file-type-${fileType}`;

  const icons: Record<FileType, ReactNode> = {
    pdf: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`${colorClass} ${className}`}>
        <path d="M7 2h7l5 5v14a1 1 0 01-1 1H7a1 1 0 01-1-1V3a1 1 0 011-1z" />
        <path d="M14 2v5h5" />
        <text x="8" y="17" fontSize="6" fill="currentColor" stroke="none" fontWeight="bold">PDF</text>
      </svg>
    ),
    video: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`${colorClass} ${className}`}>
        <rect x="3" y="5" width="14" height="14" rx="1" />
        <path d="M17 9l4-2v10l-4-2" />
      </svg>
    ),
    audio: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`${colorClass} ${className}`}>
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
    image: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`${colorClass} ${className}`}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    ),
    other: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`${colorClass} ${className}`}>
        <path d="M7 2h7l5 5v14a1 1 0 01-1 1H7a1 1 0 01-1-1V3a1 1 0 011-1z" />
        <path d="M14 2v5h5" />
      </svg>
    ),
  };

  return icons[fileType];
}
