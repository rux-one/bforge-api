import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

export type HealthInfo = {
  version: string;
  db: string;
};

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async getHealth(): Promise<HealthInfo> {
    return {
      version: await this.appService.getVersion(),
      db: await this.appService.getHealth(),
    };
  }
}
