import { describe, expect, it } from "vitest";
import { PAYMENT_QR_REMINDER } from "@/features/payment-qr/domain/copy";
import {
  FORMER_FRIENDS_TITLE,
  INBOX_ACCEPT_LABEL,
  INBOX_DISPUTE_TITLE,
  INBOX_NOT_MINE_LABEL,
  INBOX_REVIEW_TITLE,
} from "@/features/splits/domain/inboxCopy";

describe("copy de deudas", () => {
  it("habla en idioma del usuario", () => {
    expect(INBOX_REVIEW_TITLE).toBe("Gastos para revisar");
    expect(INBOX_ACCEPT_LABEL).toBe("Aceptar");
    expect(INBOX_NOT_MINE_LABEL).toBe("No es mío");
    expect(INBOX_DISPUTE_TITLE).toBe("En disputa");
    expect(FORMER_FRIENDS_TITLE).toBe("Ex amigos con saldo");

    const visible = [
      INBOX_REVIEW_TITLE,
      INBOX_ACCEPT_LABEL,
      INBOX_NOT_MINE_LABEL,
      INBOX_DISPUTE_TITLE,
      FORMER_FRIENDS_TITLE,
    ].join(" ");
    expect(visible).not.toMatch(/clasificar/i);
    expect(visible).not.toMatch(/reconozco/i);
    expect(visible).not.toMatch(/revisión/i);
  });
});

describe("copy visible del QR", () => {
  it("deja una sola frase y conserva el enlace a las condiciones en el resto", () => {
    expect(PAYMENT_QR_REMINDER.split(".").filter((part) => part.trim())).toHaveLength(1);
    expect(PAYMENT_QR_REMINDER).not.toContain("Recuerda:");
  });
});
