import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PREFIXES = ["/privacy"];

export async function updateSession(request: NextRequest) {
  if (
    PUBLIC_PREFIXES.some((prefix) =>
      request.nextUrl.pathname.startsWith(prefix),
    )
  ) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and getClaims().
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const pathname = request.nextUrl.pathname;
  const isLoginRoute = pathname.startsWith("/login");
  const isCallbackRoute = pathname.startsWith("/auth/");
  const isOnboardingRoute = pathname.startsWith("/onboarding");

  const redirectTo = (target: string) => {
    const url = request.nextUrl.clone();
    url.pathname = target;
    url.search = "";
    const response = NextResponse.redirect(url);
    supabaseResponse.cookies
      .getAll()
      .forEach((cookie) => response.cookies.set(cookie));
    return response;
  };

  if (isCallbackRoute) {
    return supabaseResponse;
  }

  if (!user) {
    const code = request.nextUrl.searchParams.get("code");
    if (code) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/callback";
      url.search = `?code=${encodeURIComponent(code)}`;
      return NextResponse.redirect(url);
    }

    return isLoginRoute ? supabaseResponse : redirectTo("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.sub)
    .maybeSingle();

  const hasUsername = Boolean(profile?.username);

  if (!hasUsername && !isOnboardingRoute) {
    return redirectTo("/onboarding");
  }

  if (hasUsername && (isLoginRoute || isOnboardingRoute)) {
    return redirectTo("/");
  }

  return supabaseResponse;
}
