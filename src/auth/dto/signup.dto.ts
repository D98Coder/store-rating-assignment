import { BaseUserDto } from '../../users/dto/base-user.dto';

/** No role field: with forbidNonWhitelisted, sending "role" is rejected. */
export class SignupDto extends BaseUserDto {}