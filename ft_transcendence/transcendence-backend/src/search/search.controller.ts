import {
  Controller,
  Get,
  Query,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { SearchService } from "./search.service";

@UseGuards(JwtAuthGuard)
@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(
    @Query("q") q = "",
    @Query("type") type = "all",
    @Query("page") page = "1",
    @Query("limit") limit = "10",
    @Query("sort") sort = "desc",
    @Query("communityId") communityId?: string,
  ) {
    return this.searchService.search(
      q,
      type,
      Number(page) || 1,
      Number(limit) || 10,
      sort,
      communityId,
    );
  }
}
