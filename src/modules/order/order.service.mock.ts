// order.service.mock.ts

import { ProductIngredient } from '../product/entity/productIngredient.entity';
import { OrderItem } from './entity/orderItem.entity';

export const mockOrderItems: Partial<OrderItem>[] = [{ product_id: 1, quantity: 2 }];

export const mockProductIngredients: ProductIngredient[] = [
  {
    id: 1,
    product_id: 1,
    ingredient_id: 1,
    amount: 150,
    ingredient: {
      name: 'Beef',
      id: 0,
      stock: 10000,
      available_stock: 10000,
      email_sent: false,
      products: [],
    },
    product: {} as any,
  },
  {
    id: 2,
    product_id: 1,
    ingredient_id: 2,
    amount: 30,
    ingredient: {
      name: 'Cheese',
      id: 0,
      stock: 1000,
      available_stock: 1000,
      email_sent: false,
      products: [],
    },
    product: {} as any,
  },
];

export const mockRedisValues = {
  '1': JSON.stringify({ stock: 20000, availableStock: 20000, emailSent: false }),
  '2': JSON.stringify({ stock: 5000, availableStock: 5000, emailSent: false }),
};
