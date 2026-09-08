# Consulta de Riesgo Financiero — Desafío Técnico

MVP de una API REST segura + SPA para consultar el **score crediticio** de un RUT,
con autenticación **JWT** y autorización **basada en roles** (`admin` / `user`).

- **Backend:** Node.js + TypeScript + Express, JWT (`jsonwebtoken`), validación con `zod`.
- **Frontend:** React + TypeScript + Vite.

```
prontopaga/
├── backend/    API REST (puerto 3000)
└── frontend/   SPA React (puerto 5173)
```

---

## Requisitos

- Node.js ≥ 18 (probado con Node 22/25)
- npm ≥ 9

---

## Cómo ejecutar en local

Son dos procesos. Abre **dos terminales**.

### 1. Backend

```bash
cd backend
cp .env.example .env      # opcional: funciona con valores por defecto
npm install
npm run dev               # http://localhost:3000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env      # opcional
npm install
npm run dev               # http://localhost:5173
```

Abre <http://localhost:5173> y usa una de las credenciales de prueba.

### Tests del backend

```bash
cd backend
npm test
```

14 tests con Vitest + Supertest cubren login, expiración/firma de JWT,
autorización por rol y el determinismo del score.

---

## Credenciales mock

| Usuario | Contraseña | Rol   | RUT en el token | Puede consultar        |
|---------|------------|-------|-----------------|------------------------|
| `admin` | `admin123` | admin | — (sin RUT)     | Cualquier RUT          |
| `user`  | `user123`  | user  | `12.345.678-9`  | Solo `12.345.678-9`    |
| `ana`   | `ana123`   | user  | `9.876.543-3`   | Solo `9.876.543-3`     |

---

## API

### `POST /login`

Autenticación mock (sin base de datos).

**Request**

```json
{ "username": "user", "password": "user123" }
```

**Response `200`**

```json
{
  "token": "<jwt>",
  "user": { "id": "2", "username": "user", "role": "user", "rut": "12.345.678-9" }
}
```

El JWT lleva en su payload:

| Campo  | Descripción                              |
|--------|------------------------------------------|
| `sub`  | ID del usuario                           |
| `role` | `admin` o `user`                         |
| `rut`  | RUT del usuario — **solo si es `user`**   |
| `exp`  | Expiración (`JWT_EXPIRES_IN`, def. `1h`) |

Errores: `400` payload inválido · `401` credenciales inválidas.

### `GET /score/:rut`

Devuelve el score financiero de un RUT. **Requiere** `Authorization: Bearer <token>`.

```bash
curl http://localhost:3000/score/12.345.678-9 \
  -H "Authorization: Bearer <token>"
```

**Response `200`**

```json
{
  "rut": "12.345.678-9",
  "score": 93,
  "fecha": "2025-06-27T14:35:00Z"
}
```

- **Score determinista:** hash FNV-1a del RUT normalizado → entero en `[0, 100]`.
  El mismo RUT siempre da el mismo score; RUTs distintos varían.
- Acepta el RUT con o sin puntos/guión; la respuesta lo devuelve normalizado.

Errores: `400` formato de RUT inválido · `401` token ausente/inválido/expirado ·
`403` un `user` intenta consultar un RUT que no es el suyo.

---

## Seguridad (middlewares)

| Middleware           | Responsabilidad                                                        |
|----------------------|-----------------------------------------------------------------------|
| `authenticate`       | Valida **firma** y **expiración** del JWT; adjunta el payload a `req`. |
| `authorizeRutAccess` | `admin` → cualquier RUT · `user` → solo el RUT de su token.            |
| `errorHandler`       | Respuestas de error consistentes (`{ "error": "..." }`).              |

---

## Decisiones de diseño

- **`app.ts` separado de `index.ts`** para poder testear con Supertest sin abrir un puerto.
- **Score como función pura** (`utils/score.ts`): sin estado, sin fecha, sin aleatoriedad → determinista y testeable.
- **No se fuerza el dígito verificador del RUT.** El enunciado usa `12.345.678-9` como
  ejemplo y su DV real es `5`; validar módulo-11 rompería el propio ejemplo. Se valida
  solo el formato. El validador módulo-11 queda implementado en `utils/rut.ts` (`isValidDv`)
  por si se quiere activar.
- **Frontend:** el token se guarda en `localStorage` para persistir la sesión; el
  `AuthContext` centraliza login/logout. Para un `user`, el campo RUT viene precargado
  y bloqueado (solo puede consultar el suyo); si aún así el backend respondiera `403`,
  se muestra una notificación clara.
- **Manejo de errores en la UI:** un único componente `Notification` (banner superior,
  autocierre a 5s) muestra fallos de autenticación y de autorización con el mensaje del backend.

---

## Variables de entorno

### backend/.env

| Variable         | Default                             | Descripción                       |
|------------------|-------------------------------------|-----------------------------------|
| `PORT`           | `3000`                              | Puerto de la API                  |
| `JWT_SECRET`     | `super-secreto-solo-para-desarrollo`| Secreto de firma del JWT          |
| `JWT_EXPIRES_IN` | `1h`                                | Vigencia del token                |
| `CORS_ORIGIN`    | `http://localhost:5173`             | Origen permitido para CORS        |

### frontend/.env

| Variable       | Default                 | Descripción       |
|----------------|-------------------------|-------------------|
| `VITE_API_URL` | `http://localhost:3000` | URL base de la API |

---

## Uso de herramientas de IA

Usé **Claude Code** como pair programmer: genera el primer borrador, yo dirijo,
reviso, refactorizo y tomo las decisiones de arquitectura y alcance.

### Generado con IA (borrador inicial, luego revisado por mí)
- Scaffolding del monorepo (`package.json`, `tsconfig`, estructura de carpetas).
- Primera versión de middlewares, rutas, hash de score y utilidades de RUT.
- Batería de tests y componentes base de React.

### Mis decisiones y cambios
- **Arquitectura:** separar `app.ts` de `index.ts` para testear sin abrir puerto;
  mover `ApiError` de `types.ts` a `api/errors.ts` (los tipos son solo DTOs).
- **Alcance:** no forzar el dígito verificador del RUT porque el ejemplo del
  enunciado (`12.345.678-9`) tiene DV inválido; dejar `isValidDv` disponible.
- **Frontend:** rediseño de estilos (toggle de contraseña, badges de riesgo,
  `focus-visible`, `prefers-reduced-motion`), accesibilidad del `Notification`
  (`role` según tipo), metadatos del `index.html`.
- **Revisión:** orden de middlewares y códigos HTTP (401 vs 403), limpieza de
  comentarios redundantes.

### Sin IA
- Pruebas end-to-end manuales en el navegador.
- `npm run typecheck`, `npm test`, `npm run build` en ambos paquetes.
- Historia de commits granular.

