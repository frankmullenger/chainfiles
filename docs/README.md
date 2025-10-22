# ChainFiles Documentation

## 📁 Documentation Structure

### 🏗 Development
- **[Setup Guide](development/setup.md)** - Complete development environment setup
- **[Contributing](development/contributing.md)** - Guidelines for contributors _(coming soon)_

### 🏛 Architecture  
- **[Cross-App Navigation](architecture/cross-app-navigation-refactoring.md)** - Marketing ↔ Digital app navigation system
- **[x402 Protocol Integration](architecture/x402-integration.md)** - Payment protocol implementation _(coming soon)_
- **[File Storage Strategy](architecture/file-storage.md)** - Secure file handling approach _(coming soon)_

### 📱 Digital App
- **[Overview](digital/readme.md)** - Digital app overview and features
- **[Architecture](digital/architecture.md)** - Digital app technical architecture
- **[Environment Setup](digital/env-setup.md)** - Digital app specific environment configuration
- **[x402 Implementation](digital/x402-paywall-flow-explained.md)** - Payment middleware deep-dive
- **[Dual Middleware](digital/x402-dual-middleware.md)** - Advanced middleware patterns
- **[Custom Payment UI Testing](digital/custom-payment-ui-testing.md)** - Payment interface testing
- **[Paywall Testing](digital/x402-paywall-testing.md)** - End-to-end paywall testing

### 🎯 Marketing App
- **[Overview](marketing/README.md)** - Public-facing website documentation

### 🚀 Deployment
- **[Production Setup](deployment/production.md)** - Production deployment guide _(coming soon)_
- **[Environment Configuration](deployment/environments.md)** - Multi-environment setup _(coming soon)_```



---- **[Environment Configuration](deployment/environments.md)** - Multi-environment setup _(coming soon)_



## 🎯 Quick Links#### Turbopack Notes



- **[Main README](../README.md)** - Project overview and demo---- **Status**: Experimental in Next.js 15.3.3

- **[Development Setup](development/setup.md)** - Get started developing

- **[Digital App Docs](digital/)** - Core MVP application documentation- **Issue**: Runtime error with content-collections: `Cannot read properties of undefined (reading 'getAttribute')`

- **[Architecture Docs](architecture/)** - Cross-app technical implementation

## 🎯 Quick Links- **Workaround**: Use regular Webpack build (default `dev` scripts)

---

- **Future**: Re-enable when Turbopack + content-collections compatibility improves

*Documentation for ChainFiles - Blockchain-powered digital file sales*
- **[Main README](../README.md)** - Project overview and demo

- **[Development Setup](development/setup.md)** - Get started developing## Stack

- **[Architecture Docs](architecture/)** - Technical implementation details

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
