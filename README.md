# Kibo

Gestor personal de ingresos y gastos.

## Stack

- **Next.js** 16 (App Router)
- **TypeScript**
- **Supabase** (Auth + PostgreSQL + RLS)
- **Tailwind CSS**
- **Zod**
- **Bun** como package manager

## Funcionalidades

- Autenticación solo con Google (Supabase OAuth), logout y sesión con cookies
- Perfil con `@username` único (elegido en onboarding y editable con límite de días), nombre visible editable y avatar de Google
- Protección de rutas privadas y gate de onboarding (`proxy.ts`)
- Dashboard: ingresos, gastos, balance, gastos por categoría y últimas transacciones
- Filtros de período (este mes / mes pasado / últimos 3 meses) y moneda (BOB / USD)
- CRUD de transacciones (`source = MANUAL`, `status = CONFIRMED`)
- Configuración de categorías (con emoji) y métodos de pago
- Activar / desactivar categorías y métodos (sin borrado físico)
- Feedback de usuarios (bug / idea / otro) persistido en Supabase
- Defaults de categorías y métodos de pago al registrarse (trigger en Supabase)

## Requisitos

- Bun ≥ 1.2
- Proyecto Supabase con las tablas `categories`, `payment_methods`, `transactions`, `feedback` y `profiles`, Auth y RLS configurados
- Proveedor Google configurado en Supabase (ver [Autenticación con Google](#autenticación-con-google))

## Setup

1. Instalar dependencias:

```bash
bun install
```

2. Copiar variables de entorno:

```bash
cp .env.local.example .env.local
```

3. Completar en `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
# USERNAME_CHANGE_COOLDOWN_DAYS=30
```

Las obtienes en el dashboard de Supabase → **Connect** o **Project Settings → API Keys**. En el navegador solo se usa la **publishable key**. `SUPABASE_SECRET_KEY` (sección **Secret keys**) es solo de servidor: nunca le pongas prefijo `NEXT_PUBLIC_`. Se usa únicamente en la Server Action que cambia el `@username`.

`USERNAME_CHANGE_COOLDOWN_DAYS` define cuántos días deben pasar entre cambios de `@username` (por defecto 30; `0` = sin límite). Configura ambas variables también en Vercel.

4. Arrancar en desarrollo:

```bash
bun run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Autenticación con Google

El login usa el proveedor Google nativo de Supabase Auth. No hay registro ni login por email.

1. **Google Cloud Console** → Google Auth Platform:
   - Crea un OAuth client de tipo **Web application**.
   - En **Authorized redirect URIs** agrega `https://<project-ref>.supabase.co/auth/v1/callback`.
   - En **Audience**, el tipo de público es **External**. Mientras la app esté en modo **Testing**, solo pueden entrar las cuentas agregadas en **Test users** (máximo 100). Para abrirla a cualquiera, pulsa **Publish app**. Con los scopes básicos (`openid`, `email`, `profile`) no se requiere revisión de Google, salvo que agregues logo o dominios (verificación de marca).
2. **Supabase** → Authentication → **Sign In / Providers**:
   - Activa **Google** con el Client ID y Client Secret del paso anterior.
   - Desactiva **Email**.
3. **Supabase** → Authentication → **URL Configuration**:
   - **Site URL**: la URL de producción.
   - **Redirect URLs**: `http://localhost:3000/auth/callback` y `https://<tu-dominio>/auth/callback`.

Flujo: `/login` → Google → `/auth/callback` (canjea el código por la sesión) → si el perfil no tiene `username`, `/onboarding`; si ya lo tiene, `/`.

Un usuario antiguo de email que entre con Google usando el mismo correo (ya verificado) se vincula automáticamente a su cuenta y conserva sus datos.

## Base de datos

Las migraciones nuevas se versionan en [`supabase/migrations/`](supabase/migrations/). La tabla `profiles`:

- `username` (`citext`, único, `^[a-z0-9_]{3,20}$`, no reservado). Se elige en el onboarding; después solo se puede cambiar desde Ajustes, una vez cada `USERNAME_CHANGE_COOLDOWN_DAYS` días.
- El cambio pasa por una Server Action con la secret key; un trigger bloquea cualquier cambio de `username` hecho con la sesión del usuario y registra `username_changed_at`.
- `display_name` y `avatar_url` se completan desde Google al crear el usuario (trigger en `auth.users`).
- RLS: cualquier usuario autenticado puede leer perfiles (para buscar amigos en el futuro); cada uno solo actualiza el suyo.

## Scripts

```bash
bun run dev           # desarrollo
bun run build         # build de producción
bun run start         # servir build
bun run lint          # ESLint
bunx tsc --noEmit     # typecheck
bun run release:dry   # simular el próximo release (sin publicar)
bun run release:local # bump manual local (solo si CI no aplica)
```

## Versionado

- La versión vive en `package.json` y se muestra en `/settings` (`Kibo beta vX.Y.Z`). La etapa (`beta`) se define en `APP_STAGE` (`src/lib/version.ts`).
- Opcional: override con `NEXT_PUBLIC_APP_VERSION` en el entorno de deploy.
- **Husky** exige Conventional Commits (`feat:`, `fix:`, `chore:`, …).

### Automático en GitHub (recomendado)

Al hacer **push / merge a `main`**, el workflow [`.github/workflows/release.yml`](.github/workflows/release.yml) corre **semantic-release**:

| Tipo de commit | Versión |
|----------------|---------|
| `fix:` / `perf:` / `refactor:` | patch (`0.0.x`) |
| `feat:` | minor (`0.x.0`) |
| `BREAKING CHANGE` / `!` | major (`x.0.0`) |
| `docs:` / `chore:` / `ci:` / `test:` | sin release |

El bot actualiza `package.json`, `CHANGELOG.md`, crea tag `vX.Y.Z` y un GitHub Release.

**Primera vez** (si aún no hay tags), ancla la versión actual para no saltar de más:

```bash
git tag v0.0.4
git push origin v0.0.4
```

Flujo diario:

1. PR con commits `feat:` / `fix:` …
2. Merge a `main`
3. GitHub Actions publica la versión
4. Tras el deploy, Settings muestra la nueva versión

### Manual (opcional)

```bash
bun run release:local   # interactive con bumpp
git push --follow-tags
```

## Rutas principales

| Ruta | Descripción |
|------|-------------|
| `/` | Dashboard |
| `/login` | Iniciar sesión con Google |
| `/auth/callback` | Retorno de OAuth (canje del código por la sesión) |
| `/onboarding` | Elegir `@username` tras el primer login |
| `/transactions` | Listado de transacciones |
| `/transactions/new` | Nueva transacción |
| `/transactions/[id]` | Detalle de transacción |
| `/transactions/[id]/edit` | Editar transacción |
| `/settings` | Configuración |
| `/settings/profile` | Editar perfil (`@username` y nombre visible) |
| `/settings/categories` | Categorías |
| `/settings/payment-methods` | Métodos de pago |
| `/settings/feedback` | Enviar feedback |

## Estructura

```text
src/
├── app/                 # App Router (páginas)
├── core/                # DI (DependencyProvider, DependencyFactory)
├── features/
│   ├── auth/            # Clean Arch
│   ├── dashboard/       # Clean Arch (GetDashboardData)
│   ├── transactions/    # Clean Arch
│   ├── categories/      # Clean Arch
│   ├── payment-methods/ # Clean Arch
│   ├── feedback/        # Clean Arch
│   └── profile/         # Clean Arch (username, nombre visible)
├── lib/supabase/        # clientes browser, server y proxy
└── types/
```

Cada feature usa `domain/` → `application/` → `infrastructure/supabase/` (+ `hooks/`, `components/`, `schemas/` según aplique).

**Clean Arch:** UI/hooks → use cases → interfaces ← adaptadores `Supabase*`. Composition root en `core/`. Todos los features de datos/auth están migrados.

## Seguridad

- La app usa solo la **publishable key** en el frontend
- El acceso a datos se apoya en **Supabase Auth + RLS**
- Nunca se envía `user_id` desde inputs del usuario para autorizar datos

## Notas

- El dashboard no mezcla monedas: filtra por BOB o USD
- Las transacciones en borrador (`DRAFT`) no entran en el resumen
- Una categoría o método desactivado no aparece al crear transacciones, pero sigue visible en el historial

## Tasks futuras

Ideas pendientes (sin orden fijo):

- [x] Inicio de sesión con Google (OAuth)
- [ ] Otros proveedores OAuth (Apple, etc.)
- [x] Onboarding con `@username` único
- [ ] Amigos: buscar por `@username` y agregar (tabla `friendships` referenciando `profiles.id`)
- [x] Cambio de `@username` con límite de días configurable
- [ ] Passkeys (WebAuthn) para login sin contraseña
- [ ] Paginación / infinite scroll en el listado de transacciones
- [ ] Búsqueda por texto (comercio, descripción)
- [ ] Filtro por moneda y por rango de fechas en `/transactions`
- [ ] Captura no manual: imagen, texto o audio (`source = IMAGE | TEXT | AUDIO`)
- [ ] Flujo de borradores (`status = DRAFT`) y confirmación
- [ ] Color elegible por categoría: columna `color` en `categories` (Supabase) y selector en el formulario. Hoy el color se asigna automáticamente a partir del id (`features/categories/categoryColor.ts`); el valor guardado debería tener prioridad y usar el automático como fallback
- [ ] Presupuestos por categoría / mes y alertas de límite
- [ ] Conversión o vista unificada multi-moneda en el dashboard
- [ ] Gráficos de tendencia (ingresos vs gastos en el tiempo)
- [ ] Exportar transacciones (CSV / PDF)
- [ ] Recurrencias (suscripciones, sueldo, etc.)
- [ ] PWA / instalación en móvil
- [x] Edición del nombre visible
- [ ] Avatar propio (hoy se usa el de Google)
- [ ] Panel interno para revisar feedback de usuarios

## Sueños

Cosas que nos encantaría que Kibo tenga algún día:

- [ ] Badge de **Founder** para quienes usaron Kibo durante la beta: marcar a esos usuarios (p. ej. columna `is_founder` o `joined_during_beta` en `profiles`, calculada por `created_at` antes de la fecha de salida de la beta) y mostrar el badge en su perfil y junto a su `@username`

## Deuda técnica

- [x] Desacoplar Supabase detrás de repositorios/adapters — **features migrados: transactions, categories, payment-methods, dashboard, auth, feedback, profile**
- [ ] Generar tipos de DB con Supabase CLI (`Database`) en lugar de tipos manuales
- [x] Unificar lecturas activas de categorías/métodos en el mismo repository del feature
- [ ] Añadir tests (al menos unitarios de utils/schemas y smoke de páginas críticas)
- [ ] Versionar migraciones SQL / schema en el repo — **iniciado**: `profiles` ya vive en `supabase/migrations/`; faltan las migraciones previas (categorías, métodos de pago, transacciones, feedback)
- [ ] Revisar mutaciones client-side vs server actions donde convenga (auth, feedback, CRUD)
