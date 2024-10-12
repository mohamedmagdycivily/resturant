import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, VersioningType } from '@nestjs/common'; // import built-in ValidationPipe
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableVersioning({  // Enable versioning
    type: VersioningType.URI,
    prefix: 'api/v', // prefix for versioning
  });
  app.useGlobalPipes(new ValidationPipe()); // enable ValidationPipe`
  app.enableCors();
  const options = new DocumentBuilder()
    .setTitle('resturant APIs')
    .setDescription('resturant APIs docs')
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('doc', app, document);

  const port = 3000;
  await app.listen(port);
  console.log(`listening on port ${port}`);
}

bootstrap();
