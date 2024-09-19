import { OptionsStatus } from '@src/consts';

export interface GrantOptions {
  employeeId: string;
  optionsNumber: number;
  vestingDate: Date;
  status: OptionsStatus;

  createdAt: Date;
  updatedAt: Date;
}
