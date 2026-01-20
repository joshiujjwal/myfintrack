import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { GoalsModule } from './modules/goals/goals.module';
import { DebtsModule } from './modules/debts/debts.module';
import { BudgetsModule } from './modules/budgets/budgets.module';
import { ProjectionsModule } from './modules/projections/projections.module';
import { CalculationsModule } from './modules/calculations/calculations.module';
import { PlaidModule } from './modules/plaid/plaid.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    AccountsModule,
    TransactionsModule,
    GoalsModule,
    DebtsModule,
    BudgetsModule,
    ProjectionsModule,
    CalculationsModule,
    PlaidModule,
  ],
})
export class AppModule {}
