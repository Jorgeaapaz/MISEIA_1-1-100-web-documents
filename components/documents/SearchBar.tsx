"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { DOCUMENT_CATEGORIES } from "@/utils/constants";

const categoryLabels: Record<string, string> = {
  all: "Todos",
  pdf: "PDF",
  video: "Video",
  audio: "Audio",
  image: "Imagen",
  other: "Otro",
};

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  const currentType = searchParams.get("type") ?? "all";

  const applyFilters = (newSearch: string, newType: string) => {
    const params = new URLSearchParams();
    if (newSearch) params.set("search", newSearch);
    if (newType && newType !== "all") params.set("type", newType);
    params.set("page", "1");
    router.push(`/documents?${params.toString()}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(search, currentType);
  };

  const handleTypeChange = (type: string) => {
    applyFilters(search, type);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <form onSubmit={handleSubmit} className="flex flex-1 gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar documentos..."
          className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="submit"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
        >
          Buscar
        </button>
      </form>

      <div className="flex gap-1 overflow-x-auto">
        {DOCUMENT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleTypeChange(cat)}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              currentType === cat
                ? "bg-accent text-white"
                : "bg-accent-light text-accent hover:bg-accent/20"
            }`}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>
    </div>
  );
}
