import { ALLOWED_EXTENSIONS, MAX_UPLOAD_SIZE } from "@/utils/constants";

interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateEmail(email: string): ValidationResult {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !re.test(email)) {
    return { valid: false, error: "Email no valido" };
  }
  return { valid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (!password || password.length < 8) {
    return { valid: false, error: "La contrasena debe tener al menos 8 caracteres" };
  }
  return { valid: true };
}

export function validateName(name: string): ValidationResult {
  if (!name || name.trim().length < 2) {
    return { valid: false, error: "El nombre debe tener al menos 2 caracteres" };
  }
  return { valid: true };
}

export function validateDocumentInput(input: {
  title?: string;
  description?: string;
}): ValidationResult {
  if (!input.title || input.title.trim().length < 1) {
    return { valid: false, error: "El titulo es obligatorio" };
  }
  if (input.title.length > 200) {
    return { valid: false, error: "El titulo no puede superar 200 caracteres" };
  }
  if (input.description && input.description.length > 2000) {
    return { valid: false, error: "La descripcion no puede superar 2000 caracteres" };
  }
  return { valid: true };
}

export function validateFile(file: {
  name: string;
  size: number;
}): ValidationResult {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { valid: false, error: `Tipo de archivo no permitido: .${ext}` };
  }
  if (file.size > MAX_UPLOAD_SIZE) {
    const maxMb = MAX_UPLOAD_SIZE / (1024 * 1024);
    return { valid: false, error: `El archivo supera el tamano maximo de ${maxMb}MB` };
  }
  return { valid: true };
}
