const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'bankapp-secret-key';

// In-memory DB (replace with MongoDB/RDS in production)
const users = [];
const transactions = {};

// ─── Auth Routes ───────────────────────────────────────────────
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (users.find(u => u.email === email))
    return res.status(400).json({ error: 'User already exists' });

  const hashed = await bcrypt.hash(password, 10);
  const user = { id: Date.now(), name, email, password: hashed, balance: 10000 };
  users.push(user);
  transactions[user.id] = [];
  res.json({ message: 'Registered successfully' });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// ─── Middleware ────────────────────────────────────────────────
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
};

// ─── Banking Routes ───────────────────────────────────────────
app.get('/api/balance', auth, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  res.json({ balance: user.balance });
});

app.post('/api/transfer', auth, (req, res) => {
  const { toEmail, amount } = req.body;
  const sender = users.find(u => u.id === req.user.id);
  const receiver = users.find(u => u.email === toEmail);

  if (!receiver) return res.status(404).json({ error: 'Recipient not found' });
  if (sender.balance < amount) return res.status(400).json({ error: 'Insufficient balance' });

  sender.balance -= amount;
  receiver.balance += amount;

  const tx = { id: Date.now(), type: 'transfer', amount, to: toEmail, date: new Date() };
  transactions[sender.id].push(tx);
  transactions[receiver.id].push({ ...tx, type: 'received', from: sender.email });

  res.json({ message: 'Transfer successful', newBalance: sender.balance });
});

app.get('/api/transactions', auth, (req, res) => {
  res.json(transactions[req.user.id] || []);
});

// ─── AI Chat Route ─────────────────────────────────────────────
app.post('/api/ai-chat', auth, (req, res) => {
  const { message } = req.body;
  const user = users.find(u => u.id === req.user.id);
  const txCount = (transactions[user.id] || []).length;

  // Simple rule-based AI (replace with real LLM in production)
  let reply = '';
  const msg = message.toLowerCase();

  if (msg.includes('balance')) reply = `Your current balance is ₹${user.balance.toLocaleString()}.`;
  else if (msg.includes('transaction')) reply = `You have ${txCount} transaction(s) on record.`;
  else if (msg.includes('transfer')) reply = 'To transfer money, go to the Transfer section and enter recipient email + amount.';
  else if (msg.includes('loan')) reply = 'Loan eligibility check: Based on your account, you may be eligible for up to ₹50,000. Visit a branch for details.';
  else if (msg.includes('fraud') || msg.includes('suspicious')) reply = '🚨 Fraud alert noted! Please call 1800-BANK-HELP immediately. Your account will be reviewed.';
  else reply = `Hello ${user.name}! I'm your AI banking assistant. Ask me about balance, transactions, transfers, or loans.`;

  res.json({ reply });
});

app.get('/health', (req, res) => res.json({ status: 'OK', service: 'AI-BankApp' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🏦 AI BankApp running on port ${PORT}`));
