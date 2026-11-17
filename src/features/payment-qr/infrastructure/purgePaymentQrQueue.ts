import "server-only";

import { PAYMENT_QR_BUCKET } from "@/features/payment-qr/domain/constants";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Borra por la API de Storage las rutas anotadas al reemplazar, eliminar o
 * borrar la cuenta, y los objetos del bucket sin fila después de 24 horas.
 * Si no hay clave de servicio, no hace nada: el dueño igual borra su archivo
 * en el momento con su propia sesión.
 */
export async function drainPaymentQrPurgeQueue(): Promise<void> {
  if (!process.env.SUPABASE_SECRET_KEY) return;

  try {
    const admin = createAdminClient();
    const { data: queued, error } = await admin
      .from("payment_qr_purge_queue")
      .select("id, object_path")
      .is("purged_at", null)
      .order("created_at", { ascending: true })
      .limit(50);

    if (!error && queued && queued.length > 0) {
      const paths = [...new Set(queued.map((row) => row.object_path as string))];
      const removed = await admin.storage.from(PAYMENT_QR_BUCKET).remove(paths);
      if (!removed.error) {
        await admin
          .from("payment_qr_purge_queue")
          .update({ purged_at: new Date().toISOString() })
          .in(
            "id",
            queued.map((row) => row.id as string),
          );
      }
    }

    const { data: orphans, error: orphanError } = await admin.rpc(
      "list_orphan_payment_qr_objects",
    );
    if (!orphanError && Array.isArray(orphans) && orphans.length > 0) {
      const paths = orphans.filter((path): path is string => typeof path === "string");
      if (paths.length > 0) {
        await admin.storage.from(PAYMENT_QR_BUCKET).remove(paths);
      }
    }
  } catch {
    // El reintento queda en la cola. No interrumpe al usuario.
  }
}
