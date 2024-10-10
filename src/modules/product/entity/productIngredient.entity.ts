import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index, JoinColumn } from 'typeorm';
import { Product } from './product.entity';
import { Ingredient } from './../../ingredient/entity/Ingredient.entity';

@Entity()
@Index(['product_id', 'ingredient_id'], { unique: true })
export class ProductIngredient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  product_id: number;

  @Column()
  ingredient_id: number;

  @Column()
  amount: number;

  @ManyToOne(() => Product, product => product.ingredients)
  @JoinColumn({ name: 'product_id' }) 
  product: Product;

  @ManyToOne(() => Ingredient, ingredient => ingredient.products)
  @JoinColumn({ name: 'ingredient_id' })
  ingredient: Ingredient;
}
