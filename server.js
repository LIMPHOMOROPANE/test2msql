// server.js

const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 8081;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Update your MySQL username
    password: 'moropane', // Update your MySQL password
    database: 'WINGCAFE' // Use the created database
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to the database.');
});



// Endpoint to add a user
app.post('/api/users', (req, res) => {
    const user = req.body;

    const username = user.username;
    const password = user.password;
    const position = user.position;
    const idNumber = user.idNumber;
    const phoneNumber = user.phoneNumber;

    const sql = 'INSERT INTO users VALUES(?,?,?,?,?)';
    db.query(sql,[username,password,position,idNumber,phoneNumber], (err, result) => {
        if (err) throw err;
        res.json({ id: result.insertId, ...user });
    });
});

// Endpoint to get all users
app.get('/api/users', (req, res) => {
    const sql = 'SELECT * FROM users';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send(results);
    });
});


// Endpoint to delete a user
app.delete('/api/users/:username', (req, res) => {
    const username = req.params.username;
    
    const sql = 'DELETE FROM users WHERE username = ?';
    db.query(sql, [username], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error deleting user');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('User not found');
        }
        res.send({ message: 'User deleted successfully' });
    });
});

// Endpoint to update a user
app.put('/api/users/:username', (req, res) => {
    const username = req.params.username;
    const user = req.body;

    const sql = 'UPDATE users SET username = ?, password = ?, position = ?, phoneNumber = ? WHERE idNumber = ?';
    db.query(sql, [user.username, user.password, user.position, user.phoneNumber, idNumber], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error updating user');
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).send('User not found');
        }

        res.send({ username, ...user });
    });
});


































// Product Management API Endpoints

// Create Product
app.post('/api/products', (req, res) => {
    const { name, description, category, price, quantity } = req.body;
    const query = 'INSERT INTO products (name, description, category, price, quantity) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [name, description, category, price, quantity], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(201).json({ id: result.insertId, name, description, category, price, quantity });
    });
});

let products = []; // Initialize an empty array to hold products

// Example route for demonstration
app.get('/api/products', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to retrieve products' });
        }
        products = results; // Store products in the variable
        res.status(200).json(products);
    });
});

app.put('/api/products/:name', (req, res) => {
    const { name } = req.params;
    const { quantity } = req.body;

    db.query('UPDATE products SET quantity = ? WHERE name = ?', [quantity, name], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to update stock' });
        }
        
        // Assuming you want to send the updated product list back after an update
        db.query('SELECT * FROM products', (err, updatedProducts) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to retrieve updated product list' });
            }
            res.status(200).json({ message: 'Stock updated successfully', products: updatedProducts });
        });
    });
});

// Delete a product
app.delete('/api/products', (req, res) => {
    const name = req.query.name;

    const productIndex = products.findIndex(product => product.name === name);
    if (productIndex !== -1) {
        products.splice(productIndex, 1);
        res.status(204).send();
    } else {
        res.status(404).send('Product not found');
    }
});













// Update stock for a product
app.put('/api/products/:name', (req, res) => {
    const { name } = req.params;
    const { quantity } = req.body;

    db.query('UPDATE products SET quantity = ? WHERE name = ?', [quantity, name], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to update stock' });
        }
        res.status(200).json({ message: 'Stock updated successfully' });
    });
});


// Endpoint to sell a product
app.post('/api/sell', (req, res) => {
    const { name, quantity } = req.body;

    db.query('SELECT quantity FROM products WHERE name = ?', [name], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching product' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const currentQuantity = results[0].quantity;

        if (currentQuantity < quantity) {
            return res.status(400).json({ message: 'Insufficient quantity in stock' });
        }

        db.query('UPDATE products SET quantity = quantity - ? WHERE name = ?', [quantity, name], (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Error selling product' });
            }
            res.status(200).json({ message: 'Product sold successfully' });
        });
    });
});








// Log a Transaction


app.post('/api/trasactions', (req, res) => {
    const { productId, action, quantity } = req.body;

    // First, we need to get the product details to retrieve the product name and current quantity
    const productQuery = 'SELECT * FROM products WHERE id = ?';
    
    db.query(productQuery, [productId], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        
        if (result.length === 0) {
            return res.status(404).send('Product not found');
        }

        const product = result[0];
        const productName = product.name;
        let remainingQuantity;

        // Calculate remaining quantity based on action
        if (action === 'add') {
            remainingQuantity = product.quantity + quantity;
        } else {
            remainingQuantity = product.quantity - quantity;
        }

        // Prepare the insert query for the transaction
        const query = 'INSERT INTO transactions (product_id, product_name, action, quantity, remaining_quantity) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [productId, productName, action, quantity, remainingQuantity], (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            
            // Optionally update the product's quantity in the product table
            const updateProductQuery = 'UPDATE products SET quantity = ? WHERE id = ?';
            db.query(updateProductQuery, [remainingQuantity, productId], (err, result) => {
                if (err) {
                    return res.status(500).send(err);
                }
                
                res.status(201).json({ id: result.insertId, productId, productName, action, quantity, remainingQuantity });
            });
        });
    });
});



// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});