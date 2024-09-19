import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GrantOptionsModule } from './modules/grant-options/grant-options.module';

@Module({
  imports: [GrantOptionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
