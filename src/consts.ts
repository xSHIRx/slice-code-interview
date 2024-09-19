export enum OptionsStatus {
  UNVESTED = 1,
  VESTED = 2,
  BOUGHT = 3,
  EXPIRED = 4,
}

export enum StepStatus {
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped - due to dependencies',
}

export const UUID_VERSION = '4';
