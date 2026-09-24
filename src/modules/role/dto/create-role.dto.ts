import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'Backend Engineer', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  name: string;
}
