import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/motion/Reveal";
import { EmptyState } from "@/components/ui/EmptyState";
import { MarkReleasesSeen } from "@/features/changelog/components/MarkReleasesSeen";
import { ReleaseCard } from "@/features/changelog/components/ReleaseCard";
import { getVisibleReleases } from "@/features/changelog/utils/releases";
import { compareVersions } from "@/features/changelog/utils/semver";
import { APP_VERSION } from "@/lib/version";

export const metadata: Metadata = {
  title: "Novedades · Kibo",
};

export default function NovedadesPage() {
  const releases = getVisibleReleases();

  return (
    <PageShell>
      <MarkReleasesSeen />
      <Reveal>
        <PageHeader
          back={{ href: "/settings", label: "Ajustes" }}
          title="Novedades"
          description="Lo nuevo y lo que mejoramos en cada versión de Kibo."
        />
      </Reveal>

      {releases.length === 0 ? (
        <Reveal>
          <EmptyState title="Todavía no hay novedades" />
        </Reveal>
      ) : (
        releases.map((release) => (
          <Reveal key={release.version}>
            <ReleaseCard
              release={release}
              current={compareVersions(release.version, APP_VERSION) === 0}
            />
          </Reveal>
        ))
      )}
    </PageShell>
  );
}
