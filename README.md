# restaurant

# Table of Contents
- [Problem Statement](#problem-statement)
- [Solution Discussion](#solution-discussion)
- [Installation Instructions](#installation-instructions)
- [Swagger API Docs](#Swagger-API-Docs)

# Problem Statement 

In a system that has three main models; Product, Ingredient, and Order.
A Burger (Product) may have several ingredients:
- 150g Beef
- 30g Cheese
- 20g Onion
The system keeps the stock of each of these ingredients stored in the database. You
can use the following levels for seeding the database:
- 20kg Beef
- 5kg Cheese
- 1kg Onion
When a customer makes an order that includes a Burger. The system needs to update the
stock of each of the ingredients so it reflects the amounts consumed.
Also when any of the ingredients stock level reaches 50%, the system should send an
email message to alert the merchant they need to buy more of this ingredient.
Requirements:
First, Write a controller action that:
1. Accepts the order details from the request payload.
2. Persists the Order in the database.
3. Updates the stock of the ingredients.
Second, ensure that en email is sent once the level of any of the ingredients reach
below 50%. Only a single email should be sent, further consumption of the same
ingredient below 50% shouldn't trigger an email.
Finally, write several test cases that assert the order was correctly stored and the
stock was correctly updated.
The incoming payload may look like this:
{
    "products": 
        [
            {
            "product_id": 1,
            "quantity": 2,
            }
        ]
}

# Solution Discussion

Key Challenges
The main challenge is the need to update the Ingredient table every time an order is placed. Using database transactions for each update can significantly slow down the system, especially under heavy load.

Proposed Solution
To address the performance issues, the following approach was implemented:

1- Redis-Based Queue:

Instead of directly updating the database for each order, a Redis-based queue is used to manage updates asynchronously. This allows for high throughput and reduces the load on the database.

2- Job Processing:

A background job processes the updates to the ingredient stock. This job retrieves data from the Redis queue and performs the necessary updates in the database.

3-Email Notifications:

When an ingredient stock level falls below 50%, a separate job is triggered to send a notification email to the merchant.

# Installation Instructions

1- Clone the repository.

2- To receive emails, add your email address to the .env file as follows: NOTIFICATION_EMAIL=your-email

3- Run the application:

```sh
docker compose up --build
```

4- To stop the application:

```sh
docker compose down
```

5- To run tests:
```sh
npm run test
```

# Swagger API Docs

```sh
http://localhost:3000/doc
```