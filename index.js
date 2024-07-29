const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// SQLite database setup
const db = new sqlite3.Database('./transactions.db');

// Create transactions table if not exists
db.run(`CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  running_balance REAL
)`);

// API Endpoints

// Get all transactions
app.get('/transactions', (req, res) => {
  db.all('SELECT * FROM transactions', [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ transactions: rows });
  });
});

// Add a new transaction
app.post('/transactions', (req, res) => {
  const { type, amount, description, date } = req.body;
  if (!type || !amount || !date) {
    res.status(400).json({ error: "Please provide all required fields" });
    return;
  }

  const query = `INSERT INTO transactions (type, amount, description, date, running_balance)
                 VALUES (?, ?, ?, ?, ?)`;

  db.run(query, [type, amount, description, date, amount], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: 'Transaction added', id: this.lastID });
  });
});

// Server listening
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
