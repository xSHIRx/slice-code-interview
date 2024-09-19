import { OptionsStatus, UUID_VERSION } from '@src/consts';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from '@nestjs/class-validator';
import { Transform, Type } from 'class-transformer';

export enum StepType {
  EMAIL = 1,
  UPDATE = 2,
}

export class StepDto {
  @IsEnum(StepType)
  type: StepType;

  @IsString()
  @IsNotEmpty()
  id: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => value ?? [])
  dependsOn?: string[] = [];

  // email
  @ValidateIf((obj) => obj.type === StepType.EMAIL)
  @IsArray()
  @ArrayNotEmpty()
  @IsEmail({}, { each: true })
  to?: string[];

  @ValidateIf((obj) => obj.type === StepType.EMAIL)
  @IsString()
  @IsNotEmpty()
  text?: string;

  @ValidateIf((obj) => obj.type === StepType.EMAIL)
  @IsString()
  @IsNotEmpty()
  headline?: string;

  // update
  @ValidateIf((obj) => obj.type === StepType.UPDATE)
  @IsUUID(UUID_VERSION)
  employeeId?: string;

  @ValidateIf((obj) => obj.type === StepType.UPDATE)
  @IsEnum(OptionsStatus)
  status?: OptionsStatus;
}

export class UpdateStatusDto {
  @ValidateNested({ each: true })
  @Type(() => StepDto)
  @IsArray()
  @ArrayNotEmpty()
  steps: StepDto[];
}
