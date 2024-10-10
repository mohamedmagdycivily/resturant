import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from 'typeorm';
import { ProductIngredient } from './../../product/entity/productIngredient.entity';

@Entity()
@Index(['name'], { unique: true })
export class Ingredient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  stock: number;

  @Column({ default: false })
  email_sent: boolean;

  @OneToMany(() => ProductIngredient, productIngredient => productIngredient.ingredient)
  products: ProductIngredient[];
}
