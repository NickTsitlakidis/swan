import { Controller, Headers, Post } from "@nestjs/common";
import { TokenDto } from "../../security/token-dto";
import { ClientTokenIssuer } from "../../security/client-token-issuer";

@Controller("/client")
export class ClientController {
    constructor(private readonly _issuer: ClientTokenIssuer) {}

    @Post("login")
    login(@Headers("Authorization") authorization: string): Promise<TokenDto> {
        return this._issuer.issueWithCredentials(authorization);
    }
}
