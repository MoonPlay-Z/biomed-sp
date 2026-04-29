# 📘 Manual de Sistema: JaMechanic

Este documento contiene toda la información necesaria para replicar el entorno de desarrollo de JaMechanic en una nueva computadora y continuar con el proyecto sin contratiempos.

---

## 🛠️ 1. Requisitos Previos

Asegúrate de tener instalado lo siguiente:
- **Node.js** (v18 o superior)
- **Git**
- **PostgreSQL** (No es necesario instalarlo localmente ya que usamos **Neon.tech** en la nube)
- **Visual Studio Code** (Recomendado)

---

## 📥 2. Clonar el Proyecto

Abre una terminal y ejecuta:

```bash
git clone https://github.com/juanaac2003-cpu/JAMechanic.git
cd JAMechanic
```

---

## 🔐 3. Configuración de Variables de Entorno

Debes crear manualmente los archivos `.env` ya que estos no se suben a GitHub por seguridad.

### 🔸 Backend (`/backend/.env`)
Crea el archivo `backend/.env` y pega lo siguiente:

```env
# Conexión a Base de Datos (Neon.tech)
DATABASE_URL="postgresql://neondb_owner:npg_Fh79JwMdEjRB@ep-rough-bonus-a4blfjv1.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Configuración del Servidor
PORT=3001
NODE_ENV=development

# URLs para CORS (Permitir que el frontend se conecte)
FRONTEND_URL="http://localhost:3000"
```

### 🔸 Frontend (`/frontend/.env.local`)
Crea el archivo `frontend/.env.local` y pega lo siguiente:

```env
# Conexión con el Backend
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
NEXT_PUBLIC_WS_URL="http://localhost:3001"
```

---

## 🚀 4. Instalación y Ejecución

Debes instalar las dependencias en ambas carpetas.

### Paso A: Levantar el Backend
```bash
cd backend
npm install
# Sincronizar Prisma con la base de datos de Neon
npx prisma generate
# Iniciar servidor en modo desarrollo
npm run start:dev
```

### Paso B: Levantar el Frontend
Abre una nueva terminal:
```bash
cd frontend
npm install
# Iniciar servidor de Next.js
npm run dev
```

---

## 🏗️ 5. Estructura del Proyecto

El sistema está organizado como un monorepo simple:

- **/backend**: API construida con **NestJS**.
  - `src/chat`: Lógica de WebSockets (Socket.io).
  - `src/appointments/users/inventory`: Módulos CRUD.
  - `prisma/schema.prisma`: Definición de las tablas SQL.
- **/frontend**: Aplicación web con **Next.js 14 (App Router)**.
  - `src/app`: Rutas y páginas.
  - `src/components`: UI components (Sidebar, Forms, etc.).
  - `src/types`: Definiciones de TypeScript compartidas.

---

## 📡 6. Credenciales de Base de Datos (Neon)

Si necesitas entrar directamente al panel de la base de datos:
- **Host:** `ep-rough-bonus-a4blfjv1.us-east-1.aws.neon.tech`
- **Database:** `neondb`
- **User:** `neondb_owner`
- **Password:** `npg_Fh79JwMdEjRB`
- **Región:** AWS US East (N. Virginia)

---

## 🔑 7. Configuración de GitHub (SSH)

Si vas a hacer `push` desde otra PC, recuerda generar una nueva llave SSH:
1. `ssh-keygen -t ed25519 -C "tu@email.com"`
2. Copia el contenido de `~/.ssh/id_ed25519.pub`.
3. Agrégala en [GitHub SSH Settings](https://github.com/settings/keys).

---

## ⚠️ Notas de Mantenimiento
- **Si cambias el esquema:** Después de editar `schema.prisma`, ejecuta `npx prisma migrate dev --name descripcion_del_cambio` para impactar Neon.
- **Producción:** Al desplegar en Render, asegúrate de que el **Root Directory** sea `backend` y usa las mismas variables de entorno mencionadas arriba.

---
*Manual generado por Antigravity para JaMechanic - Acarigua-Araure.*
