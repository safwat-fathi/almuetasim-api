import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CategoryFilterDto {
  @ApiPropertyOptional({
    description: 'Search by category name',
    example: 'Water Filters',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
