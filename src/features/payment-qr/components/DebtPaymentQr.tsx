import { Alert } from "@/components/ui/Alert";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { PaymentQrViewer } from "@/features/payment-qr/components/PaymentQrViewer";

type DebtPaymentQrProps = {
  ownerId: string;
  ownerName: string;
  balanceHint: string | null;
};

export async function DebtPaymentQr({ ownerId, ownerName, balanceHint }: DebtPaymentQrProps) {
  const { paymentQrRepository } = await createServerDependencies();
  const result = await paymentQrRepository.getForViewer(ownerId);
  if (!result.success) return <Alert>{result.error}</Alert>;
  if (!result.data.access) return null;

  return (
    <PaymentQrViewer
      ownerId={ownerId}
      ownerName={result.data.ownerName || ownerName}
      viewerIsOwner={false}
      image={result.data.image}
      notice={result.data.notice}
      imageError={result.data.imageError}
      balanceHint={balanceHint}
    />
  );
}
