import { Module } from '@nestjs/common';
import { DemoGateway } from './demo.gateway';

@Module({
  providers: [DemoGateway],
})
export class DemoModule {}
