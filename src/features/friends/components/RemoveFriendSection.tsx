"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { RemoveFriendDialog } from "@/features/friends/components/RemoveFriendDialog";

type RemoveFriendSectionProps = {
  friendshipId: string;
  friendName: string;
};

export function RemoveFriendSection({ friendshipId, friendName }: RemoveFriendSectionProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <Button variant="destructive" className="w-full" onClick={() => setOpen(true)}>
        Eliminar amigo
      </Button>
      <RemoveFriendDialog
        open={open}
        onClose={() => setOpen(false)}
        friendshipId={friendshipId}
        friendName={friendName}
        successMessage="Amistad eliminada"
        onRemoved={() => router.push("/friends")}
      />
    </>
  );
}
