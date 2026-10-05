import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length, Matches, MaxLength } from 'class-validator';
import { PASSWORD_MESSAGE, PASSWORD_REGEX } from '../../common/utils/validation';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
const normalizeEmail = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class BaseUserDto {
  @Transform(trim) @IsString() @Length(20, 60, { message: 'Name must be between 20 and 60 characters' })
  name: string;

  @Transform(normalizeEmail) @IsEmail({}, { message: 'Email must be a valid email address' }) @MaxLength(255)
  email: string;

  @IsString() @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  password: string;

  @Transform(trim) @IsString() @MaxLength(400, { message: 'Address must be at most 400 characters' })
  address: string;
}