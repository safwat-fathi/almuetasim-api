import { Category } from '../entities/category.entity';
import { ApiProperty } from '@nestjs/swagger';

export class PaginatedCategoriesDto {
  @ApiProperty({ type: [Category] })
  data: Category[];

  @ApiProperty({
    type: 'object',
    properties: {
      total: { type: 'number', example: 100 },
      page: { type: 'number', example: 1 },
      limit: { type: 'number', example: 10 },
      totalPages: { type: 'number', example: 10 },
    },
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
