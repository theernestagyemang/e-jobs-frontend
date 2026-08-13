# e-JOBS — front end

Next.js (App Router) client for the e-JOBS hiring platform. Job seekers browse and
apply to postings, employers publish them and run the hiring pipeline, and
administrators oversee accounts and the audit trail.

Built against the Spring backend in the companion repository — all data comes from
that API; this app has no database of its own.

## Stack

- Next.js 16 (App Router, TypeScript), Tailwind CSS v4
- react-hook-form + zod for form validation, mirroring the backend's constraints
- js-cookie for the session; `middleware.ts` guards the role-scoped routes

## Running locally

```bash
npm install
cp .env.example .env.local   # then point it wherever your backend runs
npm run dev                  # http://localhost:3000
```

`NEXT_PUBLIC_API_URL` must include the `/api` prefix, e.g.
`http://localhost:8080/api` or `https://your-backend.onrender.com/api`.
Restart the dev server after changing it — `NEXT_PUBLIC_*` values are inlined at
build time, so a hot reload won't pick them up.

## Routes

| Route | Access |
|---|---|
| `/` | Public — landing page, reads the live board |
| `/jobs`, `/jobs/[id]` | Public — server-rendered, always fresh |
| `/login`, `/register` | Public |
| `/employer/**` | `EMPLOYER` — postings, drafts, applicant pipeline |
| `/seeker/**` | `JOB_SEEKER` — application tracking |
| `/admin/**` | `ADMIN` — stats, users, administrators, audit trail |

`middleware.ts` enforces the role prefixes. A visitor with no session (or an
unreadable cookie) is sent to `/login`; a signed-in user on someone else's route
is sent to their own landing page instead, so it never looks like a sign-out.
This is a UX guard — the backend re-checks every role server-side.

## Deploying to Render

Create a **Web Service** from this repository:

- **Build command:** `npm ci && npm run build`
- **Start command:** `npm start` (runs `next start -p ${PORT:-3000}`, binding the
  port Render assigns)
- **Environment variable:** `NEXT_PUBLIC_API_URL` — set it *before* the first
  build, since the value is compiled into the client bundle
- **Node version:** pinned to 22 via `.node-version`

Do not enable a static export. The job board and detail pages declare
`dynamic = "force-dynamic"` and fetch with `cache: "no-store"`, so they need a
running Node server.

### Backend CORS

The backend's allowed origins are configured in `SecurityConfig` and ship as
`http://localhost:3000` and `http://localhost:5173`. **Add this app's deployed
origin there before going live**, otherwise every browser-side call — login,
apply, and all dashboards — fails preflight, while the server-rendered public
pages keep working and mask the problem.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the build on `$PORT` (default 3000) |
| `npm run lint` | ESLint |
