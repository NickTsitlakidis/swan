import { Injectable } from "@nestjs/common";
import { TokenDto } from "./token-dto";

@Injectable()
export class ClientTokenIssuer {
    async issueWithCredentials(encodedCredentials: string): Promise<TokenDto> {
        return null;
    }
}
