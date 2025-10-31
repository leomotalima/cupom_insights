/**
 * Validates and sanitizes data before saving to Firestore
 * Removes undefined values and invalid data types
 */
export function sanitizeForFirestore(data: any): Record<string, any> {
  if (typeof data !== 'object' || data === null) {
    return {};
  }

  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    // Skip undefined values (Firestore doesn't accept them)
    if (value === undefined) {
      continue;
    }

    // Skip function values
    if (typeof value === 'function') {
      continue;
    }

    // Handle nested objects
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeForFirestore(value);
      continue;
    }

    // Handle arrays
    if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        typeof item === 'object' && item !== null
          ? sanitizeForFirestore(item)
          : item
      ).filter(item => item !== undefined);
      continue;
    }

    // Accept primitive values
    sanitized[key] = value;
  }

  return sanitized;
}

/**
 * Validates receipt data structure
 */
export interface ReceiptData {
  valor_total?: string | number;
  data_hora?: string;
  estabelecimento?: string;
  categoria?: string;
  resposta?: string;
}

export function validateReceiptData(data: any): ReceiptData {
  const validated: ReceiptData = {};

  if (data.valor_total !== undefined) {
    validated.valor_total = data.valor_total;
  }

  if (data.data_hora !== undefined) {
    validated.data_hora = String(data.data_hora);
  }

  if (data.estabelecimento !== undefined) {
    validated.estabelecimento = String(data.estabelecimento);
  }

  if (data.categoria !== undefined) {
    validated.categoria = String(data.categoria);
  }

  if (data.resposta !== undefined) {
    validated.resposta = String(data.resposta);
  }

  return validated;
}
