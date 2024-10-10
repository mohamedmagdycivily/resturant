import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from 'typeorm';
import { ProductIngredient } from './../../product/entity/productIngredient.entity';
import { OrderItem } from './../../order/entity/orderItem.entity';

@Entity()
@Index(['name'], { unique: true })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => ProductIngredient, productIngredient => productIngredient.product)
  ingredients: ProductIngredient[];

  @OneToMany(() => OrderItem, orderItem => orderItem.product)
  items: OrderItem[];
}
