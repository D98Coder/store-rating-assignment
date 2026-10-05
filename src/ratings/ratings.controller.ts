import { Body, Controller, Delete, HttpCode, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import type { AuthUser } from '../common/interfaces';
import { RatingDto } from './dto/rating.dto';
import { RatingsService } from './ratings.service';

@Controller('stores/:storeId/ratings')
@Roles(Role.NORMAL_USER)
export class RatingsController {
  constructor(private readonly ratings: RatingsService) {}

  @Post()
  @HttpCode(200)
  submit(
    @Param('storeId', ParseUUIDPipe) storeId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: RatingDto,
  ) {
    return this.ratings.submit(user?.id, storeId, dto.rating);
  }

  @Patch()
  modify(
    @Param('storeId', ParseUUIDPipe) storeId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: RatingDto,
  ) {
    return this.ratings.submit(user?.id, storeId, dto.rating, true);
  }

  @Delete()
  remove(
    @Param('storeId', ParseUUIDPipe) storeId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.ratings.remove(user.id, storeId);
  }
}