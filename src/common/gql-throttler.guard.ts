import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard, ThrottlerLimitDetail } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { GraphQLError } from 'graphql';

/**
 * ThrottlerGuard resolves req/res from the HTTP context by default;
 * for GraphQL they live inside the Apollo context instead.
 */
@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  protected getRequestResponse(context: ExecutionContext): { req: Request; res: Response } {
    if (context.getType<GqlContextType>() === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      return gqlCtx.getContext<{ req: Request; res: Response }>();
    }
    const http = context.switchToHttp();
    return { req: http.getRequest<Request>(), res: http.getResponse<Response>() };
  }

  /**
   * The default ThrottlerException surfaces in GraphQL as a masked
   * INTERNAL_SERVER_ERROR (guard-phase errors carry no HTTP status into
   * Apollo). Throw a proper GraphQLError so clients get a usable code.
   */
  protected async throwThrottlingException(
    context: ExecutionContext,
    detail: ThrottlerLimitDetail,
  ): Promise<void> {
    if (context.getType<GqlContextType>() === 'graphql') {
      throw new GraphQLError('Too many requests, please slow down.', {
        extensions: {
          code: 'RATE_LIMITED',
          retryAfterSeconds: Math.max(1, Math.ceil(detail.timeToExpire)),
        },
      });
    }
    return super.throwThrottlingException(context, detail);
  }
}
