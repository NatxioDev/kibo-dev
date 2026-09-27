import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { GetCurrentProfile } from "@/features/profile/application/GetCurrentProfile.application";
import { AppTopBar } from "@/features/settings/components/AppTopBar";

/**
 * Server Component que carga el perfil del usuario actual
 * y lo pasa al componente cliente AppTopBar.
 */
export async function AppTopBarWrapper() {
  const { profileRepository } = await createServerDependencies();
  const result = await new GetCurrentProfile(profileRepository).execute();

  const profile = result.success ? result.data : null;

  return <AppTopBar profile={profile} />;
}
