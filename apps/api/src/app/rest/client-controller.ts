import { Controller, Headers, Post } from "@nestjs/common";
import { ClientTokenIssuer } from "../security/client-token-issuer";
import { TokenDto } from "@swan/dto";
import { ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { EventStore } from "../infrastructure/event-store";

@Controller("/client")
export class ClientController {
    constructor(private readonly _issuer: ClientTokenIssuer, private readonly _eventStore: EventStore) {}

    @ApiOperation({ summary: "Login operation for the api client" })
    @Post("login")
    @ApiOkResponse({
        description: "The client token information",
        type: TokenDto
    })
    login(@Headers("Authorization") authorization: string): Promise<TokenDto> {
        return this._issuer.issueWithCredentials(authorization);
    }
}
