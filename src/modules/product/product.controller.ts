import { Controller, Get, Post, Param, Body, Put } from '@nestjs/common';
import { ProductService } from './product.service';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('ProductV1')
@Controller({ path: 'product', version: '1' })
export class ProductControllerV1 {
  constructor(private readonly productService: ProductService) {}

}
