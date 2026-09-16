import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class CreatePreferenceDto {
  @ApiProperty({ example: false })
  @IsBoolean()
  isDarkMode: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  isGridLayout: boolean;
}