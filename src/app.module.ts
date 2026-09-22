import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ApplicationNoteModule } from './modules/application-note/application-note.module.js';
import { ApplicationModule } from './modules/application/application.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { CompanyModule } from './modules/company/company.module.js';
import { PreferenceModule } from './modules/preference/preference.module.js';
import { RoleModule } from './modules/role/role.module.js';
import { SourceModule } from './modules/source/source.module.js';
import { TechnologyModule } from './modules/technology/technology.module.js';
import { UserModule } from './modules/user/user.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    // ObserveModule.forRoot({
    //   appKey: 'YOUR_APP_KEY',
    //   appSecret: 'YOUR_APP_SECRET',
    //   serviceId: 'job-tracker-backend',
    // }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UserModule,
    CompanyModule,
    PreferenceModule,
    SourceModule,
    RoleModule,
    TechnologyModule,
    ApplicationModule,
    ApplicationNoteModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
