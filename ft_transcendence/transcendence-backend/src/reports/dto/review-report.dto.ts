import { ReportStatus } from "@prisma/client";
import { IsIn } from "class-validator";

export class ReviewReportDto {
  @IsIn([ReportStatus.RESOLVED, ReportStatus.DISMISSED])
  status!: ReportStatus;
}
