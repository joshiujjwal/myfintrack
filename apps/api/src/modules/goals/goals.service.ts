import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { CalculationsService } from '../calculations/calculations.service';
import { Decimal } from '@prisma/client/runtime/library';
import { GoalStatus, Prisma } from '@prisma/client';

@Injectable()
export class GoalsService {
  constructor(
    private prisma: PrismaService,
    private calculations: CalculationsService,
  ) {}

  async findAll(userId: string) {
    const goals = await this.prisma.goal.findMany({
      where: { userId },
      include: {
        milestones: { orderBy: { targetAmount: 'asc' } },
        contributions: {
          orderBy: { date: 'desc' },
          take: 5,
        },
      },
      orderBy: [{ priority: 'asc' }, { targetDate: 'asc' }],
    });

    return goals.map((goal) => this.enrichGoalWithProjection(goal));
  }

  async findById(userId: string, id: string) {
    const goal = await this.prisma.goal.findFirst({
      where: { id, userId },
      include: {
        milestones: { orderBy: { targetAmount: 'asc' } },
        contributions: { orderBy: { date: 'desc' } },
      },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    return this.enrichGoalWithProjection(goal);
  }

  async create(userId: string, dto: CreateGoalDto) {
    const goal = await this.prisma.goal.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description,
        type: dto.type,
        targetAmount: dto.targetAmount,
        currentAmount: dto.currentAmount || 0,
        startDate: dto.startDate || new Date(),
        targetDate: dto.targetDate,
        priority: dto.priority || 1,
        linkedAccountIds: dto.linkedAccountIds || [],
        monthlyContribution: dto.monthlyContribution,
        expectedReturn: dto.expectedReturn,
        inflationRate: dto.inflationRate,
        icon: dto.icon,
        color: dto.color,
        settings: dto.settings as Prisma.InputJsonValue,
      },
    });

    return this.enrichGoalWithProjection(goal);
  }

  async update(userId: string, id: string, dto: UpdateGoalDto) {
    const goal = await this.prisma.goal.findFirst({
      where: { id, userId },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    const { settings, ...rest } = dto;
    const updated = await this.prisma.goal.update({
      where: { id },
      data: {
        ...rest,
        ...(settings !== undefined && { settings: settings as Prisma.InputJsonValue }),
      },
      include: {
        milestones: { orderBy: { targetAmount: 'asc' } },
        contributions: { orderBy: { date: 'desc' }, take: 5 },
      },
    });

    return this.enrichGoalWithProjection(updated);
  }

  async delete(userId: string, id: string) {
    const goal = await this.prisma.goal.findFirst({
      where: { id, userId },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    await this.prisma.goal.delete({ where: { id } });
  }

  async addContribution(userId: string, goalId: string, amount: number, notes?: string) {
    const goal = await this.prisma.goal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    const [contribution] = await Promise.all([
      this.prisma.goalContribution.create({
        data: {
          goalId,
          amount,
          date: new Date(),
          notes,
        },
      }),
      this.prisma.goal.update({
        where: { id: goalId },
        data: {
          currentAmount: { increment: amount },
        },
      }),
    ]);

    // Check milestones
    await this.checkMilestones(goalId, goal.currentAmount.add(amount));

    return contribution;
  }

  async addMilestone(userId: string, goalId: string, name: string, targetAmount: number, targetDate?: Date) {
    const goal = await this.prisma.goal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    return this.prisma.goalMilestone.create({
      data: {
        goalId,
        name,
        targetAmount,
        targetDate,
      },
    });
  }

  private async checkMilestones(goalId: string, currentAmount: Decimal) {
    const milestones = await this.prisma.goalMilestone.findMany({
      where: {
        goalId,
        isCompleted: false,
        targetAmount: { lte: currentAmount },
      },
    });

    if (milestones.length > 0) {
      await this.prisma.goalMilestone.updateMany({
        where: {
          id: { in: milestones.map((m) => m.id) },
        },
        data: {
          isCompleted: true,
          completedAt: new Date(),
        },
      });
    }
  }

  private enrichGoalWithProjection(goal: any) {
    const currentAmount = Number(goal.currentAmount);
    const targetAmount = Number(goal.targetAmount);
    const monthlyContribution = Number(goal.monthlyContribution || 0);
    const expectedReturn = Number(goal.expectedReturn || 0);

    const now = new Date();
    const targetDate = new Date(goal.targetDate);
    const monthsRemaining = Math.max(
      0,
      (targetDate.getFullYear() - now.getFullYear()) * 12 +
        (targetDate.getMonth() - now.getMonth()),
    );

    // Calculate projected amount at target date
    const projectedAmount = this.calculations.calculateFutureValue(
      currentAmount,
      monthlyContribution,
      expectedReturn / 12,
      monthsRemaining,
    );

    // Calculate required monthly contribution
    const shortfall = targetAmount - currentAmount;
    const requiredMonthly = this.calculations.calculateRequiredPayment(
      shortfall,
      expectedReturn / 12,
      monthsRemaining,
    );

    // Determine status
    let status: GoalStatus = goal.status;
    const percentComplete = (currentAmount / targetAmount) * 100;

    if (currentAmount >= targetAmount) {
      status = 'completed';
    } else if (projectedAmount >= targetAmount * 0.95) {
      status = 'on_track';
    } else if (projectedAmount >= targetAmount * 0.75) {
      status = 'at_risk';
    } else {
      status = 'behind';
    }

    return {
      ...goal,
      projection: {
        projectedAmount,
        onTrack: projectedAmount >= targetAmount,
        shortfall: Math.max(0, targetAmount - projectedAmount),
        requiredMonthlyContribution: requiredMonthly,
        percentComplete,
        daysRemaining: Math.max(0, Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))),
        monthsRemaining,
      },
      status,
    };
  }
}
