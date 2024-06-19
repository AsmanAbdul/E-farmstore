const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON bodies and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware for handling sessions
app.use(session({
  secret: 'your-secret-key', // Replace with a strong secret key in production
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Create a new Pool instance to connect to your PostgreSQL database
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'ISAIAH',
  password: 'Ibokolo22',
  port: 5432, // Default PostgreSQL port
});

async function connect() {
  try {
    await pool.connect();
    console.log("Connected to database");
  } catch (error) {
    console.error("Error connecting to database", error);
  }
}

connect();

// Middleware to check if user is authenticated
function checkAuth(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Define routes for different pages
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/buyer', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'buyer.html'));
});

// POST route for login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM admin WHERE username = $1", [email]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedPassword = user.password; // Assuming the column name is 'password'
      if (storedPassword === password) {
        req.session.user = { username: user.username, userType: user.user_type }; // Store user session
        console.log("Successfully logged in");
        if (user.user_type === 'admin') {
          res.redirect('/admin');
        } else {
          res.redirect('/index');
        }
      } else {
        res.redirect('/login');
      }
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).send('Internal Server Error');
  }
});

// Protect these routes with checkAuth middleware
app.get('/', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/product_list', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'product_list.html'));
});

app.get('/upload', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

app.get('/checkout', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'checkout.html'));
});

app.get('/farmer', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'farmerpage.html'));
});

// Define API endpoint to fetch product data
app.get('/api/products', (req, res) => {
  const products = [
    { name: "Product 1", image: "product1.jpg", price: "Ksh:19.99" },
    { name: "Product 2", image: "product2.jpg", price: "Ksh:29.99" }
  ];
  res.json(products);
});

// POST route for admin login
app.post('/login/admin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM admin WHERE email = $1 AND password = $2', [email, password]);
    if (result.rows.length > 0) {
      req.session.user = { email: email, userType: 'admin' }; // Store email and userType in session
      res.redirect('/index2.html'); // Redirect to index.html
    } else {
      res.redirect('/login'); // Redirect to login page if authentication fails
    }
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Internal Server Error');
  }
});

// POST route for buyer login
app.post('/login/buyer', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM buyers WHERE email = $1 AND password = $2', [email, password]);
    if (result.rows.length > 0) {
      req.session.email = { email };
      res.redirect('/index.html');
    } else {
      res.redirect('/buyer');
    }
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Internal Server Error');
  }
});

// Farmer dashboard 
// POST route for farmer login
app.post('/login/farmer', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM farmers WHERE email = $1 AND password = $2', [email, password]);
    if (result.rows.length > 0) {
      req.session.email = { email };
      res.redirect('/farmerpage.html');
    } else {
      res.redirect('/farmer');
    }
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Internal Server Error');
  }
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// ADMIN ACTION FORM
app.post('/add-buyer', async (req, res) => {
  const { name, email, password, phone } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO buyers (name, email, password, phone) VALUES ($1, $2, $3, $4)',
      [name, email, password, phone]
    );
    res.status(201).send('Buyer added successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding buyer');
  }
});

app.post('/add-farmer', async (req, res) => {
  const { name, email, password, phone } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO farmers (name, email, password, phone) VALUES ($1, $2, $3, $4)',
      [name, email, password, phone]
    );
    res.status(201).send('Farmer added successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding farmer');
  }
});

// Delete Buyer route
app.post('/delete-buyer', async (req, res) => {
  const { email } = req.body;
  console.log(`Attempting to delete buyer with email: ${email}`);
  try {
    const result = await pool.query('DELETE FROM buyers WHERE email = $1', [email]);
    if (result.rowCount === 0) {
      console.log(`Buyer with email ${email} not found`);
      res.status(404).send('Buyer not found');
    } else {
      console.log(`Buyer with email ${email} deleted successfully`);
      res.status(200).send('Buyer deleted successfully');
    }
  } catch (err) {
    console.error(`Error deleting buyer with email ${email}:`, err);
    res.status(500).send('Error deleting buyer');
  }
});

// Delete Farmer route
app.post('/delete-farmer', async (req, res) => {
  const { email } = req.body;
  console.log(`Attempting to delete farmer with email: ${email}`);
  try {
    const result = await pool.query('DELETE FROM farmers WHERE email = $1', [email]);
    if (result.rowCount === 0) {
      console.log(`Farmer with email ${email} not found`);
      res.status(404).send('Farmer not found');
    } else {
      console.log(`Farmer with email ${email} deleted successfully`);
      res.status(200).send('Farmer deleted successfully');
    }
  } catch (err) {
    console.error(`Error deleting farmer with email ${email}:`, err);
    res.status(500).send('Error deleting farmer');
  }
});

// Define a route to fetch orders data
app.get('/orders', async (req, res) => {
  try {
    const query = 'SELECT * FROM orders';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Error fetching orders' });
  }
});

// Endpoint to remove an item from the cart
app.post('/remove-from-cart', async (req, res) => {
  const { productId } = req.body;
  try {
    await pool.query('DELETE FROM cart WHERE product_id = $1', [productId]);
    res.send('Item removed from cart');
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).send('Error removing item from cart');
  }
});

// Endpoint to delete an upload (product)
app.post('/delete-product', async (req, res) => {
  const { productId } = req.body;
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [productId]);
    res.send('Product deleted');
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).send('Error deleting product');
  }
});

// Endpoint to update cart item quantity
app.post('/update-cart', async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    await pool.query('UPDATE cart SET quantity = $1 WHERE product_id = $2', [quantity, productId]);
    res.send('Cart updated');
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).send('Error updating cart');
  }
});

// Endpoint to handle form submission for farmer sign-up
app.post('/farmer-sign', async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    const client = await pool.connect();
    const queryText = 'INSERT INTO farmers(name, email, phone, password) VALUES($1, $2, $3, $4) RETURNING *';
    const values = [name, email, phone, password];

    const result = await client.query(queryText, values);
    client.release();

    console.log('Farmer added:', result.rows[0]);
    res.redirect('/login.html'); // Redirect to login page after successful sign-up
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving farmer data');
  }
});

// Endpoint to handle form submission for buyer sign-up
app.post('/buyer-sign', async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    const client = await pool.connect();
    const queryText = 'INSERT INTO buyers(name, email, phone, password) VALUES($1, $2, $3, $4) RETURNING *';
    const values = [name, email, phone, password];

    const result = await client.query(queryText, values);
    client.release();

    console.log('Buyer added:', result.rows[0]);
    res.redirect('/login.html'); // Redirect to login page after successful sign-up
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving buyer data');
  }
});

// Define a route to handle the form submission for orders
app.post('/submit-order', async (req, res) => {
  const { name, phone, address, product_name, price, quantity } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO orders (name, phone, address, product_name, price, quantity) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, phone, address, product_name, price, quantity]
    );
    res.status(200).send('Order placed successfully');
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).send('An error occurred while placing the order');
  }
});




// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Get the list of products
app.get('/products', (req, res) => {
  const productsFile = path.join(__dirname, 'products.json');
  if (fs.existsSync(productsFile)) {
      const data = fs.readFileSync(productsFile);
      const products = JSON.parse(data);
      res.json(products);
  } else {
      res.json([]);
  }
});



// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
