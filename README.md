# MyFinTrack

A Bloomberg-style personal finance terminal with CFP (Certified Financial Planner) best practices. Track goals, analyze spending, manage debt, and build wealth with professional-grade financial tools.

## Features

### Core Features
- **Dashboard**: Bloomberg-inspired terminal interface with customizable widgets
- **Account Management**: Plaid integration for automatic bank syncing + manual account entry
- **Transaction Tracking**: Smart categorization, recurring detection, spending analytics
- **Goal Setting**: SMART goals framework with milestones and progress tracking
- **Debt Management**: Avalanche vs Snowball payoff strategies with visualization
- **Budget Planning**: Period-based budgets with real-time vs actual tracking
- **Financial Projections**: Time Value of Money, compound interest, Monte Carlo simulations
- **Financial Health Score**: CFP-based ratios (emergency fund, debt-to-income, savings rate)

### CFP Best Practices
- Emergency Fund: 3-6 months expenses
- Debt Payoff: Prioritize high-interest debt
- Savings Rate: Target 10-20%
- Housing Ratio: Keep under 28%
- Debt-to-Income: Keep under 36%
- Safe Withdrawal Rate: 4% for retirement

## Tech Stack

### Backend
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: NestJS (modular, enterprise-grade)
- **Database**: PostgreSQL 15+ (ACID compliance)
- **ORM**: Prisma (type-safe queries, migrations)
- **Cache/Queue**: Redis + BullMQ

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **UI**: React 18+, TypeScript, Tailwind CSS, shadcn/ui
- **State**: Zustand + TanStack Query
- **Charts**: Recharts + D3.js

### External APIs
- **Plaid**: Bank/investment account linking
- **Alpha Vantage**: Market data (optional)

## Getting Started

### Prerequisites
- Node.js 20+
- Docker and Docker Compose
- npm or yarn

### Installation

1. **Clone and install dependencies**
```bash
cd myfintrack
npm install
```

2. **Start the database services**
```bash
docker-compose up -d
```

3. **Set up environment variables**

Copy `.env.example` to `.env` and update values:
```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT access tokens
- `JWT_REFRESH_SECRET`: Secret for refresh tokens
- `PLAID_CLIENT_ID`: From Plaid dashboard (optional for development)
- `PLAID_SECRET`: From Plaid dashboard (optional for development)

4. **Run database migrations**
```bash
npm run db:push
```

5. **Start the development servers**
```bash
npm run dev
```

This starts:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Docs: http://localhost:3001/api/docs

### Project Structure

```
myfintrack/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/            # App Router pages
│   │   │   ├── components/     # UI components
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── lib/            # Utilities
│   │   │   └── store/          # Zustand stores
│   │   └── package.json
│   │
│   └── api/                    # NestJS backend
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/       # Authentication
│       │   │   ├── users/      # User management
│       │   │   ├── accounts/   # Account CRUD
│       │   │   ├── transactions/
│       │   │   ├── goals/      # Goal tracking
│       │   │   ├── debts/      # Debt management
│       │   │   ├── budgets/    # Budget tracking
│       │   │   ├── projections/# Financial projections
│       │   │   ├── calculations/ # TVM, Monte Carlo
│       │   │   └── plaid/      # Plaid integration
│       │   └── prisma/         # Database service
│       └── package.json
│
├── packages/
│   └── shared/                 # Shared types, utilities
│
├── prisma/
│   └── schema.prisma           # Database schema
│
└── docker-compose.yml          # PostgreSQL, Redis
```

## API Endpoints

### Authentication
- `POST /auth/register` - Create new account
- `POST /auth/login` - Login and get tokens
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Invalidate tokens

### Accounts
- `GET /accounts` - List all accounts
- `GET /accounts/summary` - Get account summary
- `POST /accounts` - Create manual account
- `PATCH /accounts/:id` - Update account
- `DELETE /accounts/:id` - Delete account

### Transactions
- `GET /transactions` - List with filters
- `GET /transactions/spending-by-category` - Category breakdown
- `GET /transactions/spending-trend` - Monthly trends
- `POST /transactions` - Create transaction
- `PATCH /transactions/:id` - Update transaction

### Goals
- `GET /goals` - List all goals
- `POST /goals` - Create goal
- `POST /goals/:id/contributions` - Add contribution
- `POST /goals/:id/milestones` - Add milestone

### Debts
- `GET /debts` - List all debts
- `GET /debts/payoff-plan` - Get payoff plan
- `GET /debts/compare-strategies` - Compare avalanche vs snowball
- `POST /debts/:id/payments` - Add payment

### Projections
- `GET /projections/net-worth` - Net worth projection
- `POST /projections/retirement` - Retirement projection
- `GET /projections/financial-health` - Health score

### Plaid Integration
- `POST /plaid/link-token` - Get Plaid Link token
- `POST /plaid/exchange-token` - Exchange public token
- `POST /plaid/items/:id/sync` - Sync transactions

## Development

### Database Commands
```bash
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
```

### Docker Commands
```bash
npm run docker:up    # Start services
npm run docker:down  # Stop services
```

### Building for Production
```bash
npm run build
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| DATABASE_URL | PostgreSQL connection string | Yes |
| JWT_SECRET | Access token secret | Yes |
| JWT_REFRESH_SECRET | Refresh token secret | Yes |
| JWT_EXPIRES_IN | Access token expiry (default: 15m) | No |
| JWT_REFRESH_EXPIRES_IN | Refresh token expiry (default: 7d) | No |
| PLAID_CLIENT_ID | Plaid API client ID | For Plaid |
| PLAID_SECRET | Plaid API secret | For Plaid |
| PLAID_ENV | sandbox/development/production | No |
| FRONTEND_URL | Frontend URL for CORS | Yes |
| REDIS_URL | Redis connection string | Yes |

## License

MIT
