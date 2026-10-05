import { TaskStatus } from "@prisma/client";
import { IsEnum } from "class-validator";

export class UpdateTaskStatusDto {
  @IsEnum(TaskStatus)
  status!: TaskStatus;
}
