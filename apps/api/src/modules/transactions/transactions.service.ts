import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionFilterDto } from './dto/transaction-filter.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, filter: TransactionFilterDto) {
    const where: Prisma.TransactionWhereInput = { userId };

    if (filter.accountIds?.length) {
      where.accountId = { in: filter.accountIds };
    }

    if (filter.categoryIds?.length) {
      where.categoryId = { in: filter.categoryIds };
    }

    if (filter.dateFrom || filter.dateTo) {
      where.date = {};
      if (filter.dateFrom) where.date.gte = filter.dateFrom;
      if (filter.dateTo) where.date.lte = filter.dateTo;
    }

    if (filter.amountMin !== undefined || filter.amountMax !== undefined) {
      where.amount = {};
      if (filter.amountMin !== undefined) where.amount.gte = filter.amountMin;
      if (filter.amountMax !== undefined) where.amount.lte = filter.amountMax;
    }

    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { merchantName: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    if (filter.isRecurring !== undefined) {
      where.isRecurring = filter.isRecurring;
    }

    if (filter.isPending !== undefined) {
      where.pending = filter.isPending;
    }

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: {
          account: { select: { name: true, type: true } },
          category: { select: { name: true, icon: true, color: true } },
        },
        orderBy: { date: 'desc' },
        skip: filter.offset || 0,
        take: filter.limit || 50,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      transactions,
      total,
      page: Math.floor((filter.offset || 0) / (filter.limit || 50)) + 1,
      pageSize: filter.limit || 50,
    };
  }

  async findById(userId: string, id: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
      include: {
        account: { select: { name: true, type: true } },
        category: { select: { name: true, icon: true, color: true } },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async create(userId: string, dto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: {
        userId,
        accountId: dto.accountId,
        amount: dto.amount,
        date: dto.date,
        name: dto.name,
        merchantName: dto.merchantName,
        categoryId: dto.categoryId,
        pending: dto.pending || false,
        type: dto.type || 'debit',
        tags: dto.tags || [],
        notes: dto.notes,
      },
      include: {
        account: { select: { name: true, type: true } },
        category: { select: { name: true, icon: true, color: true } },
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateTransactionDto) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return this.prisma.transaction.update({
      where: { id },
      data: dto,
      include: {
        account: { select: { name: true, type: true } },
        category: { select: { name: true, icon: true, color: true } },
      },
    });
  }

  async delete(userId: string, id: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    await this.prisma.transaction.delete({ where: { id } });
  }

  async getSpendingByCategory(userId: string, startDate: Date, endDate: Date) {
    const result = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
        amount: { gt: 0 }, // Only expenses
        isExcludedFromReports: false,
      },
      _sum: { amount: true },
      _count: true,
    });

    const categories = await this.prisma.category.findMany({
      where: {
        id: { in: result.map((r) => r.categoryId).filter(Boolean) as string[] },
      },
    });

    const categoryMap = new Map(categories.map((c) => [c.id, c]));
    const total = result.reduce(
      (acc, r) => acc.add(r._sum.amount || new Decimal(0)),
      new Decimal(0),
    );

    return result.map((r) => {
      const category = r.categoryId ? categoryMap.get(r.categoryId) : null;
      const amount = r._sum.amount || new Decimal(0);
      return {
        categoryId: r.categoryId,
        categoryName: category?.name || 'Uncategorized',
        icon: category?.icon,
        color: category?.color,
        amount: amount.toNumber(),
        percentage: total.gt(0) ? amount.div(total).mul(100).toNumber() : 0,
        transactionCount: r._count,
      };
    }).sort((a, b) => b.amount - a.amount);
  }

  async getSpendingTrend(userId: string, months = 6) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
        isExcludedFromReports: false,
      },
      select: {
        amount: true,
        date: true,
      },
    });

    // Group by month
    const monthlyData: Record<string, { income: Decimal; expenses: Decimal }> = {};

    for (const tx of transactions) {
      const monthKey = `${tx.date.getFullYear()}-${String(tx.date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: new Decimal(0), expenses: new Decimal(0) };
      }

      if (tx.amount.lt(0)) {
        monthlyData[monthKey].income = monthlyData[monthKey].income.add(tx.amount.abs());
      } else {
        monthlyData[monthKey].expenses = monthlyData[monthKey].expenses.add(tx.amount);
      }
    }

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, data]) => ({
        period,
        income: data.income.toNumber(),
        expenses: data.expenses.toNumber(),
        savings: data.income.sub(data.expenses).toNumber(),
      }));
  }
}
