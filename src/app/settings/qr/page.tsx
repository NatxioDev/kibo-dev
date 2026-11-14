import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/motion/Reveal";
import { Alert } from "@/components/ui/Alert";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { PaymentQrSettings } from "@/features/payment-qr/components/PaymentQrSettings";

export const metadata: Metadata = {
  title: "QR de cobro",
  robots: { index: false, follow: false },
};

export default async function PaymentQrSettingsPage() {
  const { paymentQrRepository, profileRepository } = await createServerDependencies();
  const profile = await profileRepository.getCurrent();
  if (!profile.success) {
    return (
      <PageShell>
        <PageHeader back={{ href: "/settings", label: "Ajustes" }} title="QR de cobro" />
        <Alert>{profile.error}</Alert>
      </PageShell>
    );
  }

  const qr = await paymentQrRepository.getForViewer(profile.data.id);
  const ownerName = profile.data.display_name?.trim() || profile.data.username || "Tú";

  return (
    <PageShell>
      <Reveal>
        <PageHeader
          back={{ href: "/settings", label: "Ajustes" }}
          title="QR de cobro"
          description="La imagen que te dio tu banco, para quienes te deben."
        />
      </Reveal>
      <Reveal>
        {qr.success && qr.data.access ? (
          <PaymentQrSettings
            currentUserId={profile.data.id}
            ownerName={ownerName}
            image={qr.data.image}
            imageError={qr.data.imageError}
          />
        ) : (
          <Alert>{qr.success ? "No pudimos abrir tu QR." : qr.error}</Alert>
        )}
      </Reveal>
    </PageShell>
  );
}
