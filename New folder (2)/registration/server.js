const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const session = require('express-session');
const path = require('path');
// const cors = require('cors');
const crypto = require('crypto');


const app = express();
const PORT = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); 
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',       
    password: 'Sky@2204',  
    database: 'prathamesh'    
});


db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to MySQL Database');
});

// Session configuration
app.use(session({
    secret: 'your_secret_key',    
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }     
}));

//  user registration
app.post("/register", (req, res) => {
    const { fullname, age, email, phno, gender, password } = req.body;

    console.log(fullname, age, email, phno, gender, password);

        const checkQuery = "SELECT * FROM loginusers WHERE email = ?";
    db.query(checkQuery, [email], (err, result) => {
        if (err) {
            console.error('Error querying the database:', err);
            return res.status(500).send('Server error.');
        }

                if (result.length > 0) {
            return res.status(409).send("User with this email already exists.");
        }

                const insertQuery = "INSERT INTO loginusers (name, age, email, phno, gender, password) VALUES (?, ?, ?, ?, ?, ?)";
        db.query(insertQuery, [fullname, age, email, phno, gender, password], (err, result) => {
            if (err) {
                console.error('Error inserting user into the database:', err);
                return res.status(500).send('Server error.');
            }

            res.redirect("/login.html");
        });
    });
});

// for user login
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);

    const query = "SELECT * FROM loginusers WHERE email = ? AND password = ?";
    db.query(query, [email, password], (err, result) => {
        if (err) {
            console.error('Error querying the database:', err);
            return res.status(500).send('Server error.');
        }

        if (result.length === 0) {
            return res.status(401).send("Invalid email or password.");
        } else {
            // Set the user ID in the session
            req.session.user_id = result[0].id; 
            const sessionId = generateUniqueSessionId(); // Generate a unique session ID
            req.session.session_id = sessionId; // Store in session

            console.log('Logged in user ID:', req.session.user_id);
            console.log('Session ID:', req.session.session_id); // Log the session ID

            // Insert session ID into the database
            const insertSessionQuery = "INSERT INTO sessions (user_id, session_id) VALUES (?, ?)";
            db.query(insertSessionQuery, [req.session.user_id, sessionId], (err) => {
                if (err) {
                    console.error('Error inserting session into database:', err);
                    return res.status(500).send('Server error.');
                }

                res.redirect("/index.html");
            });
        }
    });
});


// Add to Cart Route
app.post('/cart', (req, res) => {
    const { user_id, product_id, product_name, quantity, price } = req.body;

    // Check if the item already exists in the cart
    connection.query(
        'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
        [user_id, product_id],
        (err, results) => {
            if (err) {
                return res.status(500).send('Database query error');
            }

            if (results.length > 0) {
                // If item exists, update the quantity
                const newQuantity = results[0].quantity + parseInt(quantity);
                connection.query(
                    'UPDATE cart SET quantity = ?, price = ? WHERE user_id = ? AND product_id = ?',
                    [newQuantity, price, user_id, product_id],
                    (updateErr) => {
                        if (updateErr) {
                            return res.status(500).send('Update error');
                        }
                        res.send('Item updated in cart');
                    }
                );
            } else {
                // If item does not exist, insert it
                connection.query(
                    'INSERT INTO cart (user_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)',
                    [user_id, product_id, product_name, quantity, price],
                    (insertErr) => {
                        if (insertErr) {
                            return res.status(500).send('Insert error');
                        }
                        res.send('Item added to cart');
                    }
                );
            }
        }
    );
});




app.get('/check-session', (req, res) => {
    if (req.session.user_id) {
        res.json({ loggedIn: true, userId: req.session.user_id });
    } else {
        res.json({ loggedIn: false });
    }
});


// Serve HTML files
app.use(express.static('public')); 

app.get('/check-session', (req, res) => {
    if (req.session.user_id) {
        res.json({ loggedIn: true });
    } else {
        res.json({ loggedIn: false });
    }
});
function generateUniqueSessionId() {
    return crypto.randomBytes(16).toString('hex'); 
}


app.get('/api/session', (req, res) => {
    const sessionId = generateUniqueSessionId(); 
    res.json({ sessionId }); 
});

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
app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});
app.get('/products', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'products.html'));
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
