import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('App Routing Smoke (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  it('rejects root path when API prefix is enabled', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(404);
  });

  it('protects private routes with JWT', () => {
    return request(app.getHttpServer())
      .get('/api/users')
      .expect(401);
  });

  afterAll(async () => {
    await app.close();
  });
});
