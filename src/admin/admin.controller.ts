import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CreateStoreDto } from '../stores/dto/create-store.dto';
import { ListStoresQueryDto } from '../stores/dto/list-stores-query.dto';
import { StoresService } from '../stores/stores.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ListUsersQueryDto } from '../users/dto/list-users-query.dto';
import { UsersService } from '../users/users.service';
import { AdminService } from './admin.service';

@Controller('admin')
@Roles(Role.SYSTEM_ADMIN)
export class AdminController {
  constructor(
    private readonly admin: AdminService,
    private readonly users: UsersService,
    private readonly stores: StoresService,
  ) {}

  @Get('dashboard')
  dashboard() {
    return this.admin.dashboard();
  }

  @Post('users')
  createUser(@Body() dto: CreateUserDto) {
    return this.users.create(dto);
  }

  @Get('users')
  listUsers(@Query() q: ListUsersQueryDto) {
    return this.users.findAll(q);
  }

  @Get('users/:id')
  userDetails(@Param('id', ParseUUIDPipe) id: string) {
    return this.admin.userDetails(id);
  }

  @Post('stores')
  createStore(@Body() dto: CreateStoreDto) {
    return this.stores.create(dto);
  }

  @Get('stores')
  listStores(@Query() q: ListStoresQueryDto) {
    return this.stores.findAll(q, { isAdmin: true });
  }
}