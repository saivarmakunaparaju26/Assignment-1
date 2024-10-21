const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());


app.post('/initialize', async (req, res) => {
    try {
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        const transactions = response.data;

        const stmt = db.prepare("INSERT INTO transactions (title, description, price, category, dateOfSale) VALUES (?, ?, ?, ?, ?)");
        
        transactions.forEach(transaction => {
            stmt.run(transaction.title, transaction.description, transaction.price, transaction.category, transaction.dateOfSale);
        });
        
        stmt.finalize();
        res.status(200).send({ message: 'Database initialized successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error initializing database.' });
    }
});


app.get('/transactions', (req, res) => {
    const { page = 1, per_page = 10, search = '' } = req.query;
    const offset = (page - 1) * per_page;
    const searchQuery = `%${search}%`;

    const sql = `SELECT * FROM transactions WHERE title LIKE ? OR description LIKE ? OR price LIKE ? LIMIT ? OFFSET ?`;
    
    db.all(sql, [searchQuery, searchQuery, searchQuery, per_page, offset], (err, rows) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).json(rows);
        }
    });
});

app.get('/statistics/:month', (req, res) => {
    const month = req.params.month.toLowerCase();
    
    const sql = `SELECT 
        SUM(price) AS totalSales,
        COUNT(*) AS totalSold,
        (SELECT COUNT(*) FROM transactions) - COUNT(*) AS totalNotSold
        FROM transactions 
        WHERE strftime('%m', dateOfSale) = ?`;

    db.get(sql, [month], (err, row) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).json(row);
        }
    });
});

app.get('/bar-chart/:month', (req, res) => {
    const month = req.params.month.toLowerCase();
    
    const sql = `
        SELECT 
            CASE 
                WHEN price BETWEEN 0 AND 100 THEN '0 - 100'
                WHEN price BETWEEN 101 AND 200 THEN '101 - 200'
                WHEN price BETWEEN 201 AND 300 THEN '201 - 300'
                WHEN price BETWEEN 301 AND 400 THEN '301 - 400'
                WHEN price BETWEEN 401 AND 500 THEN '401 - 500'
                WHEN price BETWEEN 501 AND 600 THEN '501 - 600'
                WHEN price BETWEEN 601 AND 700 THEN '601 - 700'
                WHEN price BETWEEN 701 AND 800 THEN '701 - 800'
                WHEN price BETWEEN 801 AND 900 THEN '801 - 900'
                ELSE '901-above'
            END AS priceRange,
            COUNT(*) AS count
        FROM transactions
        WHERE strftime('%m', dateOfSale) = ?
        GROUP BY priceRange`;

    db.all(sql, [month], (err, rows) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).json(rows);
        }
    });
});


app.get('/pie-chart/:month', (req, res) => {
    const month = req.params.month.toLowerCase();
    
    const sql = `
        SELECT category, COUNT(*) AS count
        FROM transactions
        WHERE strftime('%m', dateOfSale) = ?
        GROUP BY category`;

    db.all(sql, [month], (err, rows) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).json(rows);
        }
    });
});


app.get('/combined-data/:month', async (req, res) => {
    const month = req.params.month.toLowerCase();
    
    try {
        const [transactions, statistics, barChart, pieChart] = await Promise.all([
            new Promise((resolve, reject) => {
                db.all(`SELECT * FROM transactions WHERE strftime('%m', dateOfSale) = ?`, [month], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            }),
            new Promise((resolve, reject) => {
                db.get(`SELECT 
                    SUM(price) AS totalSales,
                    COUNT(*) AS totalSold,
                    (SELECT COUNT(*) FROM transactions) - COUNT(*) AS totalNotSold
                    FROM transactions 
                    WHERE strftime('%m', dateOfSale) = ?`, [month], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            }),
            new Promise((resolve, reject) => {
                db.all(`SELECT 
                    CASE 
                        WHEN price BETWEEN 0 AND 100 THEN '0 - 100'
                        WHEN price BETWEEN 101 AND 200 THEN '101 - 200'
                        WHEN price BETWEEN 201 AND 300 THEN '201 - 300'
                        WHEN price BETWEEN 301 AND 400 THEN '301 - 400'
                        WHEN price BETWEEN 401 AND 500 THEN '401 - 500'
                        WHEN price BETWEEN 501 AND 600 THEN '501 - 600'
                        WHEN price BETWEEN 601 AND 700 THEN '601 - 700'
                        WHEN price BETWEEN 701 AND 800 THEN '701 - 800'
                        WHEN price BETWEEN 801 AND 900 THEN '801 - 900'
                        ELSE '901-above'
                    END AS priceRange,
                    COUNT(*) AS count
                FROM transactions
                WHERE strftime('%m', dateOfSale) = ?
                GROUP BY priceRange`, [month], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            }),
            new Promise((resolve, reject) => {
                db.all(`SELECT category, COUNT(*) AS count
                FROM transactions
                WHERE strftime('%m', dateOfSale) = ?
                GROUP BY category`, [month], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            })
        ]);

        res.status(200).json({
            transactions,
            statistics,
            barChart,
            pieChart
        });
    } catch (error) {
        res.status(500).send(error);
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
