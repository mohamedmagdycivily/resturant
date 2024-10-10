import { Order } from '../entity/order.entity';

export const OrderInterfaceToken = Symbol('OrderInterface');

export interface OrderInterface {
  findById(id: string): Promise<Order | null>;
  findAll(): Promise<Order[]>;
  create(): Promise<Order>;
}
