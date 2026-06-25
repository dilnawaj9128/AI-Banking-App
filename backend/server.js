
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'bankapp-secret-key';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/bankapp';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

const userSchema = new mongoose.Schema({
  name:     String,
  email:    { type: String, unique: true },
  password: String,
  balance:  { type: Number, default: 10000 },
}, { timestamps: true });

const txSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  type:   String,
  amount: Number,
  to:     String,
  from:   String,
  date:   { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', txSchema);

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ error: 'User already exists' });
    const hashed = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashed });
    res.json({ message: 'Registered successfully' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Invalid token' }); }
};

app.get('/api/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ balance: user.balance });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/transfer', auth, async (req, res) => {
  try {
    const { toEmail, amount } = req.body;
    const sender   = await User.findById(req.user.id);
    const receiver = await User.findOne({ email: toEmail });
    if (!receiver) return res.status(404).json({ error: 'Recipient not found' });
    if (sender.balance < amount) return res.status(400).json({ error: 'Insufficient balance' });
    sender.balance   -= amount;
    receiver.balance += amount;
    await sender.save();
    await receiver.save();
    await Transaction.create([
      { userId: sender._id,   type: 'transfer', amount, to: toEmail,       date: new Date() },
      { userId: receiver._id, type: 'received', amount, from: sender.email, date: new Date() },
    ]);
    res.json({ message: 'Transfer successful', newBalance: sender.balance });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/transactions', auth, async (req, res) => {
  try {
    const txs = await Transaction.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(txs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/ai-chat', auth, async (req, res) => {
  try {
    const { message } = req.body;
    const user    = await User.findById(req.user.id);
    const txCount = await Transaction.countDocuments({ userId: req.user.id });
    let reply = '';
    const msg = message.toLowerCase();
    if (msg.includes('balance'))          reply = `Your current balance is ₹${user.balance.toLocaleString()}.`;
    else if (msg.includes('transaction')) reply = `You have ${txCount} transaction(s) on record.`;
    else if (msg.includes('transfer'))    reply = 'Go to Transfer section and enter recipient email + amount.';
    else if (msg.includes('loan'))        reply = 'You may be eligible for up to ₹50,000. Visit a branch for details.';
    else if (msg.includes('fraud'))       reply = '🚨 Fraud alert noted! Call 1800-BANK-HELP immediately.';
    else reply = `Hello ${user.name}! Ask me about balance, transactions, transfers, or loans.`;
    res.json({ reply });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/health', (req, res) => res.json({ status: 'OK', service: 'AI-BankApp' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🏦 AI BankApp running on port ${PORT}`));
