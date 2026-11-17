import { drainPaymentQrPurgeQueue } from "@/features/payment-qr/infrastructure/purgePaymentQrQueue";

export const dynamic = "force-dynamic";

async function purge(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return new Response(null, { status: 404 });

  const header = request.headers.get("authorization");
  if (header !== `Bearer ${secret}`) {
    return new Response(null, { status: 401 });
  }

  await drainPaymentQrPurgeQueue();
  return Response.json({ ok: true });
}

export function GET(request: Request) {
  return purge(request);
}

export function POST(request: Request) {
  return purge(request);
}
