import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { OrderStatus, PaymentStatus } from '../entities/order.entity';

export class CreateOrderDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  buyer_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  buyer_contact: string;

  @ApiProperty({ enum: PaymentStatus, required: false })
  @IsEnum(PaymentStatus)
  @IsOptional()
  payment_status?: PaymentStatus;

  @ApiProperty({ enum: OrderStatus, required: false })
  @IsEnum(OrderStatus)
  @IsOptional()
  order_status?: OrderStatus;
}
