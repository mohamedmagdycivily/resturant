import { Order } from '../entity/order.entity';

export const OrderInterfaceToken = Symbol('OrderInterface');

export interface OrderInterface {
  findById(id: string): Promise<Order | null>;
  findAll(): Promise<Order[]>;
  create(order: Partial<Order>): Promise<Order>;
  aggregate(pipeline: any[]): Promise<any[]>;
}
