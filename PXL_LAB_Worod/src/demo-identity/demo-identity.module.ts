import { Global, Module } from '@nestjs/common';
import { DemoIdentityService } from './demo-identity.service';

@Global()
@Module({ providers: [DemoIdentityService], exports: [DemoIdentityService] })
export class DemoIdentityModule {}
