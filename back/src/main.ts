import { NestFactory, Reflector } from "@nestjs/core";
import { AppModule } from "./app.module";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { ClassSerializerInterceptor, Logger } from "@nestjs/common";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const globalPrefix = "api";
    app.setGlobalPrefix(globalPrefix);
    app.enableCors();
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
    //app.use(helmet());
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
    const port = process.env.PORT || 3310;
    await app.listen(port, () => {
        Logger.log("Listening at http://localhost:" + port + "/" + globalPrefix);
    });
}

bootstrap();
