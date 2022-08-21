import { Injectable, UnauthorizedException } from "@nestjs/common";
import { isNil, split } from "lodash";
import { ClientRepository } from "./client-repository";
import { compare } from "bcrypt";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import * as moment from "moment";
import { TokenDto } from "@swan/dto";

@Injectable()
export class ClientTokenIssuer {
    constructor(private readonly _repository: ClientRepository, private readonly _signService: JwtService) {}

    async issueWithCredentials(encodedCredentials: string): Promise<TokenDto> {
        const decoded = new Buffer(encodedCredentials, "base64").toString("ascii");
        const isBase64 = Buffer.from(decoded).toString("base64") === encodedCredentials;
        if (!isBase64 || !decoded.includes(":")) {
            throw new UnauthorizedException("Invalid or missing credentials");
        }

        const [appId, appSecret] = split(decoded, ":");
        const found = await this._repository.findByApplicationId(appId);

        if (isNil(found)) {
            throw new UnauthorizedException("Invalid or missing credentials");
        }

        const matches = await compare(appSecret, found.applicationSecret);

        if (!matches) {
            throw new UnauthorizedException("Invalid or missing credentials");
        }

        const accessSignOptions: JwtSignOptions = {
            subject: found.applicationId,
            algorithm: "ES256",
            expiresIn: "120m"
        };

        const jwtAccessToken = this._signService.sign({}, accessSignOptions);

        return new TokenDto(jwtAccessToken, moment.utc().add(120, "minutes"));
    }
}
