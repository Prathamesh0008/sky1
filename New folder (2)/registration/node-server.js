const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2/promise"); // Use promise-based MySQL
const session = require('express-session');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Sky@2204',
    database: 'prathamesh'
};

const sessionStore = new session.MemoryStore();

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: { secure: false, maxAge: 60000 } // Adjust cookie settings as needed
}));

async function connectDb() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to MySQL Database');
        return connection;
    } catch (err) {
        console.error('Error connecting to the database:', err);
        process.exit(1);
    }
}

const db = connectDb();

// User registration
app.post("/register", async (req, res) => {
    const { fullname, age, email, phno, gender, password } = req.body;

    try {
        const connection = await db;
        const checkQuery = "SELECT * FROM loginusers WHERE email = ?";
        const [result] = await connection.execute(checkQuery, [email]);

        if (result.length > 0) {
            return res.status(409).send("User with this email already exists.");
        }

        const insertQuery = "INSERT INTO loginusers (name, age, email, phno, gender, password) VALUES (?, ?, ?, ?, ?, ?)";
        await connection.execute(insertQuery, [fullname, age, email, phno, gender, password]);

        res.redirect("/login.html");
    } catch (err) {
        console.error('Error in registration:', err);
        res.status(500).send('Server error.');
    }
});

// User login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const connection = await db;
        const query = "SELECT * FROM loginusers WHERE email = ? AND password = ?";
        const [result] = await connection.execute(query, [email, password]);

        if (result.length === 0) {
            return res.status(401).send("Invalid email or password.");
        }

        req.session.user_id = result[0].id;
        req.session.session_id = generateUniqueSessionId();

        console.log('Logged in user ID:', req.session.user_id);
        console.log('Session ID:', req.session.session_id);

        const insertSessionQuery = "INSERT INTO sessions (user_id, session_id) VALUES (?, ?)";
        await connection.execute(insertSessionQuery, [req.session.user_id, req.session.session_id]);

        res.redirect("/index.html");
    } catch (err) {
        console.error('Error in login:', err);
        res.status(500).send('Server error.');
    }
});

// Add to Cart Route
app.post('/cart', async (req, res) => {
    const { user_id, product_id, product_name, quantity, price } = req.body;

    try {
        const connection = await db;
        const [results] = await connection.execute('SELECT * FROM cart WHERE user_id = ? AND product_id = ?', [user_id, product_id]);

        if (results.length > 0) {
            const newQuantity = results[0].quantity + parseInt(quantity);
            await connection.execute('UPDATE cart SET quantity = ?, price = ? WHERE user_id = ? AND product_id = ?', [newQuantity, price, user_id, product_id]);
            res.send('Item updated in cart');
        } else {
            await connection.execute('INSERT INTO cart (user_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)', [user_id, product_id, product_name, quantity, price]);
            res.send('Item added to cart');
        }
    } catch (err) {
        console.error('Error in cart operation:', err);
        res.status(500).send('Database error');
    }
});

app.get('/check-session', (req, res) => {
    res.json({ loggedIn: !!req.session.user_id });
});

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/vitamins', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'vitamins.html'));
});

app.get('/medic', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'medic.html'));
});

app.get('/suppliments', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'suppliments.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Utility function
function generateUniqueSessionId() {
    return crypto.randomBytes(16).toString('hex');
}
