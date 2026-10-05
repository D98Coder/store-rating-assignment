import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { validateEnv } from './common/config/env.validation';
import { EConfigKeys } from './common/enums';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { RatingsModule } from './ratings/ratings.module';
import { StoresModule } from './stores/stores.module';
import { UsersModule } from './users/users.module';
import { getConfig } from './util/common.util';

@Module({
  imports: [
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    ConfigModule.forRoot({
      isGlobal: true,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      validate: validateEnv,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        /* eslint-disable @typescript-eslint/no-unsafe-assignment */
        host: getConfig(EConfigKeys.DATABASE_HOST, { config }),
        port: Number(getConfig(EConfigKeys.DATABASE_PORT, { config })),
        username: getConfig(EConfigKeys.DATABASE_USER, { config }),
        password: getConfig(EConfigKeys.DATABASE_PASSWORD, { config }),
        database: getConfig(EConfigKeys.DATABASE_NAME, { config }),
        synchronize: getConfig(EConfigKeys.DB_SYNCHRONIZE, { config }) === 'true',
        autoLoadEntities: true,
      }),
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({
        secret: getConfig(EConfigKeys.JWT_SECRET),
        signOptions: {
          expiresIn: getConfig(EConfigKeys.JWT_EXPIRES_IN, { defaultValue : '1d'}) as JwtSignOptions['expiresIn'],
        },
      }),
    }),
    UsersModule,
    AuthModule,
    StoresModule,
    RatingsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },AppService],
})
export class AppModule {}
