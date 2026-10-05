import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rating } from '../ratings/rating.entity';
import { Store } from '../stores/store.entity';
import { StoresModule } from '../stores/stores.module';
import { User } from '../users/user.entity';
import { UsersModule } from '../users/users.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Store, Rating]), UsersModule, StoresModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}