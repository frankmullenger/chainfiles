# ChainFiles Documentation

## Stack

### Ports

- chainfiles.app 3006
- dashboard.chainfiles.app 3007
- store.chainfiles.app 3008

### Postgres

---

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

# Open Prisma Studio (Database GUI)
pnpm --filter @workspace/database run studio
# Opens on http://localhost:3003 (no auto-browser, navigate manually)

```
