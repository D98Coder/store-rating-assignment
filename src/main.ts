import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { corsOptions } from './common/constants/app.constant';
import { EConfigKeys } from './common/enums';
import { getConfig } from './util/common.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
  const config = app.get<ConfigService>(ConfigService);

  //middleware
  app.enableCors(corsOptions);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  //start the app
  const port = getConfig(EConfigKeys.PORT, { config});
  await app.listen(port);
  new Logger('Bootstrap').log(`API running at http://localhost:${port}/api/v1`);
}
bootstrap();
