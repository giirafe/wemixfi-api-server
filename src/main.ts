import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Handling BigInt value to string
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
