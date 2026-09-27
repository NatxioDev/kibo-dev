export type Release = {
  version: string;
  /** Fecha de publicación en formato ISO (YYYY-MM-DD). */
  date: string;
  title?: string;
  new?: string[];
  improvements?: string[];
  fixes?: string[];
};
