import { MigrationInterface, QueryRunner } from "typeorm";
import Redis from 'ioredis';  // Ensure correct import
export class CreateTables1728930682687 implements MigrationInterface {
    private redis: Redis;

    constructor() {
        // Connect to Redis using environment variables directly
        this.redis = new Redis({
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
            password: process.env.REDIS_PASSWORD, // Optional, only if needed
        });
    }

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE product (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL
            );

            CREATE TABLE ingredient (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                stock INT NOT NULL,
                available_stock INT NOT NULL,
                email_sent BOOLEAN DEFAULT FALSE
            );

            CREATE TABLE "order" (
                id SERIAL PRIMARY KEY,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE order_item (
                id SERIAL PRIMARY KEY,
                order_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT NOT NULL,
                CONSTRAINT unique_order_product UNIQUE (order_id, product_id),
                FOREIGN KEY (order_id) REFERENCES "order"(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE
            );

            CREATE TABLE product_ingredient (
                id SERIAL PRIMARY KEY,
                product_id INT NOT NULL,
                ingredient_id INT NOT NULL,
                amount INT NOT NULL,
                CONSTRAINT unique_product_ingredient UNIQUE (product_id, ingredient_id),
                FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE,
                FOREIGN KEY (ingredient_id) REFERENCES ingredient(id) ON DELETE CASCADE
            );

            INSERT INTO product (name) VALUES ('Cheese Burger'), ('Wild Burger');

            INSERT INTO ingredient (name, stock, available_stock) VALUES 
                ('Beef', 20000, 20000), 
                ('Cheese', 5000, 5000), 
                ('Onion', 1000, 1000);

            INSERT INTO product_ingredient (product_id, ingredient_id, amount)
            VALUES 
                ((SELECT id FROM product WHERE name = 'Cheese Burger'), (SELECT id FROM ingredient WHERE name = 'Beef'), 1000),
                ((SELECT id FROM product WHERE name = 'Cheese Burger'), (SELECT id FROM ingredient WHERE name = 'Cheese'), 100),
                ((SELECT id FROM product WHERE name = 'Cheese Burger'), (SELECT id FROM ingredient WHERE name = 'Onion'), 10),
                ((SELECT id FROM product WHERE name = 'Wild Burger'), (SELECT id FROM ingredient WHERE name = 'Beef'), 500),
                ((SELECT id FROM product WHERE name = 'Wild Burger'), (SELECT id FROM ingredient WHERE name = 'Cheese'), 50),
                ((SELECT id FROM product WHERE name = 'Wild Burger'), (SELECT id FROM ingredient WHERE name = 'Onion'), 5);
        `);

        // Cache the ingredients in Redis after insertion
        const ingredients = [
            { id: 1, stock: 20000, availableStock: 20000, emailSent: false },
            { id: 2, stock: 5000, availableStock: 5000, emailSent: false },
            { id: 3, stock: 1000, availableStock: 1000, emailSent: false },
        ];

        for (const ingredient of ingredients) {
            await this.redis.set(ingredient.id.toString(), JSON.stringify({
                stock: ingredient.stock,
                availableStock: ingredient.availableStock,
                emailSent: ingredient.emailSent,
            }));
        }

        this.redis.quit();  // Close the Redis connection after usage
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE product_ingredient;
            DROP TABLE order_item;
            DROP TABLE "order";
            DROP TABLE ingredient;
            DROP TABLE product;
        `);

        // Clean up Redis data
        await this.redis.del('1');
        await this.redis.del('2');
        await this.redis.del('3');

        this.redis.quit();  // Close the Redis connection
    }
}

