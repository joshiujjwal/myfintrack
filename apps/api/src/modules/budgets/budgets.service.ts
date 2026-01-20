import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, activeOnly = true) {
    return this.prisma.budget.findMany({
      where: {
        userId,
        ...(activeOnly && { isActive: true }),
      },
      include: {
        items: {
          include: {
            category: { select: { name: true, icon: true, color: true } },
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async findById(userId: string, id: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, userId },
      include: {
        items: {
          include: {
            category: { select: { name: true, icon: true, color: true } },
          },
        },
      },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    return budget;
  }

  async getCurrentBudget(userId: string) {
    const now = new Date();
    return this.prisma.budget.findFirst({
      where: {
        userId,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        items: {
          include: {
            category: { select: { name: true, icon: true, color: true } },
          },
        },
      },
    });
  }

  async create(userId: string, dto: CreateBudgetDto) {
    const totalBudgeted = dto.items.reduce((sum, item) => sum + item.budgetedAmount, 0);

    return this.prisma.budget.create({
      data: {
        userId,
        name: dto.name,
        startDate: dto.startDate,
        endDate: dto.endDate,
        period: dto.period,
        totalBudgeted,
        items: {
          create: dto.items.map((item) => ({
            categoryId: item.categoryId,
            budgetedAmount: item.budgetedAmount,
            rollover: item.rollover || false,
          })),
        },
      },
      include: {
        items: {
          include: {
            category: { select: { name: true, icon: true, color: true } },
          },
        },
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateBudgetDto) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    // Update budget and items
    if (dto.items) {
      // Delete existing items and recreate
      await this.prisma.budgetItem.deleteMany({ where: { budgetId: id } });

      const totalBudgeted = dto.items.reduce((sum, item) => sum + item.budgetedAmount, 0);

      return this.prisma.budget.update({
        where: { id },
        data: {
          name: dto.name,
          startDate: dto.startDate,
          endDate: dto.endDate,
          period: dto.period,
          totalBudgeted,
          isActive: dto.isActive,
          items: {
            create: dto.items.map((item) => ({
              categoryId: item.categoryId,
              budgetedAmount: item.budgetedAmount,
              rollover: item.rollover || false,
            })),
          },
        },
        include: {
          items: {
            include: {
              category: { select: { name: true, icon: true, color: true } },
            },
          },
        },
      });
    }

    return this.prisma.budget.update({
      where: { id },
      data: {
        name: dto.name,
        isActive: dto.isActive,
      },
      include: {
        items: {
          include: {
            category: { select: { name: true, icon: true, color: true } },
          },
        },
      },
    });
  }

  async delete(userId: string, id: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    await this.prisma.budget.delete({ where: { id } });
  }

  async getBudgetSummary(userId: string, budgetId?: string) {
    let budget: any;

    if (budgetId) {
      budget = await this.findById(userId, budgetId);
    } else {
      budget = await this.getCurrentBudget(userId);
    }

    if (!budget) {
      return null;
    }

    // Get actual spending for budget period
    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: budget.startDate, lte: budget.endDate },
        amount: { gt: 0 }, // Expenses only
        isExcludedFromBudget: false,
      },
      select: {
        amount: true,
        categoryId: true,
      },
    });

    // Group spending by category
    const spendingByCategory = new Map<string, Decimal>();
    for (const tx of transactions) {
      const categoryId = tx.categoryId || 'uncategorized';
      const current = spendingByCategory.get(categoryId) || new Decimal(0);
      spendingByCategory.set(categoryId, current.add(tx.amount));
    }

    // Calculate summary for each budget item
    const items = budget.items.map((item: any) => {
      const spent = spendingByCategory.get(item.categoryId) || new Decimal(0);
      const budgeted = new Decimal(item.budgetedAmount);
      const remaining = budgeted.sub(spent);
      const percentUsed = budgeted.gt(0) ? spent.div(budgeted).mul(100).toNumber() : 0;

      let status: 'under' | 'near' | 'over' = 'under';
      if (percentUsed >= 100) status = 'over';
      else if (percentUsed >= 80) status = 'near';

      return {
        categoryId: item.categoryId,
        categoryName: item.category.name,
        icon: item.category.icon,
        color: item.category.color,
        budgeted: budgeted.toNumber(),
        spent: spent.toNumber(),
        remaining: remaining.toNumber(),
        percentUsed,
        status,
      };
    });

    const totalBudgeted = Number(budget.totalBudgeted);
    const totalSpent = items.reduce((sum: number, item: any) => sum + item.spent, 0);

    return {
      budgetId: budget.id,
      name: budget.name,
      period: `${budget.startDate.toISOString().slice(0, 10)} - ${budget.endDate.toISOString().slice(0, 10)}`,
      totalBudgeted,
      totalSpent,
      totalRemaining: totalBudgeted - totalSpent,
      percentUsed: totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0,
      items,
    };
  }
}
