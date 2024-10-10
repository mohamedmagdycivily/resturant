import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDbTables1728556419613 implements MigrationInterface {
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

            INSERT INTO product (name) VALUES ('Cheese Burger');

            INSERT INTO ingredient (name, stock) VALUES ('Beef', 20000), ('Cheese', 5000), ('Onion', 1000);

            INSERT INTO product_ingredient (product_id, ingredient_id, amount)
            VALUES 
                ((SELECT id FROM product WHERE name = 'Cheese Burger'), (SELECT id FROM ingredient WHERE name = 'Beef'), 150),
                ((SELECT id FROM product WHERE name = 'Cheese Burger'), (SELECT id FROM ingredient WHERE name = 'Cheese'), 30),
                ((SELECT id FROM product WHERE name = 'Cheese Burger'), (SELECT id FROM ingredient WHERE name = 'Onion'), 20);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE product_ingredient;
            DROP TABLE order_item;
            DROP TABLE "order";
            DROP TABLE ingredient;
            DROP TABLE product;
        `);
    }
}
