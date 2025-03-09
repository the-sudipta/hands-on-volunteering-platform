import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:7000', // Replace with your frontend's origin
    credentials: true, // Allow cookies and other credentials to be sent
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
