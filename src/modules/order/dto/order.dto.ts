import { IsArray, IsString, ValidateNested, IsInt, IsOptional, IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

class ItemDTO {
  @IsString()
  name: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsInt()
  @IsPositive()
  quantity: number;
}

class CustomerInfoDTO {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  contact?: string;

  @IsString()
  @IsOptional()
  address?: string;
}

export class CreateOrderDTO {
  @ValidateNested({ each: true })
  @Type(() => ItemDTO)
  @IsArray()
  items: ItemDTO[];

  // @IsNumber()
  // @IsPositive()
  // totalPrice: number;

  @ValidateNested()
  @Type(() => CustomerInfoDTO)
  customerInfo: CustomerInfoDTO;
}

class UpdateItemDTO {
  @IsString()
  @IsOptional()
  name: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsInt()
  @IsOptional()
  quantity: number;
}

class UpdateCustomerInfoDTO {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  contact: string;

  @IsString()
  @IsOptional()
  address: string;
}

export class UpdateOrderDTO {
  @ValidateNested({ each: true })
  @Type(() => UpdateItemDTO)
  @IsArray()
  @IsOptional()
  items?: UpdateItemDTO[];

  @ValidateNested()
  @Type(() => UpdateCustomerInfoDTO)
  @IsOptional()
  customerInfo?: UpdateCustomerInfoDTO;
}
