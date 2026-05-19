# 🛠️ Guía del Desarrollador (Developer Guide)

Bienvenido al código fuente de **JaMechanic**. Este documento está diseñado para ayudarte a entender la arquitectura del proyecto, cómo depurar errores y cómo agregar nuevas funcionalidades de manera estructurada.

## 🏗️ Arquitectura General

El proyecto es un monorepo que contiene dos partes principales:

1. **Frontend (`/frontend`)**: Una aplicación en Next.js (App Router) construida con React, TypeScript y Tailwind CSS. Se enfoca en la interfaz de usuario (Dashboard de Admin, Técnico y Recepción).
2. **Backend (`/backend`)**: Una API REST construida con NestJS, TypeScript, Prisma ORM y PostgreSQL (Neon).

---

## 📂 Estructura de Carpetas Clave

### Raíz del Proyecto (Monorepo)
- `/backend`: Servidor API y base de datos.
- `/frontend`: Aplicación visual para clientes y técnicos.
- `/README_DEV.md`: Archivo con las credenciales, URLs de base de datos y llaves de entorno.
- `/DEVELOPER_GUIDE.md`: Esta guía técnica.

### `/backend` (API de NestJS)
- `prisma/`:
  - `schema.prisma`: Define las tablas y relaciones de la base de datos (PostgreSQL).
  - `seed.ts`: Script para inyectar datos falsos o predeterminados (Ej: Usuario Admin maestro).
- `src/`:
  - `app.module.ts`: Módulo principal que agrupa todo.
  - `auth/`: Lógica de autenticación (generación de tokens JWT, protección de rutas y Guards de Roles).
  - `users/`: Gestión de los usuarios registrados.
  - `appointments/`: Lógica de recepción, citas, asignación técnica y estados de la reparación.
  - `inventory/`: Todo lo referente al stock, solicitudes de repuestos (`part_requests`) y transacciones.
  - `equipment/`: Gestión del catálogo de equipos registrados.
  - `dashboard/`: Agrupación de estadísticas usadas para el panel principal.

### `/frontend` (Next.js App Router)
- `src/app/`: Define las URLs navegables.
  - `(dashboard)/`: Grupo de rutas para usuarios logueados. Todas comparten el mismo Layout lateral.
    - `admin/`: Vistas y controladores de UI exclusivos para Administradores.
    - `tech/`: Vistas exclusivas para Técnicos (Listado de reparaciones, Ficha Técnica, etc).
  - `login/`: Página pública de inicio de sesión.
- `src/components/`: Componentes modulares y reutilizables (Botones, Modales, Tarjetas, Alertas).
- `src/lib/`: Utilidades, helpers y estado global (por ejemplo, Stores de Zustand para manejo rápido de inventario).
- `src/types/`: Interfaces de TypeScript para que el frontend coincida con los DTOs del backend.

---

## 🐛 Cómo corregir un bug (Debugging)

### En el Backend (NestJS)
1. **Reproducir el error:** Asegúrate de tener el backend corriendo con `npm run start:dev`. Esto habilita el modo *watch* y te mostrará los logs en la terminal en tiempo real.
2. **Revisar los Logs:** NestJS imprime errores detallados. Si ves un error `500 Internal Server Error` en el frontend, el backend siempre tendrá el log de la excepción exacta.
3. **Flujo de la Petición:**
   - La petición llega al **Controller** (ej: `inventory.controller.ts`). Verifica si los DTOs están validando la data correctamente o rechazándola (por un `ValidationPipe`).
   - El controlador llama al **Service** (ej: `inventory.service.ts`). Aquí es donde reside la lógica de negocio y las llamadas a la base de datos a través de Prisma (`this.prisma.modelo`).
   - Si el problema es de autenticación o roles, revisa si el controlador usa `@UseGuards(JwtAuthGuard, RolesGuard)` y verifica que el token JWT tenga el rol adecuado (`req.user.id`).
4. **Prisma ORM:** Si el error dice "Argument is missing" o algo similar de Prisma, asegúrate de que estás enviando el formato correcto (por ejemplo, relaciones usando `connect: { id: ... }` o pasando correctamente el ID primitivo).

### En el Frontend (Next.js)
1. **Consola del Navegador y Terminal:** Revisa tanto la consola de Chrome (errores de React, hooks, fetch) como la terminal donde corres `npm run dev` (errores de Server Components o hidratación).
2. **Fetching de Datos:** Gran parte del estado global no usa Redux, sino *Zustand* o peticiones directas (`fetch` en Server Components). Revisa el código del componente fallido para ver si recibe un `null` inesperado de la API.

---

## 📦 Cómo añadir un nuevo módulo o ventana

Añadir una nueva funcionalidad generalmente requiere trabajo Full-Stack. Sigue este flujo de trabajo ordenado:

### Paso 1: Base de Datos (Prisma)
1. Abre `/backend/prisma/schema.prisma`.
2. Añade el nuevo `model` (tabla).
3. Corre el comando: `npx prisma format` (para ordenar el esquema) y luego `npx prisma db push` para subir la tabla a la base de datos de Neon.

### Paso 2: Backend (Crear el Módulo en NestJS)
NestJS utiliza una arquitectura modular. Para crear todo el cascarón (Controller, Service, Module) rápidamente, usa la CLI de NestJS en la carpeta `/backend`:
```bash
npx nest g resource mi-nuevo-modulo
```
1. **DTOs:** Ve a la carpeta `dto` del nuevo módulo y define qué datos esperas recibir (`CreateModuloDto`, `UpdateModuloDto`) usando decoradores de `class-validator` (ej: `@IsString()`, `@IsInt()`).
2. **Service:** Ve a `mi-nuevo-modulo.service.ts` y crea las funciones CRUD llamando a `this.prisma.miNuevoModelo.create(...)`.
3. **Controller:** Define las rutas HTTP (`@Get()`, `@Post()`), inyecta el servicio, y protege los endpoints con los Guards de roles si es necesario:
   ```typescript
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles(user_role.ADMIN) // Solo administradores
   ```

### Paso 3: Frontend (Crear la Interfaz)
1. Ve a `/frontend/src/app/(dashboard)/`.
2. Crea una carpeta para tu nueva ventana. Dependiendo de quién deba verla, ponla dentro de `/admin` o `/tech`.
   - Ejemplo: `/frontend/src/app/(dashboard)/admin/nuevo-modulo/page.tsx`
3. En `page.tsx`, construye tu interfaz. Usa los componentes de UI existentes si es posible para mantener el diseño consistente (vibrante, moderno y premium).
4. **Conexión a la API:** Utiliza `fetch` hacia `NEXT_PUBLIC_API_URL` (definido en `.env.local`) y pasa el token JWT desde las cookies o el localStorage en el header de `Authorization`.

---

## 📚 Funciones y Utilidades Existentes
Antes de reinventar la rueda, ten en cuenta que el proyecto ya posee:
- **Autenticación (JWT):** Implementada en el backend en el módulo `auth`. El frontend guarda el token al hacer login.
- **Roles:** El enum `user_role` (ADMIN, TECH, CLIENT) rige la seguridad.
- **Tipado Fuerte:** Trata de definir interfaces o types en el frontend que hagan match perfecto con los DTOs del backend.

## 💡 Consejos Finales
- Nunca modifiques un esquema de base de datos directamente en SQL. Hazlo siempre en `schema.prisma` y corre `db push` o `migrate` para que Prisma regenere sus tipos de TypeScript.
- Si añades variables de entorno al `.env`, recuerda añadirlas también a las plataformas de despliegue (Render / Netlify).
