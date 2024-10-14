import { Test, TestingModule } from '@nestjs/testing';
import { OrderControllerV1 } from './order.controller';
import { OrderService } from './order.service';
import { CreateOrderDTO } from './dto/order.dto';
import { Response } from 'express';
import { HttpStatus, BadRequestException } from '@nestjs/common';

describe('OrderControllerV1', () => {
  let orderService: any;
  let orderController: OrderControllerV1;

  const mockOrderService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderControllerV1],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    orderController = module.get<OrderControllerV1>(OrderControllerV1);
    orderService = module.get<OrderService>(OrderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    let mockResponse: Response;

    beforeEach(() => {
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
    });

    it('should create an order and return 201 status', async () => {
      const orderDto: CreateOrderDTO = {
        products: [{ product_id: 1, quantity: 2 }],
      };

      await orderController.createOrder(orderDto, mockResponse);

      expect(orderService.create).toHaveBeenCalledWith(orderDto.products);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 201,
        message: 'order created successfully',
        data: {},
      });
    });

    it('should handle errors from orderService.create', async () => {
      const orderDto: CreateOrderDTO = {
        products: [{ product_id: 1, quantity: 2 }],
      };

      const error = new BadRequestException('Insufficient stock');
      orderService.create.mockRejectedValue(error);

      await expect(orderController.createOrder(orderDto, mockResponse)).rejects.toThrow(BadRequestException);
    });

    it('should handle unexpected errors', async () => {
      const orderDto: CreateOrderDTO = {
        products: [{ product_id: 1, quantity: 2 }],
      };

      const error = new Error('Unexpected error');
      orderService.create.mockRejectedValue(error);

      await expect(orderController.createOrder(orderDto, mockResponse)).rejects.toThrow('Unexpected error');
    });
  });
});