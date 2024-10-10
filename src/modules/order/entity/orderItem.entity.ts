import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index, JoinColumn } from 'typeorm';
import { Order } from './../../order/entity/order.entity';
import { Product } from './../../product/entity/product.entity';

@Entity()
@Index(['order_id', 'product_id'], { unique: true })
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  order_id: number;

  @Column()
  product_id: number;

  @Column()
  quantity: number;

  @ManyToOne(() => Order, order => order.items)
  @JoinColumn({ name: 'order_id' }) 
  order: Order;

  @ManyToOne(() => Product, product => product.items)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
