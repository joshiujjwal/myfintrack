# myfintrack — TODO

**Type:** Personal Finance Dashboard (Full-Stack Web App)  
**Stack:** NestJS, Next.js 14, PostgreSQL, Redis, Prisma, Plaid API, Turbo monorepo  
**Status:** ~60% complete (scaffolded; missing tests, CI, and full implementations)

---

## Actions To Take

- [ ] **Add comprehensive test suite** — Write Jest/NestJS unit tests for all API modules (auth, accounts, transactions, goals, debts, budgets, projections); target 70%+ coverage starting with auth and business logic
- [ ] **Set up CI/CD pipeline** — Create GitHub Actions workflows for linting, type-checking, building, and running tests on PR/push; add automated deployment to staging
- [ ] **Complete authentication and authorization module** — Finish JWT auth with refresh tokens, role-based access control, and email verification; ensure guards are applied to all protected routes
- [ ] **Implement the Plaid integration module** — Build account linking flow, real-time transaction syncing, and proper error/webhook handling for the Plaid API
- [ ] **Add LICENSE and improve README** — Choose a license (MIT recommended); add sections for Project Structure, API Guide, Database Migrations, and Testing Guide
