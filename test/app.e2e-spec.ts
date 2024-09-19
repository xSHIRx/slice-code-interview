import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@src/app.module';
import { AllExceptionsFilter } from '@src/filters/general.filter';
import { AppService } from '@src/app.service';

describe('App health check', () => {
  let app: INestApplication;
  let appService: AppService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new AllExceptionsFilter());

    appService = moduleFixture.get<AppService>(AppService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('gets health check', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(HttpStatus.OK)
      .expect(({ body }) => {
        expect(body).toEqual({ running: true });
      });
  });

  it('checks all exceptions filter', () => {
    jest.spyOn(appService, 'isRunning').mockImplementation(() => {
      throw new Error('some random error');
    });
    return request(app.getHttpServer()).get('/').expect(HttpStatus.BAD_REQUEST);
  });
});
