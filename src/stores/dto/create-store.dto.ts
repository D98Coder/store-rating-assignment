import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, IsUUID, Length, MaxLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class CreateStoreDto {
  @Transform(trim) @IsString() @Length(20, 60, { message: 'Name must be between 20 and 60 characters' })
  name: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Email must be a valid email address' }) @MaxLength(255)
  email: string;

  @Transform(trim) @IsString() @MaxLength(400, { message: 'Address must be at most 400 characters' })
  address: string;

  @IsOptional() @IsUUID()
  ownerId?: string;
}