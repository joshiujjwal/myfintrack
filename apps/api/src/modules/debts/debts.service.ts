import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';
import { CalculationsService } from '../calculations/calculations.service';

@Injectable()
export class DebtsService {
  constructor(
    private prisma: PrismaService,
    private calculations: CalculationsService,
  ) {}

  async findAll(userId: string, activeOnly = true) {
    return this.prisma.debt.findMany({
      where: {
        userId,
        ...(activeOnly && { isActive: true }),
      },
      include: {
        payments: {
          orderBy: { date: 'desc' },
          take: 5,
        },
      },
      orderBy: { interestRate: 'desc' },
    });
  }

  async findById(userId: string, id: string) {
    const debt = await this.prisma.debt.findFirst({
      where: { id, userId },
      include: {
        payments: { orderBy: { date: 'desc' } },
        linkedAccount: true,
      },
    });

    if (!debt) {
      throw new NotFoundException('Debt not found');
    }

    return debt;
  }

  async create(userId: string, dto: CreateDebtDto) {
    return this.prisma.debt.create({
      data: {
        userId,
        name: dto.name,
        type: dto.type,
        originalAmount: dto.originalAmount,
        currentBalance: dto.currentBalance,
        interestRate: dto.interestRate,
        minimumPayment: dto.minimumPayment,
        dueDay: dto.dueDay,
        startDate: dto.startDate || new Date(),
        lender: dto.lender,
        linkedAccountId: dto.linkedAccountId,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateDebtDto) {
    const debt = await this.prisma.debt.findFirst({
      where: { id, userId },
    });

    if (!debt) {
      throw new NotFoundException('Debt not found');
    }

    return this.prisma.debt.update({
      where: { id },
      data: dto,
    });
  }

  async delete(userId: string, id: string) {
    const debt = await this.prisma.debt.findFirst({
      where: { id, userId },
    });

    if (!debt) {
      throw new NotFoundException('Debt not found');
    }

    await this.prisma.debt.delete({ where: { id } });
  }

  async addPayment(
    userId: string,
    debtId: string,
    amount: number,
    date?: Date,
  ) {
    const debt = await this.prisma.debt.findFirst({
      where: { id: debtId, userId },
    });

    if (!debt) {
      throw new NotFoundException('Debt not found');
    }

    // Calculate principal and interest portions
    const monthlyRate = Number(debt.interestRate) / 12;
    const interestPaid = Number(debt.currentBalance) * monthlyRate;
    const principalPaid = Math.max(0, amount - interestPaid);

    const [payment] = await Promise.all([
      this.prisma.debtPayment.create({
        data: {
          debtId,
          amount,
          principalPaid,
          interestPaid,
          date: date || new Date(),
        },
      }),
      this.prisma.debt.update({
        where: { id: debtId },
        data: {
          currentBalance: { decrement: principalPaid },
        },
      }),
    ]);

    return payment;
  }

  async getPayoffPlan(userId: string, strategy: 'avalanche' | 'snowball', extraPayment = 0) {
    const debts = await this.prisma.debt.findMany({
      where: { userId, isActive: true },
    });

    if (debts.length === 0) {
      return { debts: [], timeline: [], totalMonths: 0, totalInterest: 0 };
    }

    // Sort debts based on strategy
    const sortedDebts = [...debts].sort((a, b) => {
      if (strategy === 'avalanche') {
        return Number(b.interestRate) - Number(a.interestRate);
      } else {
        return Number(a.currentBalance) - Number(b.currentBalance);
      }
    });

    // Calculate payoff timeline
    const result = this.calculations.calculateDebtPayoff(
      sortedDebts.map((d) => ({
        id: d.id,
        name: d.name,
        balance: Number(d.currentBalance),
        interestRate: Number(d.interestRate),
        minimumPayment: Number(d.minimumPayment),
      })),
      extraPayment,
    );

    return result;
  }

  async compareStrategies(userId: string, extraPayment = 0) {
    const [avalanche, snowball] = await Promise.all([
      this.getPayoffPlan(userId, 'avalanche', extraPayment),
      this.getPayoffPlan(userId, 'snowball', extraPayment),
    ]);

    return {
      avalanche,
      snowball,
      interestSaved: snowball.totalInterest - avalanche.totalInterest,
      timeSavedMonths: snowball.totalMonths - avalanche.totalMonths,
      recommendation: 'avalanche', // Avalanche always saves more interest
    };
  }
}
