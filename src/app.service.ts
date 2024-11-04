import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(private readonly dataSource: DataSource) {}

  getHello(): string {
    return 'Hello, World.';
  }

  async getHealth(): Promise<string> {
    await this.dataSource.query('SELECT 1 AS `health`');
    return 'OK';
  }
}
