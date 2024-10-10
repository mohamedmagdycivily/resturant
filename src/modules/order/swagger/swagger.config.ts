import { CreateOrderDTO } from '../dto/order.dto';
import { ApiBodyOptions, ApiResponseOptions, ApiOperationOptions } from '@nestjs/swagger';

export const createOrderApiOperationOptions: ApiOperationOptions = {
  summary: 'Create a new order',
};

export const createOrderApiBodyOptions: ApiBodyOptions = {
  description: 'Order creation payload',
  type: CreateOrderDTO,
  examples: {
    example1: {
      summary: 'Example Order',
      value: {
        products: [
          {
            product_id: 1,
            quantity: 2,
          },
          {
            product_id: 2,
            quantity: 3,
          },
        ],
      },
    },
  },
};

export const createOrderApiResponseOptions: ApiResponseOptions = {
  status: 201,
  description: 'Order created successfully',
};

export default {
  createOrderApiOperationOptions,
  createOrderApiBodyOptions,
  createOrderApiResponseOptions,
}