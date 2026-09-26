function parseVersion(version: string): [number, number, number] {
  const [major = 0, minor = 0, patch = 0] = version
    .trim()
    .replace(/^v/, "")
    .split("-")[0]
    .split(".")
    .map((part) => Number.parseInt(part, 10) || 0);
  return [major, minor, patch];
}

/** Devuelve un número negativo si `a < b`, positivo si `a > b` y 0 si son iguales. */
export function compareVersions(a: string, b: string): number {
  const left = parseVersion(a);
  const right = parseVersion(b);
  for (let index = 0; index < 3; index++) {
    const diff = left[index] - right[index];
    if (diff !== 0) return diff;
  }
  return 0;
}
