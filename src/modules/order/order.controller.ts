import { Controller, Get, Post, Param, Body, Put, Res } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDTO } from './dto/order.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import swaggerConfig from './swagger/swagger.config';
@ApiTags('OrdersV1')
@Controller({ path: 'orders', version: '1' })
export class OrderControllerV1 {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation(swaggerConfig.createOrderApiOperationOptions)
  @ApiBody(swaggerConfig.createOrderApiBodyOptions)
  @ApiResponse(swaggerConfig.createOrderApiResponseOptions)
  async createOrder(
    @Body() order: CreateOrderDTO,
    @Res() response: Response
  ){
    await this.orderService.create(order.products);
    return response.status(201).json({
      statusCode: 201,
      message: 'order created successfully',
      data: {}
    });
  }
}
