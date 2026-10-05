import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EConfigKeys } from '../common/enums';
import { Role } from '../common/enums/role.enum';
import { getConfig } from '../util/common.util';
import { UsersService } from './users.service';

/** Creates the default System Admin (from .env) on first boot. Idempotent. */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly users: UsersService, private readonly config: ConfigService) {}

  async onApplicationBootstrap() {
    const email = getConfig(EConfigKeys.ADMIN_EMAIL)?.trim()?.toLowerCase();
    if (await this.users.findByEmail(email)) return;
    await this.users.create({
      name: getConfig(EConfigKeys.ADMIN_NAME),
      email,
      password:  getConfig(EConfigKeys.ADMIN_PASSWORD),
      address:  getConfig(EConfigKeys.ADMIN_ADDRESS),
      role: Role.SYSTEM_ADMIN,
    });
    this.logger.log(`Default System Admin created: ${email}`);
  }
}