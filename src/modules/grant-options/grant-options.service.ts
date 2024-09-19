import { Injectable } from '@nestjs/common';
import { OptionsStatus, StepStatus } from '../../consts';
import { StepDto, StepType } from './dto/update-status.dto';
import { sendEmail } from '@utilities/emailServices';
import { simulateAsync } from '@utilities/simulateAsync';

interface StepsMap
  extends Map<
    string,
    {
      step: StepDto;
      dependsOn: string[];
      dependencies: string[];
    }
  > {}

@Injectable()
export class GrantOptionsService {
  private async updateStatus(employeeId: string, status: OptionsStatus) {
    await simulateAsync(100);
    console.log(
      `Grant options updated, employeeId: ${employeeId}, status: ${status}`,
    );
    return true;
  }

  private StepLogic = {
    [StepType.EMAIL]: (step: StepDto) =>
      sendEmail(step.to, step.headline, step.text),
    [StepType.UPDATE]: (step: StepDto) =>
      this.updateStatus(step.employeeId, step.status),
  };

  private async runStepsInOrder(
    stepsToRun: string[],
    stepsMap: StepsMap,
    stepsStatuses: Record<string, string>,
  ) {
    const promises = stepsToRun.map(async (stepId) => {
      const curr = stepsMap.get(stepId);
      const didSucceed = await this.StepLogic[curr.step.type]?.(curr.step);

      stepsStatuses[stepId] = didSucceed
        ? StepStatus.COMPLETED
        : StepStatus.FAILED;

      const independentSteps = [];

      didSucceed &&
        curr.dependencies.forEach((dependencyId) => {
          const dependency = stepsMap.get(dependencyId);
          dependency.dependsOn = dependency.dependsOn.filter(
            (id) => id !== stepId,
          );
          !dependency.dependsOn.length && independentSteps.push(dependencyId);
        });

      independentSteps.length &&
        (await this.runStepsInOrder(independentSteps, stepsMap, stepsStatuses));
    });
    await Promise.all(promises);
  }

  async UpdateStatusBySteps(steps: StepDto[]) {
    const stepsMap: StepsMap = new Map();
    const stepsToRun: string[] = [];
    const stepsStatuses: Record<string, string> = {};

    steps.forEach((step) => {
      stepsMap.set(step.id, {
        step: step,
        dependsOn: step.dependsOn || [],
        dependencies: [],
      });

      stepsStatuses[step.id] = StepStatus.SKIPPED;
      !step.dependsOn.length && stepsToRun.push(step.id);
    });

    // fill the child -> parent dependencies
    steps.forEach((step) => {
      step.dependsOn?.forEach((dependencyId) => {
        stepsMap.get(dependencyId).dependencies.push(step.id);
      });
    });

    await this.runStepsInOrder(stepsToRun, stepsMap, stepsStatuses);
    return stepsStatuses;
  }
}
