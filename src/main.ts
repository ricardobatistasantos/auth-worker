import { NestFactory } from '@nestjs/core';
import { AppModule } from './presentation/app.module';

(async () => {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
})()
