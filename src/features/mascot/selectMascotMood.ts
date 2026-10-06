import type { MascotMood } from "@/components/mascot/types";
import type { MascotSignals } from "./types";

export const GOOD_BALANCE_RATIO = 1.2;

export type MascotMoodInput =
  | { error: true }
  | {
      error?: false;
      isEmpty: boolean;
      income: number;
      expense: number;
      balance: number;
      signals: MascotSignals;
    };

export function selectMascotMood(input: MascotMoodInput): MascotMood {
  if (input.error) return "mareado";

  const { isEmpty, income, expense, balance, signals } = input;
  if (isEmpty) return "durmiendo";
  if (signals.manyExpensesToday) return "mareado";
  if (signals.unexpectedIncome) return "sorprendido";
  if (expense > income) return "preocupado";
  if (balance > 0 && income >= GOOD_BALANCE_RATIO * expense) return "feliz";
  return "idle";
}
