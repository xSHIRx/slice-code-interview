import { Module } from '@nestjs/common';
import { GrantOptionsService } from './grant-options.service';
import { GrantOptionsController } from './grant-options.controller';

@Module({
  controllers: [GrantOptionsController],
  providers: [GrantOptionsService],
})
export class GrantOptionsModule {}
