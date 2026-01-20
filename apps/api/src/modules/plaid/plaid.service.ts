import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  Products,
  CountryCode,
} from 'plaid';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PlaidService {
  private plaidClient: PlaidApi;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const configuration = new Configuration({
      basePath: this.getPlaidEnvironment(),
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': this.configService.get<string>('PLAID_CLIENT_ID'),
          'PLAID-SECRET': this.configService.get<string>('PLAID_SECRET'),
        },
      },
    });

    this.plaidClient = new PlaidApi(configuration);
  }

  private getPlaidEnvironment(): string {
    const env = this.configService.get<string>('PLAID_ENV', 'sandbox');
    switch (env) {
      case 'production':
        return PlaidEnvironments.production;
      case 'development':
        return PlaidEnvironments.development;
      default:
        return PlaidEnvironments.sandbox;
    }
  }

  async createLinkToken(userId: string): Promise<{ linkToken: string; expiration: string }> {
    try {
      const response = await this.plaidClient.linkTokenCreate({
        user: { client_user_id: userId },
        client_name: 'MyFinTrack',
        products: [Products.Transactions],
        country_codes: [CountryCode.Us],
        language: 'en',
      });

      return {
        linkToken: response.data.link_token,
        expiration: response.data.expiration,
      };
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to create link token: ${error.message}`,
      );
    }
  }

  async exchangePublicToken(
    userId: string,
    publicToken: string,
    institutionId?: string,
    institutionName?: string,
  ): Promise<{ itemId: string; accountCount: number }> {
    try {
      // Exchange public token for access token
      const exchangeResponse = await this.plaidClient.itemPublicTokenExchange({
        public_token: publicToken,
      });

      const accessToken = exchangeResponse.data.access_token;
      const itemId = exchangeResponse.data.item_id;

      // Store Plaid item
      const plaidItem = await this.prisma.plaidItem.create({
        data: {
          userId,
          accessToken, // In production, encrypt this
          itemId,
          institutionId,
          institutionName,
          syncStatus: 'pending',
        },
      });

      // Fetch accounts
      const accountsResponse = await this.plaidClient.accountsGet({
        access_token: accessToken,
      });

      // Create accounts in database
      for (const account of accountsResponse.data.accounts) {
        await this.prisma.account.create({
          data: {
            userId,
            plaidItemId: plaidItem.id,
            plaidAccountId: account.account_id,
            name: account.name,
            officialName: account.official_name || undefined,
            type: this.mapAccountType(account.type),
            subtype: account.subtype || undefined,
            mask: account.mask || undefined,
            institutionName,
            institutionId,
            currentBalance: account.balances.current || 0,
            availableBalance: account.balances.available || undefined,
            currency: account.balances.iso_currency_code || 'USD',
            isManual: false,
          },
        });
      }

      // Update Plaid item status
      await this.prisma.plaidItem.update({
        where: { id: plaidItem.id },
        data: { syncStatus: 'active', lastSyncedAt: new Date() },
      });

      return {
        itemId,
        accountCount: accountsResponse.data.accounts.length,
      };
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to exchange public token: ${error.message}`,
      );
    }
  }

  async syncTransactions(userId: string, plaidItemId: string): Promise<{ added: number; modified: number; removed: number }> {
    const plaidItem = await this.prisma.plaidItem.findFirst({
      where: { id: plaidItemId, userId },
    });

    if (!plaidItem) {
      throw new BadRequestException('Plaid item not found');
    }

    try {
      let added = 0;
      let modified = 0;
      let removed = 0;
      let cursor = plaidItem.cursor || undefined;
      let hasMore = true;

      while (hasMore) {
        const response = await this.plaidClient.transactionsSync({
          access_token: plaidItem.accessToken,
          cursor,
        });

        // Process added transactions
        for (const tx of response.data.added) {
          const account = await this.prisma.account.findFirst({
            where: { plaidAccountId: tx.account_id },
          });

          if (account) {
            await this.prisma.transaction.upsert({
              where: { plaidTransactionId: tx.transaction_id },
              update: {
                amount: tx.amount,
                date: new Date(tx.date),
                name: tx.name,
                merchantName: tx.merchant_name || undefined,
                pending: tx.pending,
                paymentChannel: tx.payment_channel,
              },
              create: {
                userId,
                accountId: account.id,
                plaidTransactionId: tx.transaction_id,
                amount: tx.amount,
                date: new Date(tx.date),
                name: tx.name,
                merchantName: tx.merchant_name || undefined,
                pending: tx.pending,
                type: tx.amount > 0 ? 'debit' : 'credit',
                paymentChannel: tx.payment_channel,
              },
            });
            added++;
          }
        }

        // Process modified transactions
        for (const tx of response.data.modified) {
          await this.prisma.transaction.updateMany({
            where: { plaidTransactionId: tx.transaction_id },
            data: {
              amount: tx.amount,
              date: new Date(tx.date),
              name: tx.name,
              merchantName: tx.merchant_name || undefined,
              pending: tx.pending,
            },
          });
          modified++;
        }

        // Process removed transactions
        for (const tx of response.data.removed) {
          await this.prisma.transaction.deleteMany({
            where: { plaidTransactionId: tx.transaction_id },
          });
          removed++;
        }

        hasMore = response.data.has_more;
        cursor = response.data.next_cursor;
      }

      // Update cursor and sync time
      await this.prisma.plaidItem.update({
        where: { id: plaidItemId },
        data: {
          cursor,
          lastSyncedAt: new Date(),
        },
      });

      return { added, modified, removed };
    } catch (error: any) {
      await this.prisma.plaidItem.update({
        where: { id: plaidItemId },
        data: {
          syncStatus: 'error',
          errorCode: error.code || 'UNKNOWN',
        },
      });
      throw new BadRequestException(
        `Failed to sync transactions: ${error.message}`,
      );
    }
  }

  async refreshBalances(userId: string, plaidItemId: string): Promise<void> {
    const plaidItem = await this.prisma.plaidItem.findFirst({
      where: { id: plaidItemId, userId },
    });

    if (!plaidItem) {
      throw new BadRequestException('Plaid item not found');
    }

    try {
      const response = await this.plaidClient.accountsGet({
        access_token: plaidItem.accessToken,
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const account of response.data.accounts) {
        const dbAccount = await this.prisma.account.findFirst({
          where: { plaidAccountId: account.account_id },
        });

        if (dbAccount) {
          await this.prisma.account.update({
            where: { id: dbAccount.id },
            data: {
              currentBalance: account.balances.current || 0,
              availableBalance: account.balances.available || undefined,
              lastSyncedAt: new Date(),
            },
          });

          // Record balance history
          await this.prisma.balanceHistory.upsert({
            where: {
              accountId_date: {
                accountId: dbAccount.id,
                date: today,
              },
            },
            update: { balance: account.balances.current || 0 },
            create: {
              accountId: dbAccount.id,
              balance: account.balances.current || 0,
              date: today,
            },
          });
        }
      }

      await this.prisma.plaidItem.update({
        where: { id: plaidItemId },
        data: { lastSyncedAt: new Date() },
      });
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to refresh balances: ${error.message}`,
      );
    }
  }

  async unlinkItem(userId: string, plaidItemId: string): Promise<void> {
    const plaidItem = await this.prisma.plaidItem.findFirst({
      where: { id: plaidItemId, userId },
    });

    if (!plaidItem) {
      throw new BadRequestException('Plaid item not found');
    }

    try {
      // Remove from Plaid
      await this.plaidClient.itemRemove({
        access_token: plaidItem.accessToken,
      });
    } catch {
      // Continue even if Plaid removal fails
    }

    // Delete from database (cascades to accounts)
    await this.prisma.plaidItem.delete({
      where: { id: plaidItemId },
    });
  }

  private mapAccountType(plaidType: string): any {
    const mapping: Record<string, string> = {
      depository: 'checking',
      credit: 'credit',
      loan: 'loan',
      investment: 'investment',
      mortgage: 'mortgage',
    };
    return mapping[plaidType] || 'other';
  }
}
