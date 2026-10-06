# Spec: Mascota Kibo animada y animación de carga

- Issue: [KIBO-84](https://linear.app/cuchocorp/issue/KIBO-84/mascota-kibo-animada-y-animacion-de-carga)
- Relacionados: KIBO-87 (manual de marca), KIBO-93 (aplicar manual de marca en la app)
- Rama sugerida: `yamilignaciopazsea/kibo-84-mascota-kibo-animada-y-animacion-de-carga`
- Estado: **v2 — decisiones de producto tomadas, pendiente de aprobación final**

## Objetivo

Darle personalidad a Kibo con una mascota (la "o" del logo) que reacciona al estado de las
finanzas del usuario y reemplaza los spinners genéricos por una animación de carga propia.

**Usuario:** cualquier persona que usa Kibo para registrar ingresos y gastos.

**Éxito:** el usuario entiende de un vistazo cómo viene su mes (la mascota lo refleja), y cada
espera en la app muestra a Kibo en vez de un spinner genérico, sin perder accesibilidad ni
rendimiento.

### Anatomía de la mascota (fuente: demo v3 aprobada por Nacho)

- `viewBox` base `0 0 100 100`. Cuerpo: aro dorado `#e0a93b` (radio exterior 46, interior 42)
  con la mitad derecha rellena de tinta.
- Ojos: píldoras sólidas sin pupilas, 16×23.2 u, centradas en `(29.5, 46)` y `(70.5, 46)`.
  Ojo izquierdo tinta `#14120d` (sobre dorado), ojo derecho crema `#FBF1DA` (sobre tinta).
- Expresión solo con forma de ojos + squash & stretch del cuerpo (origen en la base, `50px 96px`).
- Sombra elíptica bajo el cuerpo (tinta al 16 % en claro, negro al 40 % en oscuro); se oculta
  en tamaños ≤ 32 px.

### Variante para modo oscuro (decisión)

La tinta `#14120d` es igual al fondo oscuro de la app. Se evaluaron tres opciones sobre fondo
`#14120d`: dejarla igual (la mitad se lee como un agujero), contorno crema (agrega un elemento
ajeno al diseño) y **tinta elevada**.

**Elegida: tinta elevada `#2b2619`** para la mitad derecha del cuerpo cuando el fondo es tinta.

- Se expone como variable CSS: `--mascot-ink: #14120d` en `:root` y `--mascot-ink: #2b2619` en
  `.dark`. El ojo izquierdo sigue en `#14120d` (va sobre dorado y contrasta igual).
- Aplica a `KiboMascot`, `KiboLoader`, la "o" de `KiboLogo` y a los íconos de marca con fondo
  tinta (app icons, maskable, isologo/imagotipo dark).
- El favicon SVG usa `@media (prefers-color-scheme: dark)` interno para elegir la tinta según el
  tema de la pestaña del navegador.

### Estados y uso

| Estado | Loop | Dónde se usa |
|---|---|---|
| `idle` | 6 s | Reposo: header del dashboard cuando no aplica otro estado |
| `feliz` | 3 s | Balance del período positivo con margen (ver reglas) |
| `sorprendido` | 3 s | Ingreso inesperado reciente (ver reglas) |
| `preocupado` | 3 s | Gastos > ingresos en el período |
| `durmiendo` | 4 s | Estados vacíos: dashboard sin movimientos y `EmptyState` de listas |
| `guino` | 3 s | Confirmaciones: feedback enviado, nombre actualizado, Passkey registrada |
| `pensando` | 4 s | Procesos con espera larga: generación del export de reportes |
| `mareado` | 2.4 s | Errores (`DashboardErrorState`) o muchos gastos seguidos (ver reglas) |
| ~~`celebrando`~~ | — | **Fuera de alcance por ahora.** Se diseñó pero no se implementa todavía |

**Calma automática (decisión):** los estados expresivos (`feliz`, `sorprendido`, `preocupado`,
`guino`, `mareado`) se reproducen **2 ciclos** y vuelven a `idle`. `idle`, `durmiendo` y
`pensando` siguen en loop porque son tranquilos o reflejan un proceso en curso. Se implementa
con `onAnimationEnd` en el grupo del cuerpo y estado local, sin timers.

### Animación de carga (reemplaza spinners)

- **Pantalla** (`variant="screen"`): la "o" entera rueda una vuelta por ciclo (1.5 s, aceleración
  suave), los ojos miran siempre hacia adelante, leve squash dos veces por vuelta.
- **Compacta** (`variant="compact"`): aro tenue + arco dorado que gira (1 s); los ojos siguen la
  punta del arco. Para botones e inline.
- Loop continuo sin saltos; legible a 24 px (y 20 px dentro de botones).

**Decisión:** los skeletons de `loading.tsx` y `PageSkeleton` **se mantienen**. El loader se usa
en los demás lugares donde hoy hay spinner o un texto de espera:

| Lugar | Hoy | Pasa a |
|---|---|---|
| `GoogleSignInButton`, `PasskeySignInButton` | `AuthSpinner` | `compact` en el botón |
| Login mientras redirige a Google / tras Passkey OK | texto "Redirigiendo…" | `screen` superpuesto a la tarjeta de login |
| `Button` (todas las variantes) | solo texto pendiente | prop `loading` → `compact` + texto |
| `ConfirmDialog` (todos los diálogos de baja/borrado) | texto `pendingLabel` | `Button loading` |
| `ExportReportButton` | spinner `animate-spin` | `compact` en la fila + `pensando` en el encabezado del sheet |
| `TransactionForm` (`loadingOptions`) | texto de espera | `compact` inline |
| `TransactionListFilters` (`isPending`) | opacidad | se mantiene la opacidad + `compact` junto al contador |
| `PasskeyList` | "Cargando Passkeys…" | `compact` + texto |
| `FriendSearch` (`searching`) | "Buscando…" | `compact` + texto |
| Fallback de `DashboardFilters` en `page.tsx` | barra pulsante | se mantiene (es skeleton) |

### Criterios de aceptación (verificables)

1. `KiboMascot` renderiza los 8 estados en alcance y coincide visualmente con la hoja v3
   (comparación lado a lado en `/dev/mascota`).
2. `KiboLoader` tiene variantes `screen` y `compact`, sin saltos visibles al reiniciar el loop,
   verificado a 48, 32, 24 y 20 px.
3. No queda ningún spinner genérico: `rg -n "animate-spin|AuthSpinner" src` no devuelve nada y
   todos los lugares de la tabla anterior usan `KiboLoader`.
4. Con `prefers-reduced-motion: reduce`: la mascota se muestra quieta en la pose característica de
   su estado; el loader usa una animación mínima (pulso de opacidad de 2 s, sin rotación).
5. Accesibilidad: mascota decorativa con `aria-hidden`; loader con `role="status"` y label
   (`"Cargando…"` por defecto, configurable); el contenedor que carga mantiene `aria-busy`; los
   botones con `loading` quedan `disabled` y con `aria-busy`.
6. `KiboLogo` usa el wordmark v3 (anillo más fino, ojos más grandes) en `AppTopBar` y `WelcomeHero`.
7. Los assets de marca usan la "o" v3: `favicon.svg`, `favicon-32.png`, `src/app/favicon.ico`,
   `app-icon.svg`, `app-icon-180/192/512.png`, `app-icon-maskable.svg/-512.png`,
   `imagotipo*.svg` e `isologo*.svg`. El favicon nuevo se ve en la pestaña del navegador y el
   ícono nuevo al instalar la PWA.
8. Los estados se eligen con `selectMascotMood`, función pura cubierta por tests de Vitest.
9. Mascota, loader y logo se ven bien en claro y oscuro (variante de tinta elevada).
10. Funciona en Safari iOS (PWA), Chrome y Firefox, incluida la animación de forma de los ojos.
11. `bun run lint`, `bun run test` y `bun run build` pasan.

## Tech Stack

- Next.js 16.3.6 (App Router) + React 19.2 — leer la guía correspondiente en
  `node_modules/next/dist/docs/` antes de escribir código (regla de `AGENTS.md`), en especial
  metadata/íconos (`favicon.ico`, `icons`) y CSS Modules.
- Tailwind CSS v4 (tokens en `src/app/globals.css`, modo oscuro por clase `.dark`).
- `motion` 13 ya instalado (`MotionProvider` con `reducedMotion="user"`).
- SVG inline + keyframes CSS portados de la demo (CSS Module por componente).
- **Vitest** (nueva devDependency, aprobada) para tests unitarios.
- `rsvg-convert` / `sharp` para rasterizar los íconos de marca (script local, no corre en build).
- Bun 1.2 como package manager.

### Decisión técnica: CSS keyframes, no `motion`

La demo ya es SVG + `@keyframes`. Portarla a CSS Modules permite que `KiboLoader` sea un
**Server Component** (sin JS en el cliente) y que `prefers-reduced-motion` se resuelva con una
media query. `KiboMascot` es Client Component por la calma automática (`onAnimationEnd`).

**Riesgo:** la demo anima la forma de los ojos con la propiedad CSS `d: path(...)`, cuyo soporte
en Safari hay que confirmar. La tarea 1 es un spike que lo verifica en Safari iOS:

- Si funciona → todo CSS.
- Si no → los morphs de ojos pasan a `motion` animando el atributo `d` (ya es Client Component y
  `MotionConfig reducedMotion="user"` cubre la accesibilidad). El loader no se ve afectado: solo
  usa transforms.

**Resultado del spike (6 oct 2026):** Safari macOS no anima `d: path()` en CSS y, además, no
dibuja el path si `d` solo está en CSS. **Decisión:** los morphs de ojos se hacen con
`motion.path` animando el atributo `d` (keyframes con `times` y `ease` por tramo, portados de la
demo). Transforms del cuerpo, sombra y extras siguen en CSS. El atributo `d` inicial siempre va
en el JSX. `MotionConfig reducedMotion="user"` no frena animaciones de `d` (no son transforms),
así que `KiboMascot` usa `useReducedMotion()` y no anima los ojos cuando está activo.

## Commands

```
Dev:       bun dev
Lint:      bun run lint
Test:      bun run test            # vitest run
Test watch: bun run test:watch     # vitest
Build:     bun run build
Íconos:    bun run brand:icons     # regenera PNG/ICO desde los SVG de public/brand
Showcase:  http://localhost:3000/dev/mascota   # solo en desarrollo
```

## Project Structure

```
src/components/mascot/
  KiboMascot.tsx             → <KiboMascot mood size? shadow? loop? className? />  ("use client")
  KiboMascot.module.css      → keyframes y clases por estado (portados de la demo)
  KiboLoader.tsx             → <KiboLoader variant="screen"|"compact" size? label? className? />
  KiboLoader.module.css      → keyframes de rueda (screen) y arco (compact) + reduced motion
  shapes.ts                  → paths compartidos (cuerpo, ojo píldora, arco ^, línea, etc.)
  types.ts                   → MascotMood
src/features/mascot/
  selectMascotMood.ts        → reglas puras → MascotMood
  selectMascotMood.test.ts
  computeMascotSignals.ts    → señales (ingreso inesperado, gastos de hoy) desde transacciones
  computeMascotSignals.test.ts
src/features/dashboard/                 → GetDashboardData agrega `mascot: MascotSignals`
src/components/ui/KiboLogo.tsx          → wordmark v3
src/components/ui/Button.tsx            → prop opcional `loading`
src/components/ui/ConfirmDialog.tsx     → usa Button loading
src/components/ui/EmptyState.tsx        → mascota `durmiendo` por defecto si no hay `icon`
src/features/auth/components/AuthSpinner.tsx → se elimina
src/app/dev/mascota/page.tsx            → showcase (notFound() en producción)
src/app/globals.css                     → variable --mascot-ink (claro/oscuro)
src/app/favicon.ico                     → regenerado
public/brand/*                          → SVG v3 + PNG regenerados
scripts/brand-icons.ts                  → rasteriza SVG → PNG/ICO
vitest.config.ts                        → alias `@` → `src`, entorno node
docs/specs/KIBO-84-mascota-kibo.md      → esta spec
```

## Code Style

Sigue el estilo existente: componentes función con props tipadas, `className` opcional al final,
Tailwind para layout, sin comentarios obvios. Ejemplo de API esperada:

```tsx
import styles from "./KiboLoader.module.css";

type KiboLoaderProps = {
  variant?: "screen" | "compact";
  size?: number;
  label?: string;
  className?: string;
};

export function KiboLoader({
  variant = "compact",
  size = 20,
  label = "Cargando…",
  className = "",
}: KiboLoaderProps) {
  return (
    <span role="status" aria-label={label} className={`inline-flex shrink-0 ${className}`}>
      <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden className={styles[variant]}>
        {/* ... */}
      </svg>
    </span>
  );
}
```

Uso en un botón:

```tsx
<Button type="submit" loading={loading}>
  {loading ? "Guardando…" : "Guardar"}
</Button>
```

Convenciones: nombres de estados en español sin tildes (`guino`, `preocupado`), commits con
Conventional Commits (commitlint), un commit por tarea.

## Reglas de estado

### Señales (`computeMascotSignals`)

Se calculan en `GetDashboardData` con una consulta adicional de los últimos 90 días (misma
moneda, solo confirmadas), independiente del período elegido:

- **`unexpectedIncome`**: existe un ingreso con fecha en los últimos 3 días cuyo monto es
  > 1.5 × el promedio de los ingresos de los 90 días anteriores a ese ingreso. Requiere al menos
  3 ingresos de historial; si no, es `false`.
- **`manyExpensesToday`**: hay ≥ 5 gastos con fecha de hoy (zona horaria del usuario, igual que
  `utils/period.ts`). Se usa la fecha del movimiento porque las transacciones no guardan hora.

### Prioridad (`selectMascotMood`)

```
error al cargar el dashboard           → mareado
data.isEmpty                           → durmiendo
signals.manyExpensesToday              → mareado
signals.unexpectedIncome               → sorprendido
expense > income                       → preocupado
balance > 0 && income ≥ 1.2 · expense  → feliz
resto                                  → idle
```

`guino` y `pensando` no salen de esta función: los dispara cada pantalla al confirmar una acción
o mientras procesa.

## Testing Strategy

- **Unitario (Vitest):** `selectMascotMood` (cada rama + empates: ingresos = gastos, ingresos 0,
  balance 0) y `computeMascotSignals` (historial insuficiente, borde de 1.5×, borde de 3 días,
  exactamente 5 gastos, otra moneda ignorada). Tests junto al archivo (`*.test.ts`).
- **Visual/manual:** `/dev/mascota` con los 8 estados, ambas variantes de loader en 48/32/24/20 px,
  botón con `loading`, logo v3, en claro y oscuro; comparar contra la hoja v3 y la demo.
- **Reduced motion:** DevTools (`Rendering → prefers-reduced-motion`) y ajuste del sistema en macOS/iOS.
- **Navegadores:** Safari iOS (PWA instalada), Chrome, Firefox.
- **Íconos:** pestaña del navegador en tema claro y oscuro; reinstalar la PWA en iOS y Android.
- **Regresión:** lint + test + build; recorrer login, dashboard, transacciones, reportes, settings
  y diálogos de confirmación.

## Boundaries

- **Siempre:** respetar `prefers-reduced-motion`; `aria-hidden` en mascota decorativa;
  `role="status"` en loaders; correr lint, test y build antes de cada commit; mantener los
  colores exactos del diseño (salvo la tinta elevada de modo oscuro).
- **Preguntar antes:** agregar dependencias además de Vitest; cambiar umbrales de las reglas;
  tocar textos de UI existentes; cambiar `manifest.ts` más allá de las rutas de íconos.
- **Nunca:** usar GIF/video/Lottie para la mascota; reemplazar skeletons de `loading.tsx`;
  implementar `celebrando` en esta historia; romper la API actual de `Button` (`loading` es
  opcional); rasterizar íconos durante el build.

## Success Criteria

- [ ] 8 estados y 2 variantes de loader visibles en `/dev/mascota`, iguales a la hoja v3.
- [ ] `rg -n "animate-spin|AuthSpinner" src` sin resultados.
- [ ] Todos los lugares de la tabla de loader usan `KiboLoader`.
- [ ] Estados expresivos vuelven a `idle` después de 2 ciclos.
- [ ] Con reduced motion no hay rotación ni saltos; el loader solo pulsa.
- [ ] Mascota, loader y logo legibles en modo oscuro.
- [ ] Animaciones de ojos funcionan en Safari iOS.
- [ ] Dashboard: `durmiendo` vacío, `preocupado` con gastos > ingresos, `feliz` con buen balance,
      `sorprendido` con ingreso inesperado, `mareado` en error o con 5+ gastos hoy.
- [ ] Logo v3 en top bar y bienvenida; favicon e íconos PWA nuevos.
- [ ] Lint, test y build en verde.

## Plan de tareas (borrador, se detalla en `tasks/plan.md` tras aprobar)

1. **Spike Safari:** portar `feliz` con morph de ojos y probar en Safari iOS → define CSS vs `motion`.
2. **Vitest:** instalar, `vitest.config.ts`, scripts `test` / `test:watch`.
3. **`KiboLoader`** (screen + compact, reduced motion, a11y, tinta oscura) + `/dev/mascota`.
4. **Reemplazo de spinners:** `Button loading`, `ConfirmDialog`, login, export, formularios y listas; eliminar `AuthSpinner`.
5. **`KiboMascot`** con los 8 estados, calma automática y modo oscuro.
6. **Marca v3:** `KiboLogo`, SVG de `public/brand`, script `brand:icons`, favicon e íconos PWA.
7. **Reglas:** `computeMascotSignals` + `selectMascotMood` con tests; `GetDashboardData` expone señales.
8. **Integración:** dashboard (header, vacío, error), `EmptyState`, `guino` en confirmaciones, `pensando` en export.

## Decisiones tomadas (6 oct 2026)

1. Modo oscuro → tinta elevada `#2b2619` vía `--mascot-ink`.
2. Skeletons de `loading.tsx` se mantienen; el loader se usa en botones, diálogos, login, export,
   formularios y listas.
3. Se agrega Vitest.
4. Umbrales: ingreso > 1.5× promedio de 90 días (últimos 3 días, mínimo 3 ingresos de historial);
   ≥ 5 gastos con fecha de hoy.
5. `celebrando` queda fuera por ahora.
6. Se actualizan los assets de `public/brand`, incluido el favicon.
7. Los estados expresivos se calman y vuelven a `idle`.

## Open Questions

Ninguna bloqueante. A confirmar con Nacho durante la implementación: que la tinta elevada
`#2b2619` le parezca bien en la PWA real (se valida en `/dev/mascota` con modo oscuro).
