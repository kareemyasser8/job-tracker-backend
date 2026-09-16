import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from './user.entity.js';

export class Preference {
  @ApiProperty({ example: '7073b39c-8e1d-4d40-86ac-d331a800c4ee' })
  userId: string;

  @ApiPropertyOptional({ type: () => User })
  user?: User;

  @ApiProperty({ example: false })
  isDarkMode: boolean;

  @ApiProperty({ example: false })
  isGridLayout: boolean;
}
