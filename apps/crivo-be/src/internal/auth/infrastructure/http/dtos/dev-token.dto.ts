import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class DevTokenDto {
  @ApiProperty({ example: 'geraldobl58@gmail.com' })
  @IsEmail()
  username: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(1)
  password: string;
}
