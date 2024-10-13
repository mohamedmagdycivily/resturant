import { EntityManager } from 'typeorm';
import { OrderItem } from '../entity/orderItem.entity';

export const OrderItemInterfaceToken = Symbol('orderItemInterface');

export interface OrderItemInterface {
  findById(id: string): Promise<OrderItem | null>;
  findAll(): Promise<OrderItem[]>;
  create(orderItemsData: Partial<OrderItem>[], manager: EntityManager): Promise<OrderItem[]> ;
}
