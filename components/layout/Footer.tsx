import { APP_NAME } from "@/utils/constants";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-white py-6">
      <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted">
        {year} {APP_NAME}. Todos los derechos reservados.
      </div>
    </footer>
  );
}
