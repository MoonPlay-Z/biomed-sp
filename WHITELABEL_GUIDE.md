# Guía de Personalización y Reventa (White-Label)

Este documento detalla cómo personalizar la plataforma (actualmente conocida como JaMechanic / Cafeteria) para adaptarla a la identidad visual de un nuevo cliente o empresa. Siguiendo estos pasos, podrás modificar logos, colores, nombres de marca y gestionar los usuarios iniciales para entregar un producto "llave en mano".

## 🎨 1. Modificación de Logos e Identidad Visual

### Imágenes y Favicon
Todos los recursos estáticos públicos del frontend se encuentran en la carpeta `/frontend/public`. Para cambiar el logo del sitio:

1. Reemplaza el archivo `/frontend/public/favicon.ico` con el icono de la nueva empresa.
2. Si existen logos en formato SVG o PNG en la carpeta `public` (ej. `logo.png`, `logo.svg`), reemplázalos manteniendo el mismo nombre de archivo, o actualiza las rutas en los componentes si decides cambiar el nombre.

### Componentes de Interfaz
El nombre "JaMechanic" o similares puede estar escrito en componentes clave. Debes buscar y reemplazar el texto en los siguientes lugares comunes (usa la función de búsqueda global de tu editor en la carpeta `/frontend/src`):

- **Header / Navbar:** Revisa `frontend/src/components/` o dentro de los layouts (`frontend/src/app/layout.tsx`, `frontend/src/app/(dashboard)/layout.tsx`).
- **Página de Login:** Ubicada en `frontend/src/app/login/page.tsx`. Aquí suele estar el logo principal y el mensaje de bienvenida.
- **Títulos de Página (Metadatos):** En `frontend/src/app/layout.tsx` o archivos `page.tsx` específicos, busca la exportación de `metadata` y cambia el atributo `title` y `description`.

## 💅 2. Personalización de Colores (TailwindCSS)

El proyecto utiliza Tailwind CSS para los estilos. Para cambiar los colores corporativos:

1. Abre el archivo de configuración global, generalmente ubicado en `frontend/src/app/globals.css` o `frontend/tailwind.config.ts` (o sus equivalentes si usas otra versión).
2. Si los colores están definidos como variables CSS en `globals.css`, modifica los valores HEX o RGB de la paleta principal (por ejemplo, `--primary`, `--secondary`).
3. Si buscas clases hardcodeadas como `bg-blue-600` o `text-slate-900`, puedes usar la herramienta de buscar y reemplazar de tu editor para cambiar, por ejemplo, todos los `blue-` a `emerald-` o el color de la nueva marca.

## 👥 3. Gestión de Usuarios y Administradores

Para entregar el sistema a un nuevo cliente, necesitarás proporcionarle un usuario Administrador inicial.

### Opción A: A través de la Base de Datos (Prisma Seed)
Si estás desplegando la aplicación desde cero para un nuevo cliente:

1. Ve a la carpeta del backend: `cd backend`.
2. Edita el archivo de seed de Prisma, generalmente ubicado en `backend/prisma/seed.ts` (o similar).
3. Modifica las credenciales del usuario administrador por defecto (Email, Nombre, Password).
4. Al hacer el despliegue inicial o ejecutar `npx prisma db seed`, se creará este administrador.

### Opción B: A través del Panel de Administración
Si el sistema ya está corriendo:

1. Inicia sesión con tu usuario de Administrador actual.
2. Dirígete a la sección de **Gestión de Usuarios** (`/admin/users`).
3. Crea un nuevo usuario con el rol de `ADMIN` e ingresa los datos del nuevo dueño.
4. (Opcional) Borra tu usuario de prueba anterior para dejar el sistema limpio.

## 🌍 4. Variables de Entorno (.env)

Asegúrate de actualizar los archivos `.env` (o `.env.local`) tanto en el backend como en el frontend, y en tu plataforma de hosting (Render, Netlify, Vercel, etc.):

- **Backend (`backend/.env`):**
  - `DATABASE_URL`: Apunta a la nueva base de datos del cliente (PostgreSQL).
  - `JWT_SECRET`: Genera un nuevo secreto único para este cliente.
  
- **Frontend (`frontend/.env.local`):**
  - `NEXT_PUBLIC_API_URL`: Asegúrate de que apunte al dominio donde has desplegado el nuevo backend.
  - Opcionalmente, podrías agregar variables como `NEXT_PUBLIC_APP_NAME="Nuevo Nombre"` y usar `process.env.NEXT_PUBLIC_APP_NAME` en el código en lugar de texto estático.

## 🛠️ 5. Administración de Infraestructura y Despliegue

Para administrar correctamente el ciclo de vida de la página y su infraestructura subyacente, necesitarás dominar tres plataformas clave: GitHub, Prisma y Netlify. A continuación te explico cómo gestionar cada una.

### 🐙 GitHub (Control de Versiones y Código)
GitHub es donde reside el código fuente (este monorepo) y actúa como el disparador (trigger) para tus despliegues.

1. **Crear Repositorios para Clientes:** Si vas a revender el sistema a un cliente con requerimientos MUY personalizados, puedes hacer un "Fork" de este repositorio principal (el tuyo) para crear uno nuevo exclusivo para ese cliente.
2. **Ramas (Branches):** Utiliza la rama `main` para el código de producción que se desplegará. Crea ramas como `feature/nuevo-logo` si estás haciendo cambios de identidad visual antes de lanzarlos.
3. **Sincronización:** Cada vez que hagas `git commit` y `git push` a la rama `main`, Netlify detectará el cambio y comenzará a compilar la nueva versión automáticamente.

### 🗄️ Prisma (Administración de Base de Datos)
Prisma es el ORM (Object-Relational Mapper) que controla la estructura de tu base de datos (PostgreSQL).

1. **Prisma Studio:** Si necesitas editar datos rápidamente de forma visual (por ejemplo, corregir un registro de inventario, borrar una reparación de prueba, o ver usuarios), puedes ejecutar localmente:
   ```bash
   cd backend
   npx prisma studio
   ```
   Esto abrirá un panel de control en `http://localhost:5555` que actúa como un "phpMyAdmin" moderno para tus datos.
2. **Migraciones (`prisma migrate deploy`):** Si en el futuro decides añadir nuevas tablas o campos en `schema.prisma`, al desplegar el backend en el servidor, deberás asegurarte de que el comando de compilación incluya generar los tipos y aplicar las migraciones.
3. **Reseteo de Datos:** Si necesitas limpiar una base de datos para un nuevo cliente (CUIDADO: Borrará TODO), usa `npx prisma migrate reset` localmente o contra la DB remota.

### ☁️ Netlify (Hosting y Despliegues Automáticos)
Netlify es el servidor que aloja tanto el Frontend (Next.js) como el Backend (NestJS adaptado) si estás usando su funcionalidad Serverless.

1. **Variables de Entorno (Settings > Environment variables):** Este es el lugar más importante. Aquí debes colocar:
   - `DATABASE_URL` (De la base de datos de producción de tu cliente).
   - `JWT_SECRET` (Firma segura).
   - `NEXT_PUBLIC_API_URL` (La URL pública de tu API desplegada).
2. **Comandos de Construcción (Build Settings):**
   Asegúrate de que en Netlify el comando de construcción apunte a compilar el monorepo entero (ej. `npm run build` en la raíz) y que el directorio de publicación (`Publish directory`) sea `frontend/.next` o el que corresponda según la configuración de Netlify para Next.js.
3. **Rollbacks (Revertir Cambios):** Si subiste un cambio visual para un cliente y algo se rompió, ve a la pestaña "Deploys" en Netlify, haz clic en el despliegue anterior que sí funcionaba, y dale a **"Publish Deploy"**. Tu sitio volverá instantáneamente a la versión anterior sin tener que tocar código de GitHub.

## 🚀 6. Checklist de Entrega Final

Antes de entregar el producto final al cliente, verifica lo siguiente:

- [ ] ¿El favicon y los logos en la pantalla de Login y Dashboard están actualizados?
- [ ] ¿El nombre de la aplicación en la pestaña del navegador muestra la marca correcta?
- [ ] ¿La paleta de colores corresponde a la identidad visual del cliente?
- [ ] ¿El cliente tiene acceso a su cuenta de Administrador?
- [ ] ¿Los correos electrónicos o notificaciones (si existen) tienen la firma de la nueva empresa?
- [ ] ¿La base de datos está separada y conectada correctamente para este cliente específico?
