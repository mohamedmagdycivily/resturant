// order.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { OrderInterface, OrderInterfaceToken } from './interface/order.interface';
import { OrderItemInterface, OrderItemInterfaceToken } from './interface/orderItem.interface';
import { ProductService } from '../product/product.service';
import { RedisService } from '../../redis/redis.service';
import { QueueService } from '../../bull/queue.service';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { IngredientService } from '../ingredient/ingredient.service';
import { BadRequestException } from '@nestjs/common';
import { Order } from './entity/order.entity';
import { OrderItem } from './entity/orderItem.entity';
import { ChainableCommander } from 'ioredis';
import { 
  mockOrderItems,
  mockProductIngredients,
  mockRedisValues 
} from './order.service.mock';

describe('OrderService', () => {
  let service: OrderService;
  let orderRepo: jest.Mocked<OrderInterface>;
  let orderItemRepo: jest.Mocked<OrderItemInterface>;
  let productService: jest.Mocked<ProductService>;
  let ingredientService: jest.Mocked<IngredientService>;
  let redisService: jest.Mocked<RedisService>;
  let queueService: jest.Mocked<QueueService>;
  let configService: jest.Mocked<ConfigService>;
  let dataSource: jest.Mocked<DataSource>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: OrderInterfaceToken,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: OrderItemInterfaceToken,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: ProductService,
          useValue: {
            findAllProductIngredients: jest.fn(),
          },
        },
        {
          provide: IngredientService,
          useValue: {
            update: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            acquireLocks: jest.fn(),
            releaseLocks: jest.fn(),
            getValue: jest.fn(),
            createTransaction: jest.fn(),
            multiSetValue: jest.fn(),
            commitTransaction: jest.fn(),
          },
        },
        {
          provide: QueueService,
          useValue: {
            addJob: jest.fn(),
            addNotificationJob: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    orderRepo = module.get(OrderInterfaceToken);
    orderItemRepo = module.get(OrderItemInterfaceToken);
    productService = module.get(ProductService);
    ingredientService = module.get(IngredientService);
    redisService = module.get(RedisService);
    queueService = module.get(QueueService);
    configService = module.get(ConfigService);
    dataSource = module.get(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    beforeEach(() => {
      productService.findAllProductIngredients.mockResolvedValue(mockProductIngredients);
      redisService.acquireLocks.mockResolvedValue(['lock:1', 'lock:2']);
      redisService.getValue.mockImplementation((key) => {
        return Promise.resolve(mockRedisValues[key]);
      });
      redisService.createTransaction.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      } as unknown as ChainableCommander);
      queueService.addJob.mockResolvedValue(undefined);
      queueService.addNotificationJob.mockResolvedValue(undefined);
    });

    it('should create an order successfully', async () => {
      await service.create(mockOrderItems);

      expect(productService.findAllProductIngredients).toHaveBeenCalledWith(['1']);
      expect(redisService.acquireLocks).toHaveBeenCalledWith(['1', '2']);
      expect(redisService.getValue).toHaveBeenCalledTimes(2);
      expect(queueService.addJob).toHaveBeenCalled();
      expect(redisService.multiSetValue).toHaveBeenCalledTimes(2);
      expect(redisService.commitTransaction).toHaveBeenCalled();
      expect(redisService.releaseLocks).toHaveBeenCalledWith(['lock:1', 'lock:2']);
    });

    it('should throw BadRequestException when insufficient stock', async () => {
      redisService.getValue.mockResolvedValueOnce(JSON.stringify({ stock: 100, availableStock: 100, emailSent: false }));

      await expect(service.create(mockOrderItems)).rejects.toThrow(BadRequestException);
      expect(redisService.releaseLocks).toHaveBeenCalled();
    });

    it('should send notification when stock reaches 50%', async () => {
      redisService.getValue.mockResolvedValueOnce(JSON.stringify({ stock: 1000, availableStock: 600, emailSent: false }));

      await service.create(mockOrderItems);

      expect(queueService.addNotificationJob).toHaveBeenCalled();
    });

    it('should not send notification when stock is below 50% but email already sent', async () => {
      redisService.getValue.mockResolvedValueOnce(JSON.stringify({ stock: 1000, availableStock: 400, emailSent: true }));

      await service.create(mockOrderItems);

      expect(queueService.addNotificationJob).not.toHaveBeenCalled();
    });
  });

  describe('handleCreateOrderJob', () => {
    const mockJobData = {
      jobID: '1234',
      action: 'create order',
      orderItems: [{ product_id: 1, quantity: 2 }] as Partial<OrderItem>[],
      ingredients: [{ where: '1', data: { cutAmount: 300 } }],
    };

    let queryRunner: any;

    beforeEach(() => {
      queryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: {
          create: jest.fn(),
          save: jest.fn(),
        },
      };
      dataSource.createQueryRunner.mockReturnValue(queryRunner);
      orderRepo.create.mockResolvedValue({ id: 1 } as Order);
      orderItemRepo.create.mockResolvedValue([{ id: 1, order_id: 1 } as OrderItem]);
      ingredientService.update.mockResolvedValue({ affected: 1 });
    });

    it('should handle create order job successfully', async () => {
      await service.handleCreateOrderJob(mockJobData);

      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(orderRepo.create).toHaveBeenCalled();
      expect(orderItemRepo.create).toHaveBeenCalled();
      expect(ingredientService.update).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should rollback transaction on error', async () => {
      orderRepo.create.mockRejectedValue(new Error('Database error'));

      await expect(service.handleCreateOrderJob(mockJobData)).rejects.toThrow('Database error');


      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();

    });
  });
});
