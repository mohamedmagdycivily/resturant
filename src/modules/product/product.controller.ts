import { Controller, Get, Post, Param, Body, Put } from '@nestjs/common';
import { ProductService } from './product.service';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('orders')
@Controller('orders')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

}
