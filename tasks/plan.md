# Implementation Plan: Mascota Kibo animada y animación de carga (KIBO-84)

Spec: [`docs/specs/KIBO-84-mascota-kibo.md`](../docs/specs/KIBO-84-mascota-kibo.md) · Tareas: [`tasks/todo.md`](./todo.md)

## Overview

Portar la demo v3 (SVG + keyframes CSS) a dos componentes reutilizables, `KiboLoader` y
`KiboMascot`; reemplazar todos los spinners por el loader; actualizar logo, favicon e íconos a la
"o" v3; y decidir el estado de la mascota en el dashboard con reglas puras testeadas con Vitest.

## Architecture Decisions

- **CSS Modules + SVG inline para transforms; `motion` solo para la forma de los ojos.** El spike
  confirmó que Safari no anima `d: path()` en CSS. `KiboLoader` no cambia de forma, así que sigue
  como Server Component (sin JS) y reduced motion es una media query.
- **`KiboMascot` es Client Component** por la calma automática (`onAnimationEnd` → `idle`).
- **Color de tinta por variable** `--mascot-ink` (`#14120d` claro / `#2b2619` oscuro) en
  `globals.css`; los SVG usan `fill="var(--mascot-ink)"` en la mitad derecha del cuerpo.
- **Paths compartidos en `shapes.ts`**: cuerpo, ojo píldora y variantes de ojo usadas como estado
  base de cada mood (también sirven como pose estática para reduced motion).
- **Reglas en dos funciones puras** dentro de `src/features/mascot/`: `computeMascotSignals`
  (transacciones → señales) y `selectMascotMood` (datos + señales → mood). `GetDashboardData`
  hace una segunda consulta de 90 días con el repositorio existente (`listConfirmedInRange`), sin
  cambios de esquema.
- **Íconos rasterizados con un script local** (`bun run brand:icons`) que se corre a mano y cuyos
  resultados se commitean; nunca durante `next build`.
- **`Button` gana `loading?: boolean`** opcional: agrega el loader, `disabled` y `aria-busy`, sin
  cambiar la API existente.
- **Página `/dev/mascota`** como banco de pruebas visual; `notFound()` si
  `process.env.NODE_ENV === "production"`.

## Task List

### Fase 0: Riesgos y base
- [ ] Task 1: Spike de morph de ojos en Safari iOS (decide CSS vs `motion`)
- [ ] Task 2: Configurar Vitest
- [ ] Task 3: `KiboLoader` (screen + compact) y página `/dev/mascota`

### Checkpoint A: Base
- [ ] lint + test + build en verde; loader verificado en 48/32/24/20 px, claro/oscuro y reduced motion

### Fase 1: Reemplazo de spinners (vertical por superficie)
- [ ] Task 4: `Button loading` + `ConfirmDialog`
- [ ] Task 5: Login (botones Google/Passkey, loader de pantalla al redirigir) y eliminar `AuthSpinner`
- [ ] Task 6: Export de reportes, formulario y filtros de transacciones
- [ ] Task 7: Lista de Passkeys y búsqueda de amigos

### Checkpoint B: Sin spinners
- [ ] `rg -n "animate-spin|AuthSpinner" src` vacío; recorrido manual de las superficies tocadas

### Fase 2: Mascota y marca
- [ ] Task 8: `KiboMascot` base + estados `idle`, `feliz`, `durmiendo`, `pensando`
- [ ] Task 9: Estados `sorprendido`, `preocupado`, `guino`, `mareado` + calma automática
- [ ] Task 10: `KiboLogo` v3 + variable `--mascot-ink`
- [ ] Task 11: Assets de `public/brand`, favicon y script `brand:icons`

### Checkpoint C: Mascota y marca
- [ ] Hoja v3 vs `/dev/mascota` lado a lado; favicon e ícono PWA nuevos; revisión con Nacho del modo oscuro

### Fase 3: Reglas e integración
- [ ] Task 12: `computeMascotSignals` con tests
- [ ] Task 13: `selectMascotMood` con tests
- [ ] Task 14: Dashboard: señales en `GetDashboardData` + mascota en header, vacío y error
- [ ] Task 15: `EmptyState` con `durmiendo`, `guino` en confirmaciones, `pensando` en export

### Checkpoint D: Completo
- [ ] Todos los Success Criteria de la spec marcados
- [ ] lint + test + build en verde; prueba en Safari iOS (PWA), Chrome y Firefox
- [ ] Listo para PR

## Dependency Graph

```
3 KiboLoader ──┬── 4 Button loading ── 6 Export/formularios ──┐
               ├── 5 Login                                     │
               ├── 7 Passkeys/amigos                           │
               ├── 10 Logo ── 11 Assets                        │
               └──┐                                            │
1 Spike ──────────┴── 8 Mascota base ── 9 Expresivos ──┬── 14 Dashboard
2 Vitest ── 12 Señales ── 13 Mood ─────────────────────┘        │
                                         9 + 6 ──────────── 15 EmptyState/guiño/pensando
```

## Parallelization

- Tras el Checkpoint A: Fase 1 (tareas 4–7), Fase 2 (8–11) y tareas 12–13 son independientes
  entre sí y pueden ir en paralelo (sesiones o ramas distintas).
- Secuencial: 4 antes de 6 (usa `Button loading`); 8 → 9; 10 → 11; 12 → 13 → 14 → 15.
- 3 y 10 tocan `globals.css` (`--mascot-ink`): la variable se crea en la tarea 3 y la 10 solo la usa.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Safari no anima `d: path()` en CSS | Alto | Spike primero (tarea 1); fallback con `motion` animando el atributo `d` |
| Loop con salto visible al reiniciar | Medio | Keyframes 0 % = 100 %; verificar a 0.25× en DevTools Animations |
| Legibilidad a 20–24 px | Medio | Ocultar sombra y extras (gotita, z, puntitos) ≤ 32 px; revisar en showcase |
| `--mascot-ink` no aplica en íconos estáticos (PNG) | Bajo | Los íconos con fondo tinta usan `#2b2619` fijo; el favicon SVG usa media query |
| Consulta extra de 90 días agrega latencia al dashboard | Medio | Ejecutar en paralelo con la consulta del período (`Promise.all`); si falla, señales en `false` sin romper el dashboard |
| Cache del favicon / ícono de PWA en dispositivos | Bajo | Cambiar nombres de archivo (`favicon-v3.svg`, etc.) para invalidar caché |
| Animaciones distraen o consumen batería | Bajo | Calma automática a los 2 ciclos; solo transforms y opacidad (compositor) |

## Open Questions

- Ninguna bloqueante. Validar con Nacho el color `#2b2619` en el Checkpoint C.
