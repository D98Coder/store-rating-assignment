import { Controller, Get, Query } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { ListStoresQueryDto } from './dto/list-stores-query.dto';
import { StoresService } from './stores.service';

@Controller('stores')
@Roles(Role.NORMAL_USER)
export class StoresController {
  constructor(private readonly stores: StoresService) {}

  @Get()
  findAll(@Query() q: ListStoresQueryDto, @CurrentUser() user: AuthUser) {
    return this.stores.findAll(q, { userId: user?.id, isAdmin: false });
  }
}