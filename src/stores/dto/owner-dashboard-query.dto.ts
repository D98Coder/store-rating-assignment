import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { PaginationQueryDto, SortOrder } from '../../common/dto/pagination.dto';

/** Owner dashboard defaults: show up to 100 raters, newest first. */
export class OwnerDashboardQueryDto extends PaginationQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  limit: number = 100;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
  @IsEnum(SortOrder)
  order: SortOrder = SortOrder.DESC;
}