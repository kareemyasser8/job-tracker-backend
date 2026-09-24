import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateTechnologyDto {
  @ApiProperty({ example: 'TypeScript', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  name: string;
}
