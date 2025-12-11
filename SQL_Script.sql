DROP TABLE IF EXISTS order_items; 
DROP TABLE IF EXISTS orders;
DROP TABLE menu_items;

CREATE TABLE menu_items
(
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    price DECIMAL (10,2) NOT NULL,
    complexity_score INT NOT NULL
);

INSERT INTO menu_items (item_name, category, price, complexity_score) VALUES
('Coke', 'Drinks', 60.00, 1),
('Sprite', 'Drinks', 60.00, 1),
('Iced Tea', 'Drinks', 80.00, 2),
('Fries', 'Side Dish', 90.00, 3),
('Chicken Wings', 'Side Dish', 350.00, 8),
('Chicken Nuggets', 'Appetizer', 180.00, 4),
('Nachos', 'Appetizer', 150.00, 5),
('Chicken Poppers', 'Appetizer', 190.00, 5),
('Salad', 'Appetizer', 220.00, 6),
('Hotdog', 'Main Dish', 120.00, 4),
('Burger', 'Main Dish', 250.00, 6),
('Burger Steak', 'Main Dish', 280.00, 7),
('Fried Chicken', 'Main Dish', 150.00, 7),
('Buttered Shrimp', 'Main Dish', 480.00, 9),
('Steak', 'Main Dish', 550.00, 10),
('Ice Cream', 'Desserts', 100.00, 1),
('Brownies', 'Desserts', 80.00, 2),
('Mango Graham', 'Desserts', 120.00, 3),
('Blueberry Cheesecake', 'Desserts', 160.00, 3),
('Tiramisu', 'Desserts', 180.00, 4);

CREATE TABLE orders
(
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    table_id VARCHAR(10) NOT NULL,
    
    subtotal DECIMAL(10, 2) NOT NULL,
    service_fee DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    
    -- Metadata
    queue_type VARCHAR(50) DEFAULT 'Dine-In',
    total_complexity_score INT DEFAULT 0,
    
    order_status ENUM('PENDING', 'TO PREPARE', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    order_timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP 
);

CREATE TABLE order_items
(
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,                  -- Foreign Key to orders
    item_id INT NOT NULL,                   -- Foreign Key to menu_items
    item_name VARCHAR(100) NOT NULL,        
    quantity INT NOT NULL,                  
    price_at_order DECIMAL(10, 2) NOT NULL, 
    
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- pandisplay
SELECT * FROM menu_items;
SELECT * FROM order_items;
SELECT * FROM orders;

-- pang reset ng order ID 
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;

SET FOREIGN_KEY_CHECKS = 1;

DELETE FROM orders;