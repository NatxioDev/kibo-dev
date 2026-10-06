"use client";

import { useState } from "react";
import { KiboMascot } from "@/components/mascot/KiboMascot";
import type { MascotMood } from "@/components/mascot/types";
import { Button } from "@/components/ui/Button";

const MOODS: MascotMood[] = [
  "idle",
  "feliz",
  "sorprendido",
  "preocupado",
  "durmiendo",
  "guino",
  "pensando",
  "mareado",
];

export function MascotGallery() {
  const [round, setRound] = useState(0);

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-2 gap-x-6 gap-y-14 sm:grid-cols-4">
        {MOODS.map((mood) => (
          <div key={`${mood}-${round}`} className="flex flex-col items-center gap-4">
            <KiboMascot mood={mood} size={88} />
            <span className="text-xs font-semibold">{mood}</span>
          </div>
        ))}
      </div>
      <Button size="sm" variant="secondary" className="self-start" onClick={() => setRound((n) => n + 1)}>
        Repetir
      </Button>
    </div>
  );
}
