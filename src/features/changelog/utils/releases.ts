import { RELEASES } from "@/features/changelog/content/releases";
import type { Release } from "@/features/changelog/types";
import { compareVersions } from "@/features/changelog/utils/semver";
import { APP_VERSION } from "@/lib/version";

export function getVisibleReleases(): Release[] {
  return RELEASES.filter((release) => compareVersions(release.version, APP_VERSION) <= 0).sort(
    (a, b) => compareVersions(b.version, a.version),
  );
}

export function getUnseenReleases(lastSeen: string): Release[] {
  return getVisibleReleases().filter(
    (release) => compareVersions(release.version, lastSeen) > 0,
  );
}
