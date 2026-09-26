import { Module } from '@nestjs/common';
import { DemoModule } from './demo/demo.module';
import { PrismaModule } from './prisma/prisma.module';
import { DemoIdentityModule } from './demo-identity/demo-identity.module';
import { PostsModule } from './posts/posts.module';

@Module({ imports: [PrismaModule, DemoIdentityModule, DemoModule, PostsModule] })
export class AppModule {}
