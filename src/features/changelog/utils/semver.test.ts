import { describe, expect, it } from "vitest";
import { compareVersions } from "./semver";

describe("compareVersions", () => {
  it("returns 0 for equal versions, ignoring the v prefix", () => {
    expect(compareVersions("v0.10.0", "0.10.0")).toBe(0);
  });

  it("compares numerically, not lexically", () => {
    expect(compareVersions("0.10.0", "0.9.0")).toBeGreaterThan(0);
    expect(compareVersions("0.9.9", "0.10.0")).toBeLessThan(0);
  });

  it("ignores prerelease suffixes", () => {
    expect(compareVersions("1.2.3-beta.1", "1.2.3")).toBe(0);
  });
});
