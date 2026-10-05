import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { CommunitiesModule } from "./communities/communities.module";
import { CommunityMembersModule } from "./community-members/community-members.module";
import { PermissionsModule } from "./permissions/permissions.module";
import { RolesModule } from "./roles/roles.module";
import { ProjectsModule } from "./projects/projects.module";
import { TasksModule } from "./tasks/tasks.module";
import { ChannelsModule } from "./channels/channels.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CommunitiesModule,
    CommunityMembersModule,
    PermissionsModule,
    RolesModule,
    ProjectsModule,
    TasksModule,
    ChannelsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
