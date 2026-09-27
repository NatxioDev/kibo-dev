/**
 * Resultado de operaciones de dominio y casos de uso.
 * 
 * @template T - El tipo de dato devuelto en caso de éxito
 */
export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
