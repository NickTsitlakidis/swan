import { NestFactory, Reflector } from "@nestjs/core";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { ClassSerializerInterceptor, Logger, ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app/app.module";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const globalPrefix = "api";
    app.setGlobalPrefix(globalPrefix);
    app.enableCors();
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
    app.useGlobalPipes(new ValidationPipe());
    //app.use(helmet());
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

    const options = new DocumentBuilder()
        .setTitle("NFT API")
        .setDescription("The nft API description")
        .setVersion("1.0")
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup("docs", app, document);

    const port = process.env.PORT || 3310;
    await app.listen(port, () => {
        Logger.log("Listening at http://localhost:" + port + "/" + globalPrefix);
    });
}

bootstrap();
