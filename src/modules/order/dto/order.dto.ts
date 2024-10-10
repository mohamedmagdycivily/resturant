import { IsArray, IsString, ValidateNested, IsInt, IsOptional, IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class OrderItemDTO {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  product_id: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @IsPositive()
  quantity: number;
}

export class CreateOrderDTO {
  @ApiProperty({ type: [OrderItemDTO] })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDTO)
  @IsArray()
  products: OrderItemDTO[];
}
