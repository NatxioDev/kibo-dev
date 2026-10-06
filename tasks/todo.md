# Tareas: KIBO-84 Mascota Kibo animada y animación de carga

Spec: `docs/specs/KIBO-84-mascota-kibo.md` · Plan: `tasks/plan.md`

Comandos: `bun run lint` · `bun run test` · `bun run build` · `bun dev` → `/dev/mascota`

Antes de cada tarea que toque Next.js, leer la guía relevante en `node_modules/next/dist/docs/`.
Referencia visual: demo v3 y hoja de estados adjuntas en Linear.

---

## Task 0: Rama de trabajo

- [x] Crear `yamilignaciopazsea/kibo-84-mascota-kibo-animada-y-animacion-de-carga` desde `origin/release/v0.10.0`.

---

## Fase 0: Riesgos y base

## Task 1: Spike de morph de ojos en Safari iOS

**Description:** Portar solo el estado `feliz` (cuerpo + morph de ojos con `d: path()`) a un
componente provisional y probarlo en Safari iOS, Safari macOS, Chrome y Firefox. El resultado
decide si los morphs de ojos quedan en CSS o pasan a `motion`.

**Estado:** CSS `d` falla en Safari macOS (probado por Yamil). Decisión: `motion.path` animando
el atributo `d`. Bloque de prueba en `/dev/mascota` ya usa `motion` (Chromium OK); falta
reconfirmar en Safari.

**Acceptance criteria:**
- [x] Hay evidencia del comportamiento en Safari (macOS: CSS `d` no anima ni dibuja el path).
- [x] La decisión (`motion`) queda anotada en la sección "Decisión técnica" de la spec.
- [x] Safari confirma que la versión con `motion` anima (`EyeMorphProbe` en `/dev/mascota`).
- [x] El código del spike se descarta o se convierte en la base de la tarea 8.

**Verification:**
- [ ] Manual check: los ojos pasan de píldora a arco `^` en los 4 navegadores.

**Dependencies:** None

**Files likely touched:**
- `src/app/dev/mascota/page.tsx` (provisional)
- `docs/specs/KIBO-84-mascota-kibo.md`

**Estimated scope:** XS

---

## Task 2: Configurar Vitest

**Description:** Agregar Vitest como devDependency con alias `@` → `src` y scripts `test` y
`test:watch`, más un test trivial que confirme que la configuración funciona.

**Acceptance criteria:**
- [x] `bun add -d vitest` agregado; `vitest.config.ts` con `resolve.alias` y `environment: "node"`.
- [x] Scripts `"test": "vitest run"` y `"test:watch": "vitest"` en `package.json`.
- [x] `bun run test` corre y pasa (`semver.test.ts`, 3 tests); `bun run build` no incluye los tests.

**Verification:**
- [ ] Tests pass: `bun run test`
- [ ] Build succeeds: `bun run build`

**Dependencies:** None

**Files likely touched:**
- `package.json`, `bun.lock`
- `vitest.config.ts`
- `tsconfig.json` (solo si hace falta incluir tipos de Vitest)

**Estimated scope:** S

---

## Task 3: `KiboLoader` y página `/dev/mascota`

**Description:** Crear `KiboLoader` con variantes `screen` (Kibo rueda, 1.5 s) y `compact` (arco
que gira, 1 s) portando `cgA`/`cgB` de la demo, con reduced motion (pulso de opacidad), a11y y
la variable `--mascot-ink`. Crear la página de showcase que muestra el loader en todos los tamaños.

**Acceptance criteria:**
- [x] `<KiboLoader variant size label className />` es Server Component, con `role="status"` y `aria-label` (`label={null}` lo vuelve decorativo).
- [x] Loop sin saltos en ambas variantes; legible a 48/32/24/20 px.
- [x] Con `prefers-reduced-motion: reduce` no hay rotación; solo pulso de opacidad de 2 s.
- [x] `--mascot-ink` definido en `:root` y `.dark` en `globals.css` y usado por el loader.
- [x] `/dev/mascota` llama a `notFound()` en producción (no probado en vivo: sin sesión el proxy redirige a `/login` antes).

**Verification:**
- [ ] Build succeeds: `bun run build`
- [ ] Manual check: `/dev/mascota` en claro y oscuro, con reduced motion emulado en DevTools.

**Dependencies:** None

**Files likely touched:**
- `src/components/mascot/KiboLoader.tsx`
- `src/components/mascot/KiboLoader.module.css`
- `src/components/mascot/shapes.ts`
- `src/app/globals.css`
- `src/app/dev/mascota/page.tsx`

**Estimated scope:** M

---

## Checkpoint A: Base

- [ ] `bun run lint`, `bun run test` y `bun run build` en verde
- [ ] Loader revisado en `/dev/mascota` (tamaños, claro/oscuro, reduced motion)
- [ ] Revisión con el equipo antes de seguir

---

## Fase 1: Reemplazo de spinners

## Task 4: `Button loading` + `ConfirmDialog`

**Description:** Agregar la prop opcional `loading` a `Button`, que antepone un `KiboLoader
compact` y pone `disabled` y `aria-busy`. `ConfirmDialog` pasa `loading` a su botón de confirmar.

**Acceptance criteria:**
- [x] `loading` es opcional; los usos actuales de `Button` no cambian.
- [x] El loader toma un tamaño acorde al `size` del botón (sm 16, md 18, lg 20 px).
- [x] Todos los diálogos que usan `ConfirmDialog` muestran el loader mientras confirman.
- [x] Test `Button.test.tsx`: `disabled`, `aria-busy` y loader decorativo (sin `role="status"` anidado).
- [x] Revisión visual en `/dev/mascota` → "Botones con loading".

**Verification:**
- [ ] Build succeeds: `bun run build`
- [ ] Manual check: borrar una transacción y desactivar una cuenta muestran el loader en el botón.

**Dependencies:** Task 3

**Files likely touched:**
- `src/components/ui/Button.tsx`
- `src/components/ui/ConfirmDialog.tsx`
- `src/app/dev/mascota/page.tsx`

**Estimated scope:** S

---

## Task 5: Login con loader y eliminar `AuthSpinner`

**Description:** Reemplazar `AuthSpinner` por `KiboLoader compact` en los botones de Google y
Passkey, y mostrar `KiboLoader screen` superpuesto a la tarjeta de login mientras se redirige.

**Acceptance criteria:**
- [x] `AuthSpinner.tsx` eliminado y sin referencias.
- [x] Botones con `Button loading`; los hooks exponen `redirecting` (se activa al tener éxito y
      queda hasta que cambia la página; Google lo resetea en `pageshow` si vuelve desde caché).
- [x] Mientras redirige se muestra `RedirectOverlay` (loader de pantalla + texto con `role="status"`, en `Portal`).
- [x] Si el inicio de sesión falla, el loader desaparece y se muestra el error como hoy (probado con Passkey en localhost).
- [x] Ver el overlay en un inicio de sesión real con Google y con Passkey (validado por Nacho;
  texto cambiado a "Iniciando sesión con Google…").

**Verification:**
- [ ] Build succeeds: `bun run build`
- [x] Manual check: login con Google y con Passkey (éxito y cancelación).

**Dependencies:** Task 3

**Files likely touched:**
- `src/features/auth/components/GoogleSignInButton.tsx`
- `src/features/auth/components/PasskeySignInButton.tsx`
- `src/features/auth/components/AuthSpinner.tsx` (eliminar)
- `src/app/login/page.tsx`

**Estimated scope:** S

---

## Task 6: Export de reportes, formulario y filtros de transacciones

**Description:** Reemplazar el spinner de `ExportReportButton` por `KiboLoader compact`, y usar
el loader inline en `TransactionForm` (`loadingOptions`) y junto al contador de
`TransactionListFilters` (`isPending`), manteniendo la opacidad actual de la lista.

**Acceptance criteria:**
- [x] Ningún `animate-spin` en estos archivos.
- [x] Los `aria-live` / `aria-busy` existentes se conservan.
- [x] Los botones de submit de los formularios de cuentas, categorías y métodos de pago usan `Button loading`
  (también transacciones, feedback, perfil y liquidaciones).
- [x] `TransactionForm` (`loadingOptions`) mantiene `ChipSkeleton`: se decidió conservar los skeletons.

**Verification:**
- [x] Typecheck y lint: `bunx tsc --noEmit -p .`, `bun run lint`
- [ ] Manual check: exportar CSV/XLSX, abrir "nueva transacción", cambiar filtros.

**Dependencies:** Task 4

**Files likely touched:**
- `src/features/reports/components/ExportReportButton.tsx`
- `src/features/transactions/components/TransactionForm.tsx`
- `src/features/transactions/components/TransactionListFilters.tsx`
- `src/features/accounts/components/AccountForm.tsx` (y equivalentes si aplica)

**Estimated scope:** M

---

## Task 7: Lista de Passkeys y búsqueda de amigos

**Description:** Mostrar `KiboLoader compact` junto a los textos "Cargando Passkeys…" y "Buscando…".

**Acceptance criteria:**
- [x] El texto sigue visible junto al loader.
- [x] El loader desaparece al terminar la carga o la búsqueda.

**Verification:**
- [x] Typecheck y lint: `bunx tsc --noEmit -p .`, `bun run lint`
- [ ] Manual check: `/settings/security` y búsqueda en `/friends`.

**Dependencies:** Task 3

**Files likely touched:**
- `src/features/auth/components/PasskeyList.tsx`
- `src/features/friends/components/FriendSearch.tsx`

**Estimated scope:** XS

---

## Checkpoint B: Sin spinners

- [x] `rg -n "animate-spin|AuthSpinner" src` sin resultados
- [x] lint + test + build en verde
- [ ] Recorrido manual: login, transacciones, reportes, settings, amigos, diálogos

---

## Fase 2: Mascota y marca

## Task 8: `KiboMascot` base + estados tranquilos

**Description:** Crear `KiboMascot` (Client Component) con la estructura SVG de la demo (sombra,
cuerpo, ojos) y los estados `idle`, `feliz`, `durmiendo` y `pensando`, usando la técnica que
definió el spike. Incluye pose estática por estado para reduced motion.

**Acceptance criteria:**
- [x] `<KiboMascot mood size shadow className />` con `aria-hidden`.
- [x] Los 4 estados coinciden con la hoja v3 en `/dev/mascota`.
- [x] Sombra y extras (z, puntitos) se ocultan en tamaños ≤ 32 px.
- [x] Con reduced motion cada estado muestra su pose característica quieta.
- [x] `usePrefersReducedMotion` (con `useSyncExternalStore`) en vez de `useReducedMotion`: el de
  motion lee la preferencia en el primer render y la hidratación dejaba el `d` del servidor.

**Verification:**
- [x] Typecheck y lint
- [x] Manual check: comparación con la hoja v3 en claro/oscuro y con reduced motion (Chrome).
- [x] Manual check: Safari.

**Dependencies:** Task 1, Task 3

**Files likely touched:**
- `src/components/mascot/KiboMascot.tsx`
- `src/components/mascot/KiboMascot.module.css`
- `src/components/mascot/shapes.ts`
- `src/components/mascot/types.ts`
- `src/app/dev/mascota/page.tsx`

**Estimated scope:** M

---

## Task 9: Estados expresivos + calma automática

**Description:** Agregar `sorprendido`, `preocupado`, `guino` y `mareado` (con gotita y
destellos), e implementar la calma automática: los estados expresivos (incluido `feliz`) se
reproducen 2 ciclos y vuelven a `idle` con `onAnimationEnd`.

**Acceptance criteria:**
- [x] Los 8 estados en alcance coinciden con la hoja v3.
- [x] `feliz`, `sorprendido`, `preocupado`, `guino` y `mareado` vuelven a `idle` tras 2 ciclos; `idle`, `durmiendo` y `pensando` siguen en loop.
- [x] Cambiar la prop `mood` reinicia el ciclo del nuevo estado.
- [x] Con reduced motion no hay `animationend`: el estado expresivo queda en su pose.

**Verification:**
- [x] Typecheck y lint
- [x] Manual check: en `/dev/mascota`, cada estado expresivo vuelve a idle (6 s; mareado 4.8 s); botón para repetir.

**Dependencies:** Task 8

**Files likely touched:**
- `src/components/mascot/KiboMascot.tsx`
- `src/components/mascot/KiboMascot.module.css`
- `src/components/mascot/shapes.ts`
- `src/app/dev/mascota/page.tsx`

**Estimated scope:** M

---

## Task 10: `KiboLogo` v3

**Description:** Reemplazar la "o" del wordmark por la v3 (aro dorado más fino, mitad
`var(--mascot-ink)`, ojos píldora) usando el SVG del logotipo v3 de la demo.

**Acceptance criteria:**
- [x] `AppTopBar` y `WelcomeHero` muestran el logo v3 sin cambios de layout (mismo `viewBox`).
- [x] Las letras siguen usando `currentColor`; la "o" se ve bien en claro y oscuro.

**Verification:**
- [x] Typecheck y lint
- [x] Manual check: top bar en ambos temas (bienvenida usa el mismo componente).

**Dependencies:** Task 3

**Files likely touched:**
- `src/components/ui/KiboLogo.tsx`

**Estimated scope:** XS

---

## Task 11: Assets de marca, favicon y script `brand:icons`

**Description:** Actualizar los SVG de `public/brand` a la "o" v3, crear `scripts/brand-icons.ts`
que rasteriza PNG e ICO con `sharp` o `rsvg-convert`, regenerar todos los íconos y versionar sus
nombres para invalidar caché.

**Acceptance criteria:**
- [x] SVG actualizados: `favicon`, `app-icon`, `app-icon-maskable`, `isotipo`, `imagotipo*`, `isologo*`
  (generados desde `shapes.ts` y `brand/logoPaths.ts`; `logotipo*` no lleva cara y no cambia).
- [x] `favicon-v3.svg` elige la tinta con `@media (prefers-color-scheme: dark)`; íconos con fondo tinta usan `#2b2619` en la mitad de la cara.
- [x] PNG regenerados (32, 180, 192, 512, maskable 512) con sufijo `-v3` y `src/app/favicon.ico` (16/32/48) reemplazado.
- [x] `layout.tsx` y `manifest.ts` apuntan a los nombres nuevos.
- [x] Rasteriza con `rsvg-convert`: `sharp` solo llega transitivo por Next y con scripts ignorados.

**Verification:**
- [x] Build succeeds: `bun run build`
- [ ] Manual check: favicon en pestaña clara y oscura; reinstalar la PWA y ver el ícono nuevo.

**Dependencies:** Task 10

**Files likely touched:**
- `public/brand/*` (generados)
- `scripts/brand-icons.ts`
- `package.json` (script `brand:icons`)
- `src/app/layout.tsx`, `src/app/manifest.ts`, `src/app/favicon.ico`

**Estimated scope:** M (muchos archivos, pero generados)

---

## Checkpoint C: Mascota y marca

- [ ] lint + test + build en verde
- [ ] Hoja v3 vs `/dev/mascota` lado a lado
- [ ] Nacho valida la tinta `#2b2619` en modo oscuro

---

## Fase 3: Reglas e integración

## Task 12: `computeMascotSignals` con tests

**Description:** Función pura que recibe transacciones de los últimos 90 días y la fecha de hoy,
y devuelve `{ unexpectedIncome, manyExpensesToday }` según los umbrales de la spec.

**Acceptance criteria:**
- [x] Ingreso de los últimos 3 días > 1.5× el promedio de los 90 días previos → `unexpectedIncome`; con menos de 3 ingresos de historial → `false`.
- [x] ≥ 5 gastos con fecha de hoy → `manyExpensesToday`.
- [x] Tests cubren: historial insuficiente, borde 1.5×, borde 3 días, exactamente 4 y 5 gastos.

**Verification:**
- [x] Tests pass: `bun run test`

**Dependencies:** Task 2

**Files likely touched:**
- `src/features/mascot/computeMascotSignals.ts`
- `src/features/mascot/computeMascotSignals.test.ts`
- `src/features/mascot/types.ts`

**Estimated scope:** S

---

## Task 13: `selectMascotMood` con tests

**Description:** Función pura que aplica la prioridad de la spec (error → mareado, vacío →
durmiendo, muchos gastos → mareado, ingreso inesperado → sorprendido, gastos > ingresos →
preocupado, buen balance → feliz, resto → idle).

**Acceptance criteria:**
- [ ] Cada rama tiene un test, incluida la prioridad entre reglas que coinciden.
- [ ] Empates cubiertos: ingresos = gastos, ingresos 0, balance 0.

**Verification:**
- [ ] Tests pass: `bun run test`

**Dependencies:** Task 12

**Files likely touched:**
- `src/features/mascot/selectMascotMood.ts`
- `src/features/mascot/selectMascotMood.test.ts`

**Estimated scope:** S

---

## Task 14: Dashboard con mascota

**Description:** `GetDashboardData` consulta los últimos 90 días en paralelo con el período y
agrega `mascot: MascotSignals` a `DashboardData`. El dashboard muestra `KiboMascot` con el mood
de `selectMascotMood` en el header, `durmiendo` en `DashboardEmptyState` y `mareado` en
`DashboardErrorState`.

**Acceptance criteria:**
- [ ] Si la consulta de 90 días falla, las señales quedan en `false` y el dashboard carga igual.
- [ ] Las dos consultas corren con `Promise.all`.
- [ ] Datos de prueba producen cada estado esperado (vacío, gastos > ingresos, buen balance, ingreso inesperado, 5+ gastos hoy).

**Verification:**
- [ ] Tests pass: `bun run test`
- [ ] Build succeeds: `bun run build`
- [ ] Manual check: dashboard con cuentas de prueba en cada escenario.

**Dependencies:** Task 9, Task 13

**Files likely touched:**
- `src/features/dashboard/application/GetDashboardData.application.ts`
- `src/features/dashboard/types.ts`
- `src/app/page.tsx`
- `src/features/dashboard/components/DashboardEmptyState.tsx`
- `src/features/dashboard/components/DashboardErrorState.tsx`

**Estimated scope:** M

---

## Task 15: `EmptyState`, guiño y pensando

**Description:** `EmptyState` muestra `KiboMascot mood="durmiendo"` cuando no recibe `icon`.
`guino` aparece al confirmar: feedback enviado, nombre actualizado y Passkey registrada.
`pensando` aparece en el encabezado del sheet de export mientras se genera el archivo.

**Acceptance criteria:**
- [ ] Listas vacías (cuentas, categorías, métodos de pago, transacciones, novedades) muestran Kibo durmiendo, salvo las que pasan un `icon` propio a propósito.
- [ ] Las 3 confirmaciones muestran el guiño una vez (2 ciclos) y vuelven a idle.
- [ ] El export muestra `pensando` mientras `pending` y lo quita al terminar.

**Verification:**
- [ ] Build succeeds: `bun run build`
- [ ] Manual check: cada pantalla mencionada.

**Dependencies:** Task 9, Task 6

**Files likely touched:**
- `src/components/ui/EmptyState.tsx`
- `src/features/feedback/components/FeedbackForm.tsx`
- `src/features/profile/components/DisplayNameForm.tsx`
- `src/features/auth/components/PasskeyList.tsx`
- `src/features/reports/components/ExportReportButton.tsx`

**Estimated scope:** M

---

## Checkpoint D: Completo

- [ ] Todos los Success Criteria de la spec marcados
- [ ] lint + test + build en verde
- [ ] Prueba en Safari iOS (PWA), Chrome y Firefox, claro/oscuro y reduced motion
- [ ] PR abierto referenciando KIBO-84 y la spec
