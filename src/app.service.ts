import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as packageInfo from '../package.json';

@Injectable()
export class AppService {
  constructor(private readonly dataSource: DataSource) {}

  getHello(): string {
    return 'Hello, World.';
  }

  async getVersion(): Promise<string> {
    return packageInfo.version;
  }

  async getHealth(): Promise<string> {
    await this.dataSource.query('SELECT 1 AS `health`');
    return 'OK';
  }
}
