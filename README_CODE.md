# 🗺️ Mapa Completo del Código: JaMechanic

Este manual desglosa cada carpeta y archivo del proyecto para que sepas exactamente dónde está cada parte de la lógica.

---

## 📂 1. Raíz del Proyecto (Monorepo)
- `backend/`: Código del servidor (NestJS).
- `frontend/`: Código de la interfaz web (Next.js).
- `render.yaml`: Instrucciones para que Render sepa cómo construir el backend.
- `README_DEV.md`: Manual de clonación y claves.
- `README_CODE.md`: Esta documentación técnica.

---

## 📂 2. Backend (`/backend`) - El Servidor

### `prisma/` (Base de Datos)
- `schema.prisma`: El archivo más importante del backend. Define las tablas (User, Appointment, etc.) y cómo se relacionan entre sí.
- `migrations/`: Historial de cambios realizados en la base de datos.

### `src/` (Código Fuente)
- **`main.ts`**: El punto de entrada. Aquí se configura el puerto (3001), se habilitan los CORS y se activa la validación automática de datos.
- **`app.module.ts`**: El "puente" que conecta todos los módulos (Users, Chat, Prisma) en una sola aplicación.
- **`prisma/`**: 
  - `prisma.service.ts`: El archivo que permite a otros módulos conectarse a la base de datos de Neon.
- **`chat/`**: 
  - `chat.gateway.ts`: Lógica de WebSockets para el chat en tiempo real. Maneja los eventos `joinRoom` y `sendMessage`.
- **`users/`, `appointments/`, `inventory/`, `equipment/`**:
  Cada una de estas carpetas sigue el mismo patrón:
  - `*.controller.ts`: Define las rutas de la API (ej: `/api/users`).
  - `*.service.ts`: Ejecuta las órdenes en la base de datos (Crear, Buscar, Borrar).
  - `dto/`: Define qué datos son válidos al recibir información del frontend.
  - `entities/`: Representación interna de los datos.

### Archivos de Configuración
- `package.json`: Lista de librerías (NestJS, Prisma, Bcrypt).
- `.env`: (Oculto) Contiene la clave maestra de la base de datos.
- `tsconfig.json`: Reglas de cómo se compila el código de TypeScript a JavaScript.

---

## 📂 3. Frontend (`/frontend`) - La Interfaz

### `src/app/` (Páginas y Rutas)
- **`layout.tsx`**: El marco general de la web (fuentes, estilos globales).
- **`page.tsx`**: La página de inicio (Landing Page) con el Hero y Servicios.
- **`(dashboard)/`**: Grupo de rutas protegidas.
  - `layout.tsx`: Define el diseño del panel con el Sidebar a la izquierda.
  - `reception/page.tsx`: Pantalla para que el técnico ingrese nuevos equipos.
  - `chat/page.tsx`: Pantalla de comunicación en tiempo real.
- **`globals.css`**: Todos los estilos visuales (colores corporativos, fuentes).

### `src/components/` (Piezas Reutilizables)
- **`layout/Sidebar.tsx`**: El menú lateral que cambia según si eres Admin, Técnico o Cliente.

### `src/types/`
- `index.ts`: Define las "formas" de los objetos (User, Equipment) para que no haya errores de código entre el frontend y el backend.

### Archivos de Configuración
- `next.config.ts`: Configuración avanzada de Next.js.
- `netlify.toml`: Instrucciones de despliegue para Netlify.
- `package.json`: Librerías de React, TailwindCSS, Lucide (iconos) y Socket.io-client.

---

## ⚙️ 4. Flujo de un Dato (Ejemplo: Crear Usuario)
1. El usuario llena el formulario en el **Frontend**.
2. El **Frontend** envía un `POST` a `http://localhost:3001/api/users`.
3. El **UsersController** en el **Backend** recibe los datos.
4. El **UsersService** encripta la contraseña y le pide a **Prisma** que guarde todo en **Neon.tech**.
5. **Neon.tech** guarda el registro y el **Backend** le responde al **Frontend**: "Usuario creado con éxito".

---
*Este mapa te permite navegar por el código con total claridad.*
