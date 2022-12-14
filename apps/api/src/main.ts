import { NestFactory, Reflector } from "@nestjs/core";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { ClassSerializerInterceptor, Logger, ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app/app.module";
import helmet from "helmet";
import { ErrorInterceptor } from "./app/rest/error-interceptor";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const globalPrefix = "api";
    app.setGlobalPrefix(globalPrefix);
    app.enableCors();
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
    app.useGlobalPipes(new ValidationPipe());
    app.use(
        helmet({
            crossOriginEmbedderPolicy: false,
            contentSecurityPolicy: {
                useDefaults: true,
                directives: {
                    defaultSrc: helmet.contentSecurityPolicy.dangerouslyDisableDefaultSrc,
                    "script-src": ["'self'", "kit.fontawesome.com"],
                    "img-src": null
                }
            }
        })
    );
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)), new ErrorInterceptor());

    const port = process.env.PORT || 3310;
    await app.listen(port, () => {
        Logger.log("Listening at http://localhost:" + port + "/" + globalPrefix);
    });
}

bootstrap();
