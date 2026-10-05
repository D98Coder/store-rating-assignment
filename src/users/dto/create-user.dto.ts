import { IsEnum } from 'class-validator';
import { Role } from '../../common/enums/role.enum';
import { BaseUserDto } from './base-user.dto';

/** Admin-only: can create any role. */
export class CreateUserDto extends BaseUserDto {
  @IsEnum(Role)
  role: Role;
}