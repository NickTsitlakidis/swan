import { ExecutionContext } from "@nestjs/common";
import { isNil, startsWith } from "lodash";

export function hasBearerToken(context: ExecutionContext) : boolean {
    const request = context.switchToHttp().getRequest();

    return !isNil(request) &&
        !isNil(request.headers) &&
        !isNil(request.headers.authorization) &&
        startsWith(request.headers.authorization, "Bearer ");
}

export function extractBearerValue(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    return hasBearerToken(context) ? request.headers.authorization.replace("Bearer ", "") : undefined;
}


