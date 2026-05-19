import type { FileType } from "@/lib/types";
import { FILE_TYPE_COLORS } from "@/utils/constants";

interface BadgeProps {
  fileType: FileType;
}

const labels: Record<FileType, string> = {
  pdf: "PDF",
  video: "Video",
  audio: "Audio",
  image: "Imagen",
  other: "Otro",
};

export function Badge({ fileType }: BadgeProps) {
  const color = FILE_TYPE_COLORS[fileType];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
      style={{ backgroundColor: color }}
    >
      {labels[fileType]}
    </span>
  );
}
