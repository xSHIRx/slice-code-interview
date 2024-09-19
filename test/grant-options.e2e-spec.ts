import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { GrantOptionsModule } from '@src/modules/grant-options/grant-options.module';
import { GrantOptionsService } from '@src/modules/grant-options/grant-options.service';
import {
  StepType,
  UpdateStatusDto,
} from '@src/modules/grant-options/dto/update-status.dto';
import { OptionsStatus, StepStatus } from '@src/consts';

describe('GrantOptions API', () => {
  let app: INestApplication;
  let grantOptionsService: GrantOptionsService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [GrantOptionsModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    grantOptionsService =
      moduleFixture.get<GrantOptionsService>(GrantOptionsService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('PUT /grants/status', () => {
    it('updates status single-step', async () => {
      const updateStatus: UpdateStatusDto = {
        steps: [
          {
            type: StepType.UPDATE,
            id: '1',
            employeeId: 'e4510e2d-6dc8-40df-bd29-1de50fd313bb',
            status: OptionsStatus.VESTED,
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .put('/grants/status')
        .send(updateStatus)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({ 1: StepStatus.COMPLETED });
    });

    it('sends email single-step', async () => {
      const updateStatus: UpdateStatusDto = {
        steps: [
          {
            type: StepType.EMAIL,
            id: '1',
            to: ['shir@gmail.com'],
            text: 'email text',
            headline: 'hello',
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .put('/grants/status')
        .send(updateStatus)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({ 1: StepStatus.COMPLETED });
    });

    it('returns skipped on circular dependencies', async () => {
      const updateStatus: UpdateStatusDto = {
        steps: [
          {
            type: StepType.EMAIL,
            id: '1',
            dependsOn: ['2'],
            to: ['shir@gmail.com'],
            text: 'email text',
            headline: 'hello',
          },
          {
            type: StepType.EMAIL,
            id: '2',
            dependsOn: ['2'],
            to: ['shir@gmail.com'],
            text: 'email text',
            headline: 'hello',
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .put('/grants/status')
        .send(updateStatus)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({
        1: StepStatus.SKIPPED,
        2: StepStatus.SKIPPED,
      });
    });

    it('checks dependent steps', async () => {
      const updateStatus: UpdateStatusDto = {
        steps: [
          {
            type: StepType.EMAIL,
            id: '1',
            dependsOn: ['2', '3'],
            to: ['shir@gmail.com'],
            text: 'email text',
            headline: 'hello',
          },
          {
            type: StepType.UPDATE,
            id: '2',
            dependsOn: [],
            employeeId: 'e4510e2d-6dc8-40df-bd29-1de50fd313bb',
            status: OptionsStatus.VESTED,
          },
          {
            type: StepType.UPDATE,
            id: '3',
            dependsOn: ['4'],
            employeeId: 'e4510e2d-6dc8-40df-bd29-1de50fd313bb',
            status: OptionsStatus.VESTED,
          },
          {
            type: StepType.UPDATE,
            id: '4',
            employeeId: 'e4510e2d-6dc8-40df-bd29-1de50fd313bb',
            status: OptionsStatus.VESTED,
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .put('/grants/status')
        .send(updateStatus)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({
        1: StepStatus.COMPLETED,
        2: StepStatus.COMPLETED,
        3: StepStatus.COMPLETED,
        4: StepStatus.COMPLETED,
      });
    });

    it('checks dependentSteps with some failing', async () => {
      const sendEmailMock = jest
        .spyOn(require('@src/utilities/emailServices'), 'sendEmail')
        .mockImplementation(() => false);

      // running order: 2, 4 -> 3 (failed) -> 1 (not executed)
      const updateStatus: UpdateStatusDto = {
        steps: [
          {
            type: StepType.UPDATE,
            id: '1',
            dependsOn: ['2', '3'],
            to: ['shir@gmail.com'],
            employeeId: 'e4510e2d-6dc8-40df-bd29-1de50fd313bb',
            status: OptionsStatus.VESTED,
          },
          {
            type: StepType.UPDATE,
            id: '2',
            dependsOn: [],
            employeeId: 'e4510e2d-6dc8-40df-bd29-1de50fd313bb',
            status: OptionsStatus.VESTED,
          },
          {
            type: StepType.EMAIL,
            id: '3',
            dependsOn: ['4'],
            to: ['shir@gmail.com'],
            text: 'email text',
            headline: 'hello',
          },
          {
            type: StepType.UPDATE,
            id: '4',
            employeeId: 'e4510e2d-6dc8-40df-bd29-1de50fd313bb',
            status: OptionsStatus.VESTED,
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .put('/grants/status')
        .send(updateStatus)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({
        1: StepStatus.SKIPPED,
        2: StepStatus.COMPLETED,
        3: StepStatus.FAILED,
        4: StepStatus.COMPLETED,
      });
      expect(sendEmailMock).toHaveBeenCalled();
    });

    // TODO implement invalid employeeId test - when DB
  });
});
