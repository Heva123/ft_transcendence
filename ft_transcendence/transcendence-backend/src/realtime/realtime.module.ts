import { Global, Module } from "@nestjs/common";
import { RealtimeEventsService } from "./realtime-events.service";

@Global()
@Module({
  providers: [RealtimeEventsService],
  exports: [RealtimeEventsService],
})
export class RealtimeModule {}
