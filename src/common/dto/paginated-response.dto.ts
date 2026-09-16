import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function PaginatedResponse<T>(classRef: Type<T>) {
  class PaginatedResponseClass {
    @ApiProperty()
    total: number;

    @ApiProperty({ type: [classRef] })
    data: T[];
  }

  Object.defineProperty(PaginatedResponseClass, 'name', {
    value: `Paginated${classRef.name}Response`,
  });

  return PaginatedResponseClass;
}
