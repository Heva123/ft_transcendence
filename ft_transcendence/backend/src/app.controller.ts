import { ApiOperation } from "@nestjs/swagger";
import { Controller, Get, Header } from "@nestjs/common";

@Controller()
export class AppController {
  @Get("default-avatar")
  @Header("Content-Type", "image/svg+xml")
  @Header("Cache-Control", "public, max-age=86400")
  @ApiOperation({
    summary: "Default avatar image for accounts without an upload",
    security: [],
  })
  defaultAvatar() {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Default avatar"><rect width="128" height="128" rx="64" fill="#e2e8f0"/><circle cx="64" cy="47" r="23" fill="#64748b"/><path d="M22 121a42 42 0 0 1 84 0" fill="#64748b"/></svg>';
  }

  @ApiOperation({ security: [] })
  @Get("health")
  health() {
    return {
      status: "ok",
      service: "transcendence-backend",
      timestamp: new Date().toISOString(),
    };
  }
}
