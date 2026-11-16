# Sistema de Gestión de Cuentas

App interna (Next.js + Supabase + shadcn) para liquidar el beneficio telefónico de empleados: usuarios/contratos, facturas mensuales, consumos extras y exportación Excel/TXT.

## Requisitos

- Node.js 20+
- Cuenta Supabase (tier gratuito alcanza)
- Variables de entorno:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Scripts

```bash
pnpm install
pnpm dev
pnpm build
pnpm test
```

## Flujo de uso

1. **Cargar usuarios** (`/cargar-usuarios`) — Excel con legajo, CUIL, contrato, etc.
2. **Ver / renovar contratos** desde `/usuarios`.
3. **Cargar facturas** (`/cargar-facturas`) — Excel del mes + % impuestos + gestión.
   - Si el mes ya tiene líneas, **se reemplazan** al confirmar.
4. **Ver facturas** (`/facturas`) — filtros, extras, export Excel/TXT.
5. **Consumos extras** (`/consumos`) — catálogo y aplicación por mes (reemplaza extras del mes).
6. **Administrar datos** (`/resetear-db`) — borrar por mes o tablas (con confirmación).

## Plantillas Excel

Cada pantalla de carga ofrece **Plantilla Excel** con las columnas esperadas.

### Usuarios

`Legajo, Cuil, Certificado, Entidad, Fecha (ddmmyyyy), Disponible, Rem mens, Nombre, Apellido, Estado`

Estados: `activo | jubilado | admin | aduana | other`

### Facturas

`Nro Linea, Usuario, Legajo, Plan, Monto valor plan, Monto servicios adicionales, Monto bonificaciones, Monto llamadas locales nac, Monto llamdas internacionales, Monto roaming, Monto mensajes, Monto datos, Monto otros cargos , Monto total linea`

### Consumos (catálogo)

`Codigo, Nombre`

### Consumos a aplicar

`Legajo, Codigo, Monto`

## Modelo de datos (Supabase)

`users` → `contracts` → `bills_mensuales` → `bills`  
               ↘ `bill_extras` ← `extras`

- Contrato **activo**: dura **1 año** (12 cuotas).
- Liquidación activo: total + extras − excedente (excedente = max(0, total+extras−disponible)).

## Notas

- No hay login: la URL se considera privada del cliente.
- Las operaciones corren desde el browser con la anon key de Supabase.
- Al re-cargar facturas de un mes se reemplazan las **líneas**; los extras del mes se mantienen salvo que se vuelva a cargar el Excel de extras.
