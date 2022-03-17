import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RequestUserId = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.userId;

        return data ? user && user[data] : user;
    },
);
