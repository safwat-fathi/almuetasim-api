import { IsString, IsOptional, IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'The name of the category',
    example: 'Water Filters',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The URL-friendly slug of the category',
    example: 'water-filters',
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({
    description: 'The ID of the parent category',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  parent_id?: number;
}
