# Software CECAMED

Sistema de administración de casos, padrón y reportes estadísticos para la Comisión Estatal de Conciliación y Arbitraje Médico (CECAMED).

## Resumen
- Frontend: React + Vite + Tailwind (carpeta `frontend`).
- Backend: Node.js + Express (carpeta `backend`).
- Integraciones: Firebase Admin, Google Sheets.

## Estructura principal
- `frontend/` — aplicación React (componentes en `frontend/src/components`, páginas en `frontend/src/pages`).
- `backend/` — API Express (rutas en `backend/src/routes`, controladores en `backend/src/controllers`).

## Requisitos
- Node.js 18+ (recomendado)
- npm (o yarn)
- Cuenta de servicio de Google Cloud si se usa integración con Google Sheets / Firebase

## Variables de entorno (backend)
Revisa `backend/.env.example` y crea `backend/.env` con valores reales (no subir credenciales al repo).

Variables importantes en `backend/.env` (ejemplo):
```
# FIREBASE_CREDENTIALS: JSON del service account (no subir JSON a git)
FIREBASE_CREDENTIALS='{"type":"service_account","project_id":"<PROJECT_ID>","client_email":"<CLIENT_EMAIL>"}'
GOOGLE_SHEET_ID=<GOOGLE_SHEET_ID>
GOOGLE_SHEET_PADRON_ID=<GOOGLE_SHEET_PADRON_ID>
GOOGLE_SHEET_CLASICO_ID=<GOOGLE_SHEET_CLASICO_ID>
JWT_SECRET=<RANDOM_SECRET>
```

## Instalación (local)
1. Instalar dependencias del backend:
```powershell
cd backend
npm install
```
2. Instalar dependencias del frontend:
```powershell
cd ..\frontend
npm install
```

## Ejecución en desarrollo
- Backend (dev):
```powershell
cd backend
node src/app.js
```
- Frontend (dev):
```powershell
cd frontend
npm run dev
```

## Comandos útiles
- Frontend: `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`.
- Backend: `node src/app.js`, `npm start`.

## Seguridad
- Nunca subir `FIREBASE_CREDENTIALS` ni `JWT_SECRET` a git.
- Mantener `backend/.env` fuera del control de versiones.

## Despliegue (resumen)
- Backend: desplegar en plataforma Node-compatible (Render, Heroku, Azure, DigitalOcean, VPS). Configurar variables de entorno en la plataforma.
- Frontend: construir con `npm run build` y servir en Netlify, Vercel o servidor estático.

## Testing y calidad
- Ejecutar `npm run lint` en `frontend`.
- Recomendado: añadir tests con Jest + React Testing Library (frontend) y Jest + supertest (backend).

## Contribución
- Mensajes de commit: seguir Conventional Commits (ej: `feat(...)`, `fix(...)`, `docs(...)`).
- Abrir PRs con descripción clara y pasos para probar.

## Archivos clave
- Frontend entry: `frontend/src/main.jsx`
- Backend entry: `backend/src/app.js`
- Variables de ejemplo: `backend/.env.example`