import { Controller, Get, Query } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { OwnerDashboardQueryDto } from './dto/owner-dashboard-query.dto';
import { StoresService } from './stores.service';

@Controller('owner')
@Roles(Role.STORE_OWNER)
export class OwnerController {
  constructor(private readonly stores: StoresService) {}

  @Get('dashboard')
  dashboard(@CurrentUser() user: AuthUser, @Query() q: OwnerDashboardQueryDto) {
    return this.stores.ownerDashboard(user.id, q);
  }
}