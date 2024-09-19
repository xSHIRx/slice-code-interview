import { UpdateStatusDto } from './dto/update-status.dto';
import {
  Body,
  Controller,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { GrantOptionsService } from './grant-options.service';

@Controller('grants')
export class GrantOptionsController {
  constructor(private readonly grantOptionsService: GrantOptionsService) {}

  @Put('status')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateStatus(@Body() { steps }: UpdateStatusDto) {
    return await this.grantOptionsService.UpdateStatusBySteps(steps);
  }
}
