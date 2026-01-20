import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PlaidService } from './plaid.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('plaid')
@Controller('plaid')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PlaidController {
  constructor(private plaidService: PlaidService) {}

  @Post('link-token')
  @ApiOperation({ summary: 'Create Plaid Link token' })
  async createLinkToken(@GetUser('sub') userId: string) {
    return this.plaidService.createLinkToken(userId);
  }

  @Post('exchange-token')
  @ApiOperation({ summary: 'Exchange public token for access token' })
  async exchangePublicToken(
    @GetUser('sub') userId: string,
    @Body('publicToken') publicToken: string,
    @Body('institutionId') institutionId?: string,
    @Body('institutionName') institutionName?: string,
  ) {
    return this.plaidService.exchangePublicToken(
      userId,
      publicToken,
      institutionId,
      institutionName,
    );
  }

  @Post('items/:itemId/sync')
  @ApiOperation({ summary: 'Sync transactions for a Plaid item' })
  async syncTransactions(
    @GetUser('sub') userId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.plaidService.syncTransactions(userId, itemId);
  }

  @Post('items/:itemId/refresh-balances')
  @ApiOperation({ summary: 'Refresh account balances' })
  async refreshBalances(
    @GetUser('sub') userId: string,
    @Param('itemId') itemId: string,
  ) {
    await this.plaidService.refreshBalances(userId, itemId);
    return { message: 'Balances refreshed' };
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Unlink a Plaid item' })
  async unlinkItem(
    @GetUser('sub') userId: string,
    @Param('itemId') itemId: string,
  ) {
    await this.plaidService.unlinkItem(userId, itemId);
    return { message: 'Item unlinked' };
  }
}
