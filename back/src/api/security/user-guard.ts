import { Injectable } from "@nestjs/common";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";

@Injectable()
export class UserGuard {
    constructor(private _signingService: JwtService) {
        const accessSignOptions: JwtSignOptions = {
            subject: "123",
            algorithm: "ES256",
            expiresIn: "10m"
        };

        const jwtAccessToken = this._signingService.sign(
            { tokenType: "client" },
            accessSignOptions
        );
        console.log(jwtAccessToken);
    }
}
