import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { ProductStatus } from '../entities/product.entity';
import { PaginationDto } from './pagination.dto';

export class ProductFilterDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search term to filter products by name or description',
    example: 'headphones',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter products by status',
    enum: ProductStatus,
    example: ProductStatus.AVAILABLE,
  })
  @IsOptional()
  @IsString()
  status?: ProductStatus;
}
