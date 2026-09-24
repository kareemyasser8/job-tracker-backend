import { ApiProperty } from '@nestjs/swagger';

export class Preference {
  @ApiProperty({ example: false })
  isDarkMode: boolean;

  @ApiProperty({ example: false })
  isGridLayout: boolean;
}
