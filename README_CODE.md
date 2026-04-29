# 📖 Documentación Funcional del Código: JaMechanic

Este manual explica cómo funciona cada pieza del sistema JaMechanic para que cualquier desarrollador (o tú mismo en el futuro) pueda entender la lógica detrás del código.

---

## 🏗️ 1. Arquitectura General
JaMechanic funciona con un modelo **Cliente-Servidor**:
- **Frontend (Next.js):** La "cara" que ve el usuario. Se comunica con el servidor mediante API REST y WebSockets.
- **Backend (NestJS):** El "cerebro" que procesa los datos, valida la seguridad y se comunica con la base de datos.
- **Base de Datos (PostgreSQL):** El "almacén" donde se guarda todo de forma permanente.

---

## 🗄️ 2. Base de Datos (Prisma & SQL)
El archivo `backend/prisma/schema.prisma` es el mapa de tu base de datos.
- **Users:** Guarda a los clientes y técnicos. Las contraseñas están hasheadas (encriptadas) por seguridad.
- **Equipments:** Almacena la información técnica de los equipos médicos (Marca, Modelo, Serial). Guarda las fotos como un array de URLs.
- **Appointments:** Es el corazón del sistema. Une a un cliente, un técnico y un equipo. Tiene un `status` para saber si está en diagnóstico, reparación o terminado.
- **Inventory:** Control de repuestos con alertas de stock bajo.
- **Messages:** Guarda el historial de los chats para que no se pierdan al recargar la página.

---

## 🧠 3. Backend (El Servidor NestJS)

### 💬 Chat en Tiempo Real (`src/chat/chat.gateway.ts`)
Usa **Socket.io**. Cuando un usuario se conecta:
1. `joinRoom`: El servidor mete al usuario en una "habitación" privada basada en el `appointmentId`.
2. `sendMessage`: Cuando alguien escribe, el servidor guarda el mensaje en la base de datos y lo "emite" (rebota) instantáneamente a todos los que estén en esa misma habitación.

### 🛠️ Módulos de Servicio (`src/appointments`, `src/users`, etc.)
Cada carpeta tiene:
- **Controller:** Define las rutas (ej: `GET /api/users`). Recibe las peticiones del frontend.
- **Service:** Contiene la lógica. Por ejemplo, en `users.service.ts` es donde se usa `bcrypt` para proteger la contraseña antes de guardarla.
- **DTO (Data Transfer Object):** Define qué datos son obligatorios al enviar un formulario (ej: el email debe tener formato de email).

---

## 🎨 4. Frontend (La Interfaz Next.js)

### 🧭 Navegación por Roles (`src/components/layout/Sidebar.tsx`)
El Sidebar filtra los enlaces dinámicamente. Si el usuario es `CLIENT`, no verá el inventario; si es `TECH`, verá las herramientas de diagnóstico.

### 📸 Formulario de Recepción (`src/app/(dashboard)/reception/page.tsx`)
Usa `react-hook-form` y `zod`. Valida que se suban exactamente 3 imágenes. Actualmente, guarda las URLs de las fotos; en el futuro, estas fotos se subirán a un servidor de imágenes (como Cloudinary).

### 💬 Interfaz de Chat (`src/app/(dashboard)/chat/page.tsx`)
Se conecta al servidor apenas carga la página. Usa el estado de React (`useState`) para mostrar los mensajes nuevos apenas llegan del WebSocket sin necesidad de refrescar.

---

## 🔗 5. Conectividad y Seguridad

### 🔒 CORS (Cross-Origin Resource Sharing)
En `backend/src/main.ts`, el servidor tiene una regla que solo permite que **tu frontend** (localhost:3000 o tu sitio en Netlify) le hable. Esto evita que hackers usen tu API desde otros sitios.

### 🧬 Variables de Entorno
- `DATABASE_URL`: Es el "cordón umbilical" con Neon.tech.
- `NEXT_PUBLIC_API_URL`: Le dice al frontend a qué dirección enviarle los datos al servidor.

---

## 📊 6. Flujo de Trabajo Típico
1. **Recepción:** El técnico crea una cita y toma 3 fotos.
2. **Asignación:** El Admin asigna la cita a un técnico.
3. **Comunicación:** El cliente y el técnico chatean sobre el estado del equipo.
4. **Finalización:** El técnico actualiza el estado a `FINISHED` y el cliente recibe su equipo.

---
*Este código ha sido diseñado para ser escalable, permitiendo agregar módulos de hardware Fluke o pagos en línea fácilmente.*
