# 📘 Manual de Sistema JaMechanic (FULL ACCESS)

Este documento centraliza todas las claves y accesos generados durante el desarrollo para que puedas continuar en cualquier computadora usando tus mismas cuentas.

---

## 🔐 1. Credenciales de la Base de Datos (Neon.tech)
**Cuenta vinculada:** `juanaac2003@gmail.com`

- **Database URL:** `postgresql://neondb_owner:npg_Fh79JwMdEjRB@ep-rough-bonus-a4blfjv1.us-east-1.aws.neon.tech/neondb?sslmode=require`
- **Host:** `ep-rough-bonus-a4blfjv1.us-east-1.aws.neon.tech`
- **Database:** `neondb`
- **User:** `neondb_owner`
- **Password:** `npg_Fh79JwMdEjRB`
- **Connection Port:** `5432`

---

## 🐙 2. Repositorio GitHub
**Usuario:** `juanaac2003-cpu`
**Email:** `juanaac2003@gmail.com`
**Repositorio:** `https://github.com/juanaac2003-cpu/JAMechanic.git`

### Para configurar Git en la nueva PC:
```bash
git config --global user.name "juanaac2003-cpu"
git config --global user.email "juanaac2003@gmail.com"
```

---

## 🌐 3. Despliegue (Render & Netlify)
**Cuenta vinculada:** `juanaac2003@gmail.com` (vía GitHub Login)

- **Render (Backend):** [dashboard.render.com](https://dashboard.render.com)
  - Servicio: `jamechanic-backend`
  - URL Producción: `https://jamechanic-backend.onrender.com`
- **Netlify (Frontend):** [app.netlify.com](https://app.netlify.com)
  - Sitio: `jamechanic-frontend`
  - URL Producción: `https://jamechanic.netlify.app` (o la que asigne Netlify)

---

## 🛠️ 4. Configuración Local (.env)

### Backend (`/backend/.env`)
```env
DATABASE_URL="postgresql://neondb_owner:npg_Fh79JwMdEjRB@ep-rough-bonus-a4blfjv1.us-east-1.aws.neon.tech/neondb?sslmode=require"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

### Frontend (`/frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
NEXT_PUBLIC_WS_URL="http://localhost:3001"
```

---

## 🚀 5. Comandos de Rescate
Si clonas el proyecto y algo falla, corre estos comandos en orden:

**En /backend:**
1. `npm install`
2. `npx prisma generate` (Genera el cliente de base de datos)
3. `npx prisma db push` (Sincroniza el esquema con Neon sin borrar datos)
4. `npm run start:dev`

**En /frontend:**
1. `npm install`
2. `npm run dev`

---

## 🔑 6. Llaves SSH (GitHub)
La llave que generamos hoy (`juanaac2003@gmail.com`) está en esta PC. En la nueva PC deberás generar una nueva y subirla a GitHub para tener permiso de `push`.
- Comando: `ssh-keygen -t ed25519 -C "juanaac2003@gmail.com"`
- Súbelo aquí: [https://github.com/settings/keys](https://github.com/settings/keys)

---
*Este manual es confidencial y contiene claves de acceso. Guárdalo en un lugar seguro.*
