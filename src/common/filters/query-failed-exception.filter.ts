import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Response, Request } from 'express';

@Catch(QueryFailedError)
export class QueryFailedExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = HttpStatus.CONFLICT;
    const message = 'Database constraint violation.';

    // Safely access the detail property
    let detail = '';
    if (
      exception.driverError &&
      typeof exception.driverError === 'object' &&
      'detail' in exception.driverError
    ) {
      const driverError = exception.driverError as { detail?: string };
      detail = driverError.detail || '';
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
      detail: detail,
    });
  }
}
