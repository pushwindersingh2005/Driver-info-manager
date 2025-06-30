const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// MySQL Connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'pushwinder@2005',
    database: 'driverDB'
});

connection.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL');

    connection.query(`
        CREATE TABLE IF NOT EXISTS drivers (
            bbid INT PRIMARY KEY,
            vehicle_no VARCHAR(20),
            driver_name VARCHAR(50),
            mobile_no VARCHAR(10),
            driver_licence VARCHAR(20)
        )
    `, (err) => {
        if (err) console.error('Error creating table:', err);
    });
});

// Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'drive.html')));

app.post('/add-driver', (req, res) => {
    const { bbid, vehicle_no, driver_name, mobile_no, driver_licence } = req.body;

    const query = `INSERT INTO drivers (bbid, vehicle_no, driver_name, mobile_no, driver_licence)
                   VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE
                   vehicle_no=?, driver_name=?, mobile_no=?, driver_licence=?`;

    connection.query(query, [bbid, vehicle_no, driver_name, mobile_no, driver_licence,
                             vehicle_no, driver_name, mobile_no, driver_licence], (err) => {
        if (err) return res.status(500).json({ error: 'Insert failed', details: err });
        res.json({ success: true });
    });
});

app.get('/get-drivers', (req, res) => {
    connection.query('SELECT * FROM drivers', (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch drivers' });
        res.json(results);
    });
});

app.put('/update-driver/:bbid', (req, res) => {
    const { bbid } = req.params;
    const { vehicle_no, driver_name, mobile_no, driver_licence } = req.body;

    const query = `UPDATE drivers SET vehicle_no=?, driver_name=?, mobile_no=?, driver_licence=?
                   WHERE bbid=?`;

    connection.query(query, [vehicle_no, driver_name, mobile_no, driver_licence, bbid], (err) => {
        if (err) return res.status(500).json({ error: 'Update failed' });
        res.json({ success: true });
    });
});

app.delete('/delete-driver/:bbid', (req, res) => {
    const { bbid } = req.params;

    connection.query('DELETE FROM drivers WHERE bbid=?', [bbid], (err) => {
        if (err) return res.status(500).json({ error: 'Delete failed' });
        res.json({ success: true });
    });
});

// Route to get all driver names
app.get('/driver-names', (req, res) => {
    connection.query('SELECT bbid, driver_name FROM drivers', (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch driver names' });
        res.json(results);
    });
});


app.listen(8080, () => {
    console.log('Server running on http://localhost:8080');
});
