const express = require('express');
const sql = require('mssql/msnodesqlv8');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'skye-premium-travel-secret-key-change-in-prod'; // JWT Secret

const app = express();

// Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Added PUT/DELETE
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static('.'));

// LEADS API (Smart Wizard)
app.post('/api/leads', async (req, res) => {
    const { name, vibe, budget, whatsapp_url } = req.body;
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .input('vibe', sql.NVarChar, vibe)
            .input('budget', sql.NVarChar, budget)
            .input('whatsapp_url', sql.NVarChar, whatsapp_url)
            .query('INSERT INTO leads (name, vibe, budget, whatsapp_url) OUTPUT INSERTED.id VALUES (@name, @vibe, @budget, @whatsapp_url)');

        res.json({ success: true, id: result.recordset[0].id });
    } catch (err) {
        console.error("Lead Error:", err);
        res.status(500).json({ error: 'Failed to save lead: ' + err.message });
    }
});

// Admin Leads Route
app.get('/api/admin/leads', authenticateToken, async (req, res) => {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin access required' });
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT * FROM leads ORDER BY date DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = 3000;

// Email Configuration (Same as before)

// Email Configuration (Same as before)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'shanshiptech@gmail.com',
        pass: 'wgal flhg vhke xdqg'
    }
});

// Database Configuration
// Database Configuration (Base)
// Database Configuration
const config = {
    connectionString: 'Driver={ODBC Driver 18 for SQL Server};Server=localhost\\SQLEXPRESS;Database=master;Trusted_Connection=yes;TrustServerCertificate=yes;'
};

// Database Initialization & Connection
async function connectAndInitialize() {
    try {
        // Phase 1: Create DB if not exists (Connect to Master)
        let pool = await sql.connect(config);
        console.log('✅ Connected to SQL Server (Master).');

        await pool.request().query(`
            IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'SkyeTravelDB')
            CREATE DATABASE SkyeTravelDB;
        `);
        console.log('Checked/Created Database.');

        await pool.close(); // Close master connection

        // Phase 2: Connect to SkyeTravelDB
        const appConfig = {
            connectionString: 'Driver={ODBC Driver 18 for SQL Server};Server=localhost\\SQLEXPRESS;Database=SkyeTravelDB;Trusted_Connection=yes;TrustServerCertificate=yes;'
        };

        // Override global config for routes to use
        Object.assign(config, appConfig);

        pool = await sql.connect(appConfig);
        console.log('✅ Connected to SkyeTravelDB.');

        // Initialize Tables
        await initializeTables(pool);

    } catch (err) {
        console.error('❌ Database Initialization Failed:', err);
    }
}

async function initializeTables(pool) {
    try {
        // Destinations Table
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='destinations' AND xtype='U')
            CREATE TABLE destinations (
                id INT IDENTITY(1,1) PRIMARY KEY,
                slug NVARCHAR(255) UNIQUE,
                title NVARCHAR(255),
                price NVARCHAR(50),
                image NVARCHAR(MAX),
                rating FLOAT,
                description NVARCHAR(MAX),
                culture NVARCHAR(MAX),
                category NVARCHAR(50)
            )
        `);
        console.log("Destinations table ready.");

        // Bookings Table
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='bookings' AND xtype='U')
            CREATE TABLE bookings (
                id INT IDENTITY(1,1) PRIMARY KEY,
                destination NVARCHAR(255),
                name NVARCHAR(255),
                email NVARCHAR(255),
                phone NVARCHAR(50),
                amount NVARCHAR(50),
                payment_status NVARCHAR(50),
                transaction_id NVARCHAR(255),
                date DATETIME DEFAULT GETDATE()
            )
        `);
        console.log("Bookings table ready.");

        // Contacts Table
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='contacts' AND xtype='U')
            CREATE TABLE contacts (
                id INT IDENTITY(1,1) PRIMARY KEY,
                name NVARCHAR(255),
                email NVARCHAR(255),
                phone NVARCHAR(50),
                message NVARCHAR(MAX),
                date DATETIME DEFAULT GETDATE()
            )
        `);
        console.log("Contacts table ready.");


        // Users Table
        await pool.request().query(`
            IF NOT EXISTS(SELECT * FROM sysobjects WHERE name = 'users' AND xtype = 'U')
            CREATE TABLE users(
            id INT IDENTITY(1, 1) PRIMARY KEY,
            name NVARCHAR(255),
            email NVARCHAR(255) UNIQUE,
            password NVARCHAR(MAX),
            isAdmin BIT DEFAULT 0,
            created_at DATETIME DEFAULT GETDATE()
        )
            `);
        console.log("Users table ready.");

        // Leads Table (Smart Wizard)
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='leads' AND xtype='U')
            CREATE TABLE leads (
                id INT IDENTITY(1,1) PRIMARY KEY,
                name NVARCHAR(255),
                vibe NVARCHAR(50),
                budget NVARCHAR(50),
                whatsapp_url NVARCHAR(MAX),
                date DATETIME DEFAULT GETDATE()
            )
        `);
        console.log("Leads table ready.");

        // Seed Data
        await seedData(pool);

    } catch (err) {
        console.error("Error creating tables:", err);
    }
}

const initialDestinations = require('./data/destinations.json');
const initialLeads = require('./data/leads.json');

async function seedData(pool) {
    try {
        const result = await pool.request().query("SELECT COUNT(*) as count FROM destinations");
        if (result.recordset[0].count === 0) {
            console.log("Seeding data...");
            for (const dest of initialDestinations) {
                const slug = dest.title.split(',')[0].toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

                const request = pool.request();
                request.input('slug', sql.NVarChar, slug);
                request.input('title', sql.NVarChar, dest.title);
                request.input('price', sql.NVarChar, dest.price);
                request.input('image', sql.NVarChar, dest.image);
                request.input('rating', sql.Float, dest.rating);
                request.input('description', sql.NVarChar, dest.description);
                request.input('culture', sql.NVarChar, dest.culture);
                request.input('category', sql.NVarChar, dest.category || 'General');

                await request.query(`
                    INSERT INTO destinations(slug, title, price, image, rating, description, culture, category)
        VALUES(@slug, @title, @price, @image, @rating, @description, @culture, @category)
                `);
            }
            console.log("Data seeded.");
        } else {
            console.log("Destinations data already exists.");
        }

        // Seed Leads
        const leadsResult = await pool.request().query("SELECT COUNT(*) as count FROM leads");
        if (leadsResult.recordset[0].count === 0) {
            console.log("Seeding leads...");
            for (const lead of initialLeads) {
                await pool.request()
                    .input('name', sql.NVarChar, lead.name)
                    .input('vibe', sql.NVarChar, lead.vibe)
                    .input('budget', sql.NVarChar, lead.budget)
                    .input('whatsapp_url', sql.NVarChar, lead.whatsapp_url)
                    .query(`INSERT INTO leads (name, vibe, budget, whatsapp_url) VALUES (@name, @vibe, @budget, @whatsapp_url)`);
            }
            console.log("Leads seeded.");
        } else {
            console.log("Leads data already exists.");
        }
    } catch (err) {
        console.error("Seeding error:", err);
    }
}

connectAndInitialize();

// AUTH ROUTES
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });

    try {
        const pool = await sql.connect(config);

        // Check if exists
        const check = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM users WHERE email = @email');

        if (check.recordset.length > 0) return res.status(400).json({ error: 'Email already registered' });

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert
        await pool.request()
            .input('name', sql.NVarChar, name)
            .input('email', sql.NVarChar, email)
            .input('password', sql.NVarChar, hashedPassword)
            .query(`INSERT INTO users(name, email, password) VALUES(@name, @email, @password)`);

        res.json({ message: 'Registration successful! Please login.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM users WHERE email = @email');

        const user = result.recordset[0];
        if (!user) return res.status(400).json({ error: 'User not found' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ error: 'Invalid password' });

        // Generate Token
        const token = jwt.sign({ id: user.id, email: user.email, isAdmin: user.isAdmin }, SECRET_KEY, { expiresIn: '24h' });

        res.json({ message: 'Login successful', token, user: { name: user.name, email: user.email, isAdmin: user.isAdmin } });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// MIDDLEWARE
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// ADMIN ROUTES
app.get('/api/admin/bookings', authenticateToken, async (req, res) => {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin access required' }); // Basic check

    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT * FROM bookings ORDER BY date DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/contacts', authenticateToken, async (req, res) => {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin access required' });

    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT * FROM contacts ORDER BY date DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/destinations', authenticateToken, async (req, res) => {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin access required' });

    const { title, price, image, rating, description, culture, category } = req.body;
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    try {
        const pool = await sql.connect(config);
        await pool.request()
            .input('slug', sql.NVarChar, slug)
            .input('title', sql.NVarChar, title)
            .input('price', sql.NVarChar, price)
            .input('image', sql.NVarChar, image)
            .input('rating', sql.Float, rating)
            .input('description', sql.NVarChar, description)
            .input('culture', sql.NVarChar, culture)
            .input('category', sql.NVarChar, category)
            .query(`
                INSERT INTO destinations(slug, title, price, image, rating, description, culture, category)
        VALUES(@slug, @title, @price, @image, @rating, @description, @culture, @category)
            `);

        res.json({ message: 'Destination added successfully!' });
    } catch (err) {
        console.error("POST Destination Error:", err);
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/admin/destinations/:id', authenticateToken, async (req, res) => {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin access required' });

    const { id } = req.params;
    const { title, price, image, rating, description, culture, category } = req.body;

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('title', sql.NVarChar, title)
            .input('price', sql.NVarChar, price)
            .input('image', sql.NVarChar, image)
            .input('rating', sql.Float, rating)
            .input('description', sql.NVarChar, description)
            .input('culture', sql.NVarChar, culture)
            .input('category', sql.NVarChar, category)
            .query(`
                UPDATE destinations 
                SET title=@title, price=@price, image=@image, rating=@rating, 
                    description=@description, culture=@culture, category=@category
                WHERE id = @id
            `);

        if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Destination not found' });

        res.json({ message: 'Destination updated successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/destinations/:id', authenticateToken, async (req, res) => {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin access required' });

    const { id } = req.params;

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM destinations WHERE id = @id');

        if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Destination not found' });

        res.json({ message: 'Destination deleted successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API Routes (Updated for MSSQL)
app.post('/api/bookings', async (req, res) => {
    const { destination, name, email, phone } = req.body;
    console.log('Received booking:', req.body);

    if (!destination || !name || !email) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const pool = await sql.connect(config);
        await pool.request().query('USE SkyeTravelDB'); // Ensure DB context

        const request = pool.request();
        request.input('destination', sql.NVarChar, destination);
        request.input('name', sql.NVarChar, name);
        request.input('email', sql.NVarChar, email);
        request.input('phone', sql.NVarChar, phone);
        request.input('price', sql.NVarChar, req.body.price || '0');

        const result = await request.query(`
            INSERT INTO bookings(destination, name, email, phone, amount, payment_status)
            OUTPUT INSERTED.ID
        VALUES(@destination, @name, @email, @phone, @price, 'Pending')
        `);

        const newId = result.recordset[0].ID;
        console.log(`Booking saved.ID: ${newId} `);

        // Send Email
        const mailOptions = {
            from: '"Skye Travel Website" <shanshiptech@gmail.com>',
            to: 'shanshiptech@gmail.com',
            replyTo: email,
            subject: `New Booking Inquiry: ${destination} `,
            text: `
                You have a new booking inquiry(Saved to SQL Server)!
        ------------------------------------------------
            Customer Name: ${name}
                Customer Email: ${email}
        Phone: ${phone}
        Destination: ${destination}
        ------------------------------------------------
            `
        };

        transporter.sendMail(mailOptions, (emailErr, info) => {
            if (emailErr) {
                console.error('Email Send Error:', emailErr);
                res.json({ message: 'Booking saved, email failed', id: newId, emailStatus: 'failed' });
            } else {
                console.log('Email sent: ' + info.response);
                res.json({ message: 'Booking saved and email sent', id: newId, emailStatus: 'sent' });
            }
        });

    } catch (err) {
        console.error('DB Insert Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/contact', async (req, res) => {
    const { name, email, phone, message } = req.body;
    console.log('Received contact msg:', req.body);

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .input('email', sql.NVarChar, email)
            .input('phone', sql.NVarChar, phone)
            .input('message', sql.NVarChar, message)
            .query(`
                INSERT INTO contacts(name, email, phone, message)
                OUTPUT INSERTED.ID
        VALUES(@name, @email, @phone, @message)
            `);

        const newId = result.recordset[0].ID;

        // Send Email
        const mailOptions = {
            from: '"Skye Contact Form" <shanshiptech@gmail.com>',
            to: 'shanshiptech@gmail.com',
            replyTo: email,
            subject: `New Contact Message from ${name} `,
            text: `
                New Contact Message!
        ------------------------------------------------
            Name: ${name}
        Email: ${email}
        Phone: ${phone}
        Message: ${message}
        ------------------------------------------------
            `
        };

        transporter.sendMail(mailOptions, (emailErr, info) => {
            if (emailErr) console.error('Email Send Error:', emailErr);
        });

        res.json({ message: 'Message sent successfully', id: newId });

    } catch (err) {
        console.error('Contact Insert Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/destinations', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        await pool.request().query('USE SkyeTravelDB');

        const result = await pool.request().query("SELECT * FROM destinations");

        const destinations = result.recordset.map(r => ({
            id: r.id,        // Actual Numeric ID from DB
            slug: r.slug,    // URL-friendly slug
            title: r.title,
            price: r.price,
            image: r.image,
            rating: r.rating,
            description: r.description,
            culture: r.culture,
            category: r.category,
            gallery: r.gallery ? JSON.parse(r.gallery) : [],
            nearby: r.nearby ? JSON.parse(r.nearby) : []
        }));
        res.json(destinations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/pay', async (req, res) => {
    const { bookingId, cardDetails } = req.body;

    // MOCK Payment Processing
    console.log(`Processing payment for Booking ${bookingId}...`);

    setTimeout(async () => {
        try {
            const pool = await sql.connect(config);
            const transactionId = 'txn_' + Math.random().toString(36).substr(2, 9);

            await pool.request()
                .input('id', sql.Int, bookingId)
                .input('tid', sql.NVarChar, transactionId)
                .query("UPDATE bookings SET payment_status = 'Paid', transaction_id = @tid WHERE id = @id");

            res.json({ success: true, transactionId });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Payment failed' });
        }
    }, 2000); // Simulate 2s delay
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Server is using MICROSOFT SQL SERVER');
});
