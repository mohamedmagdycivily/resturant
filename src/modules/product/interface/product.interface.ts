import { Product } from '../entity/product.entity';

export const ProductInterfaceToken = Symbol('OrderInterface');

export interface ProductInterface {
  findById(id: string): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  create(order: Partial<Product>): Promise<Product>;
  aggregate(pipeline: any[]): Promise<any[]>;
}
