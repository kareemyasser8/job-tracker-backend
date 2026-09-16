// user.entity.ts
import { ApiProperty } from '@nestjs/swagger';

export class User {
  @ApiProperty({ example: '7073b39c-8e1d-4d40-86ac-d331a800c4ee' })
  id: string;

  @ApiProperty({ example: 'Jane' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ example: 'jane.doe@example.com' })
  email: string;

  @ApiProperty({ example: '2026-09-14T10:55:11.715Z' })
  createdAt: Date;
}
