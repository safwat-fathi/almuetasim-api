import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { User } from 'src/users/entities/user.entity';
import { ProductFilterDto } from './dto/product-filter.dto';
import { PaginatedProductsDto } from './dto/paginated-products.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    user: User,
  ): Promise<Product> {
    const product = this.productRepository.create({
      ...createProductDto,
      user,
    });
    return this.productRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.find();
  }

  async findAllWithPagination(
    filterDto: ProductFilterDto,
  ): Promise<PaginatedProductsDto> {
    const { page = 1, limit = 10, search, status } = filterDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.productRepository.createQueryBuilder('product');

    // Apply search filter
    if (search) {
      queryBuilder.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply status filter
    if (status) {
      queryBuilder.andWhere('product.status = :status', { status });
    }

    // Apply pagination
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }
    return product;
  }

  async findOneWithUser(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }
    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    user: User,
  ): Promise<Product> {
    const product = await this.findOneWithUser(id);
    if (product.user.id !== user.id) {
      throw new UnauthorizedException(
        'You are not authorized to update this product',
      );
    }
    this.productRepository.merge(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async remove(id: number, user: User): Promise<void> {
    const product = await this.findOneWithUser(id);
    if (product.user.id !== user.id) {
      throw new UnauthorizedException(
        'You are not authorized to delete this product',
      );
    }
    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }
  }

  async updateProductImage(
    id: number,
    imagePath: string,
    user: User,
  ): Promise<Product> {
    const product = await this.findOneWithUser(id);
    if (product.user.id !== user.id) {
      throw new UnauthorizedException(
        'You are not authorized to update this product',
      );
    }

    product.image_path = imagePath;
    return this.productRepository.save(product);
  }
}
