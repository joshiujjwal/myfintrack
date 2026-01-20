import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, includeHidden = false) {
    const where = includeHidden
      ? { userId }
      : { userId, isHidden: false };

    return this.prisma.account.findMany({
      where,
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });
  }

  async findById(userId: string, id: string) {
    const account = await this.prisma.account.findFirst({
      where: { id, userId },
      include: {
        balanceHistory: {
          orderBy: { date: 'desc' },
          take: 90, // Last 90 days
        },
      },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  async create(userId: string, dto: CreateAccountDto) {
    return this.prisma.account.create({
      data: {
        userId,
        name: dto.name,
        officialName: dto.officialName,
        type: dto.type,
        subtype: dto.subtype,
        mask: dto.mask,
        institutionName: dto.institutionName,
        currentBalance: dto.currentBalance,
        availableBalance: dto.availableBalance,
        creditLimit: dto.creditLimit,
        currency: dto.currency || 'USD',
        isManual: true,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateAccountDto) {
    const account = await this.prisma.account.findFirst({
      where: { id, userId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return this.prisma.account.update({
      where: { id },
      data: dto,
    });
  }

  async updateBalance(userId: string, id: string, balance: number) {
    const account = await this.prisma.account.findFirst({
      where: { id, userId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    // Update account balance
    const updated = await this.prisma.account.update({
      where: { id },
      data: {
        currentBalance: balance,
        lastSyncedAt: new Date(),
      },
    });

    // Record balance history
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.prisma.balanceHistory.upsert({
      where: {
        accountId_date: {
          accountId: id,
          date: today,
        },
      },
      update: { balance },
      create: {
        accountId: id,
        balance,
        date: today,
      },
    });

    return updated;
  }

  async delete(userId: string, id: string) {
    const account = await this.prisma.account.findFirst({
      where: { id, userId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    await this.prisma.account.delete({
      where: { id },
    });
  }

  async getBalanceHistory(userId: string, id: string, days = 90) {
    const account = await this.prisma.account.findFirst({
      where: { id, userId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.prisma.balanceHistory.findMany({
      where: {
        accountId: id,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });
  }

  async getSummary(userId: string) {
    const accounts = await this.prisma.account.findMany({
      where: { userId, isHidden: false },
    });

    let totalAssets = new Decimal(0);
    let totalLiabilities = new Decimal(0);

    const byType: Record<string, Decimal> = {};

    for (const account of accounts) {
      const balance = account.currentBalance;
      const type = account.type;

      byType[type] = (byType[type] || new Decimal(0)).add(balance);

      if (['checking', 'savings', 'investment'].includes(type)) {
        totalAssets = totalAssets.add(balance);
      } else if (['credit', 'loan', 'mortgage'].includes(type)) {
        totalLiabilities = totalLiabilities.add(balance.abs());
      } else {
        if (balance.gte(0)) {
          totalAssets = totalAssets.add(balance);
        } else {
          totalLiabilities = totalLiabilities.add(balance.abs());
        }
      }
    }

    return {
      totalAssets: totalAssets.toNumber(),
      totalLiabilities: totalLiabilities.toNumber(),
      netWorth: totalAssets.sub(totalLiabilities).toNumber(),
      accountCount: accounts.length,
      byType: Object.fromEntries(
        Object.entries(byType).map(([k, v]) => [k, v.toNumber()]),
      ),
    };
  }
}
