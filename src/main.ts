import 'dotenv/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './presentation/app.module';
import compression from 'compression';
import bodyParser from 'body-parser';
import helmet from 'helmet';

(async () => {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.enableCors({
    origin: ['*'],
    credentials: true,
  });

  app.use(bodyParser.json({ limit: '1mb' }));
  app.use(
    bodyParser.urlencoded({
      extended: true,
      limit: '1mb',
    }),
  );

  app.use(compression());

  await app.listen(process.env.APP_PORT);
})();
