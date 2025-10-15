# Digi Downloads

## Environments

### Dev

```bash
pnpm --filter marketing run dev     # http://localhost:3001/ (Webpack)
pnpm --filter dashboard run dev     # http://localhost:3000/ (Webpack)
pnpm --filter digital run dev     # http://localhost:3003/ (Webpack)

# Optional: Use Turbopack (experimental, faster but may have compatibility issues)
pnpm --filter marketing run dev:turbo  # http://localhost:3001/ (Turbopack)
pnpm --filter dashboard run dev:turbo  # http://localhost:3000/ (Turbopack)
```

#### Turbopack Notes
- **Status**: Experimental in Next.js 15.3.3
- **Issue**: Runtime error with content-collections: `Cannot read properties of undefined (reading 'getAttribute')`
- **Workaround**: Use regular Webpack build (default `dev` scripts)
- **Future**: Re-enable when Turbopack + content-collections compatibility improves

## Stack

### Postgres

```bash
postgres-17 --version
psql-17 postgres
\du
CREATE USER digidownloads_user WITH PASSWORD 'password_here';
CREATE DATABASE digidownloads OWNER digidownloads_user;
GRANT ALL PRIVILEGES ON DATABASE digidownloads TO digidownloads_user;
ALTER USER digidownloads_user WITH SUPERUSER;
\l
\q

# Format schema, adds missing relations
pnpm --filter @workspace/database exec -- prisma format

# Migrate schema
pnpm --filter @workspace/database exec prisma migrate dev
# OR
pnpm --filter @workspace/database run migrate -- dev

# Regen client
pnpm --filter @workspace/database run generate

# Reset database
pnpm --filter @workspace/database exec -- prisma migrate reset
# OR
pnpm --filter @workspace/database exec prisma migrate reset

```
