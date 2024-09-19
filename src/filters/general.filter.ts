import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    console.error(request.method, request.url, 'Uncaught exception', exception);

    const status = HttpStatus.BAD_REQUEST;

    response.status(status).json({
      statusCode: status,
    });
  }
}
