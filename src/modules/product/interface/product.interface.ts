import { Product } from '../entity/product.entity';

export const ProductInterfaceToken = Symbol('ProductInterface');

export interface ProductInterface {
  findById(id: string): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  create(order: Partial<Product>): Promise<Product>;
}
