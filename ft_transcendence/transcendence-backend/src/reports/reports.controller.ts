import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthUser } from "../common/types/auth-user.type";
import { RequirePermissions } from "../permissions/decorators/require-permissions.decorator";
import { CommunityPermissionGuard } from "../permissions/guards/community-permission.guard";
import { Permission } from "../permissions/permission.enum";
import { CreateReportDto } from "./dto/create-report.dto";
import { ReviewReportDto } from "./dto/review-report.dto";
import { ReportsService } from "./reports.service";

@UseGuards(JwtAuthGuard, CommunityPermissionGuard)
@Controller("communities/:communityId/reports")
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Post()
  @RequirePermissions(Permission.COMMUNITY_READ)
  create(
    @CurrentUser() user: AuthUser,
    @Param("communityId", ParseUUIDPipe) communityId: string,
    @Body() dto: CreateReportDto,
  ) {
    return this.reports.create(user.id, communityId, dto);
  }

  @Get()
  @RequirePermissions(Permission.REPORT_READ)
  findAll(
    @Param("communityId", ParseUUIDPipe) communityId: string,
  ) {
    return this.reports.findAll(communityId);
  }

  @Patch(":reportId")
  @RequirePermissions(Permission.REPORT_MODERATE)
  review(
    @CurrentUser() user: AuthUser,
    @Param("communityId", ParseUUIDPipe) communityId: string,
    @Param("reportId", ParseUUIDPipe) reportId: string,
    @Body() dto: ReviewReportDto,
  ) {
    return this.reports.review(
      user.id,
      communityId,
      reportId,
      dto,
    );
  }
}
