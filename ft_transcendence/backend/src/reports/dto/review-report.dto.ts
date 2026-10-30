import { ReportStatus } from "@prisma/client";
import { IsBoolean, IsIn, IsOptional } from "class-validator";

export class ReviewReportDto {
  @IsIn([ReportStatus.RESOLVED, ReportStatus.DISMISSED])
  status!: ReportStatus;

  // Resolve and remove the reported post or reply in one step.
  @IsOptional()
  @IsBoolean()
  removeContent?: boolean;
}
