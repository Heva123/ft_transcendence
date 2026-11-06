import { ReportStatus } from "@prisma/client";
import { IsBoolean, IsIn, IsOptional } from "class-validator";

export class ReviewReportDto {
  @IsIn([ReportStatus.RESOLVED, ReportStatus.DISMISSED])
  status!: ReportStatus;

  @IsOptional()
  @IsBoolean()
  removeContent?: boolean;
}
