import { z } from "zod";
import { CURRENCY_CODES } from "@/core/domain/value-objects";

const amount = z.number().nonnegative("El monto no puede ser negativo.");

export const splitDraftSchema = z.object({
  payerConsumes: z.boolean(),
  mode: z.enum(["equal", "custom"]),
  friendIds: z.array(z.string().uuid()).min(1, "Elige al menos un amigo.").max(30),
  payerAmount: amount,
  friendAmounts: z.array(
    z.object({
      userId: z.string().uuid(),
      amount,
    }),
  ),
});

export const settlementAmountSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().positive("El monto del pago tiene que ser mayor que 0."),
  currency: z.enum(CURRENCY_CODES),
});

export const shareIdSchema = z.object({
  shareId: z.string().uuid(),
  categoryId: z.string().uuid().optional(),
});
