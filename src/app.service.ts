import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  isRunning() {
    return { running: true };
  }
}
