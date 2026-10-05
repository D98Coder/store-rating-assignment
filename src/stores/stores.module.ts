import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rating } from '../ratings/rating.entity';
import { UsersModule } from '../users/users.module';
import { OwnerController } from './owner.controller';
import { Store } from './store.entity';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';

@Module({
  imports: [TypeOrmModule.forFeature([Store, Rating]), UsersModule],
  controllers: [StoresController, OwnerController],
  providers: [StoresService],
  exports: [StoresService],
})
export class StoresModule {}