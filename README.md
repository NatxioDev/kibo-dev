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

- Autenticación: registro, login, logout y sesión con cookies
- Protección de rutas privadas (`proxy.ts`)
- Dashboard: ingresos, gastos, balance, gastos por categoría y últimas transacciones
- Filtros de período (este mes / mes pasado / últimos 3 meses) y moneda (BOB / USD)
- CRUD de transacciones (`source = MANUAL`, `status = CONFIRMED`)
- Configuración de categorías (con emoji) y métodos de pago
- Activar / desactivar categorías y métodos (sin borrado físico)
- Defaults de categorías y métodos de pago al registrarse (trigger en Supabase)

## Requisitos

- Bun ≥ 1.2
- Proyecto Supabase con las tablas `categories`, `payment_methods` y `transactions`, Auth y RLS configurados

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
```

Las obtienes en el dashboard de Supabase → **Connect** o **Project Settings → API Keys** (usa la **publishable key**, nunca `service_role`).

4. Arrancar en desarrollo:

```bash
bun run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
bun run dev      # desarrollo
bun run build    # build de producción
bun run start    # servir build
bun run lint     # ESLint
bunx tsc --noEmit  # typecheck
```

## Rutas principales

| Ruta | Descripción |
|------|-------------|
| `/` | Dashboard |
| `/login` | Iniciar sesión |
| `/register` | Crear cuenta |
| `/transactions` | Listado de transacciones |
| `/transactions/new` | Nueva transacción |
| `/transactions/[id]/edit` | Editar transacción |
| `/settings` | Configuración |
| `/settings/categories` | Categorías |
| `/settings/payment-methods` | Métodos de pago |

## Estructura

```text
src/
├── app/                 # App Router (páginas)
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── transactions/
│   ├── categories/
│   └── payment-methods/
├── lib/supabase/        # clientes browser, server y proxy
└── types/
```

Cada feature agrupa `components/`, `hooks/`, `services/` y, si aplica, `schemas/`.

## Seguridad

- La app usa solo la **publishable key** en el frontend
- El acceso a datos se apoya en **Supabase Auth + RLS**
- Nunca se envía `user_id` desde inputs del usuario para autorizar datos

## Notas

- El dashboard no mezcla monedas: filtra por BOB o USD
- Las transacciones en borrador (`DRAFT`) no entran en el resumen
- Una categoría o método desactivado no aparece al crear transacciones, pero sigue visible en el historial
